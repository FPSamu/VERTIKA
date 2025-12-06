import { Request, Response } from "express";
import Reservation from "../reservations/reservation.model";
import mongoose from "mongoose";
import EmailService from "../services/email.service";
import User from "../users/user.model";
import Experience from "../experiences/experience.model";
import Guide from "../guides/guide.model";
import Notification from "../notifications/notification.model";
import { getIO } from '../../socket';


const emailService = new EmailService();

/* GET /reservations */
export async function listReservations(req: Request, res: Response) {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar reservas" });
  }
}

/* GET /reservations/my-reservations (Vista para usuarios) */
export async function showMyReservationsPage(req: Request, res: Response) {
  try {
    res.render('reservations/my-reservations');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar página" });
  }
}

/* GET /reservations/view/:id (Vista de detalles de reserva) */
export async function showReservationDetailsPage(req: Request, res: Response) {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId')
      .populate({
        path: 'experienceId',
        populate: {
          path: 'guideId',
          populate: {
            path: 'userId'
          }
        }
      })
      .lean();
      
    if (!reservation) {
        return res.status(404).send("Reserva no encontrada");
    }
    
    const r = reservation as any;

    res.render('reservations/reservation-details', {
        layout: 'main',
        reservation: {
            _id: r._id,
            status: r.status,
            seats: r.seats,
            total: r.total,
            createdAt: r.createdAt,
            experience: r.experienceId,
            user: r.userId,
            guide: r.experienceId.guideId // Pass guide info explicitly if needed, or access via experience
        }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cargar página de detalles de reserva");
  }
}

/* GET /reservations/user/:userId (API para obtener reservaciones del usuario) */
export async function getUserReservations(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const reservations = await Reservation.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    })
    .populate('experienceId')
    .sort({ createdAt: -1 });
    
    // Actualizar estado si la experiencia ya terminó
    const updatedReservations = await Promise.all(reservations.map(async (reservation) => {
      const exp = reservation.experienceId as any;
      if (exp) {
        const isCompleted = exp.status === 'completed';
        const isPastDate = new Date(exp.date) < new Date();
        
        // Si la experiencia terminó o ya pasó la fecha, y la reserva está confirmada
        if ((isCompleted || isPastDate) && reservation.status === 'confirmed') {
          reservation.status = 'completed';
          await reservation.save();
        }
      }
      return reservation;
    }));
    
    res.json(updatedReservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reservaciones del usuario" });
  }
}

/* GET /reservations/:id */
export async function getReservationById(req: Request, res: Response) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
}

/* POST /reservations */
export async function createReservation(req: Request, res: Response) {
  try {
    const { experienceId, userId, seats, total, status } = req.body;

    // Validar campos requeridos
    if (!experienceId || !userId || !seats || !total) {
      return res.status(400).json({ error: "Faltan campos requeridos: experienceId, userId, seats, total" });
    }

    // Validar experienceId válido
    if (!mongoose.Types.ObjectId.isValid(experienceId)) {
      return res.status(400).json({ error: "ID de experiencia inválido" });
    }

    // 1. BUSCAR LA EXPERIENCIA PRIMERO
    const experienceToCheck = await Experience.findById(experienceId);
    if (!experienceToCheck) {
      return res.status(404).json({ error: "Experiencia no encontrada" });
    }

    // Validar que el guía no reserve su propia experiencia
    const guide = await Guide.findById(experienceToCheck.guideId);
    if (guide && guide.userId.toString() === userId) {
      return res.status(403).json({ error: "No puedes reservar tu propia experiencia" });
    }

    // 2. VERIFICAR SI YA ESTÁ RESERVADA (BOOKED)
    // Esto evita que alguien reserve si ya está ocupada
    if (experienceToCheck.booked) {
      return res.status(409).json({ error: "Lo sentimos, esta experiencia ya ha sido reservada por otro usuario." });
    }

    // Validar userId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Validar seats positivo
    if (seats <= 0) {
      return res.status(400).json({ error: "El número de asientos debe ser mayor a 0" });
    }

    const newReservation = await Reservation.create({
      experienceId,
      userId,
      seats,
      total,
      status: 'confirmed'
    });
    //Experiencia reservada
    experienceToCheck.booked = true;
    await experienceToCheck.save();
    // Obtener información del usuario y experiencia para el email
    try {
      const user = await User.findById(userId);
      const experience = await Experience.findById(experienceId);

      console.log("experience.guideId:", experience!.guideId);
      console.log("guide userId:", experience!.userId);    

      if (user && experience) {
        
        const photos = experienceToCheck.photos as string[];

        const mainImage = photos && photos.length > 0 
          ? photos[0] 
          : '';
        // Enviar email de confirmación
        await emailService.sendReservationConfirmedEmail(
          user.email,
          user.name,
          experience.title as string,
          experience.date as Date,
          experience.location as string,
          seats,
          total,
          (experience.currency as string) || 'MXN',
          mainImage
        );
        console.log(`Email de confirmación enviado a ${user.email}`);
        //Notificacion
        const guide = await Guide.findById(experience.guideId);
        const guideUserId = guide?.userId;

        if (guideUserId) {
          const guideNotification = new Notification({
            userId: guideUserId,   // user._id del guia
            actorId: user._id,     // quien hizo la accion
            type: "reservation",
            title: "Nueva reserva confirmada",
            message: `${user.name} ha reservado tu experiencia "${experience.title}"`,
            data: {
              reservationId: newReservation._id,
              experienceId: experience._id,
            },
            read: false,
          });

          await guideNotification.save()
          console.log("Notificación creada para el guía:", guideNotification);
          //envia la notification al room del user
          getIO().to(guideUserId.toString()).emit('newNotification', guideNotification);
          console.log('Evento newNotification emitido por socket', guideNotification);
            
          
          console.log('Evento newReservation emitido', newReservation);
        }
      }//If cierra
    } catch (emailError) {
      console.error('Error al enviar email de confirmación:', emailError);
      // No fallar la creación de la reserva si el email falla
    }
    res.status(201).json(newReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear reserva" });
  }
}


/* PATCH /reservations/:id */
export async function updateReservation(req: Request, res: Response) {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Reserva no encontrada" });
    // Si el status cambió a 'cancelled', avisar al guía
    if (req.body.status === 'cancelled') {
      // Buscar la experiencia relacionada
      await Experience.findByIdAndUpdate(updated.experienceId, { booked: false });
      const experience = await Experience.findById(updated.experienceId);
      if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });

      // Buscar al guía
      const guide = await Guide.findById(experience.guideId);
      const guideUserId = guide?.userId;

      // Buscar al usuario que canceló la reserva
      const cancellingUser = await User.findById(updated.userId);

      if (guideUserId && cancellingUser) {
        const guideNotification = new Notification({
          userId: guideUserId,   // user._id del guía
          actorId: cancellingUser._id, // quien canceló
          type: "reservation",
          title: "Reserva cancelada",
          message: `${cancellingUser.name} ha cancelado su reserva en "${experience.title}"`,
          data: {
            reservationId: updated._id,
            experienceId: experience._id,
          },
          read: false,
        });

        await guideNotification.save();
        console.log("Notificación creada para el guía:", guideNotification);

        // Emitir evento Socket.IO al room del guía
        getIO().to(guideUserId.toString()).emit('newNotification', guideNotification);
        console.log('Evento newNotification emitido por socket', guideNotification);
      }
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
}

/* PATCH /reservations/:id/cancel */
export async function cancelReservation(req: Request, res: Response) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    // Actualizar status a cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    // Notificar al guía
    const experience = await Experience.findById(reservation.experienceId);
    if (experience) {

      experience.booked = false;
      await experience.save();

      const guide = await Guide.findById(experience.guideId);
      const guideUserId = guide?.userId;
      const cancellingUser = await User.findById(reservation.userId);

      if (guideUserId && cancellingUser) {
        const guideNotification = new Notification({
          userId: guideUserId,
          actorId: cancellingUser._id,
          type: "reservation",
          title: "Reserva cancelada",
          message: `${cancellingUser.name} ha cancelado su reserva en "${experience.title}"`,
          data: {
            reservationId: reservation._id,
            experienceId: experience._id,
          },
          read: false,
        });

        await guideNotification.save();
        getIO().to(guideUserId.toString()).emit('newNotification', guideNotification);
      }
    }

    res.status(200).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
}

/* DELETE /reservations/:id */
export async function deleteReservation(req: Request, res: Response) {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Reserva no encontrada" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar reserva" });
  }
}

