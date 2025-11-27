import { Request, Response } from "express";
import Reservation from "../reservations/reservation.model";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import EmailService from "../services/email.service";
import User from "../users/user.model";
import Experience from "../experiences/experience.model";
import Guide from "../guides/guide.model";
import Notification from "../notifications/notification.model";
import { getIO} from '../../index';


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

/* GET /reservations/user/:userId (API para obtener reservaciones del usuario) */
export async function getUserReservations(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const reservations = await Reservation.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    })
    .populate('experienceId')
    .sort({ createdAt: -1 });
    
    res.json(reservations);
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

    // Generar token de confirmación
    const confirmationToken = randomBytes(32).toString('hex');
    const confirmationTokenExpires = new Date();
    confirmationTokenExpires.setHours(confirmationTokenExpires.getHours() + 48); // 48 horas

    const newReservation = await Reservation.create({
      experienceId,
      userId,
      seats,
      total,
      status: status || 'pending',
      confirmationToken,
      confirmationTokenExpires,
    });

    // Obtener información del usuario y experiencia para el email
    try {
      const user = await User.findById(userId);
      const experience = await Experience.findById(experienceId);

      console.log("experience.guideId:", experience!.guideId);
      console.log("guide userId:", experience!.userId);    

      if (user && experience) {
        // Enviar email de confirmación
        await emailService.sendReservationConfirmationEmail(
          user.email,
          user.name,
          experience.title as string,
          experience.date as Date,
          experience.location as string,
          seats,
          total,
          (experience.currency as string) || 'MXN',
          (newReservation._id as mongoose.Types.ObjectId).toString(),
          confirmationToken
        );

        //Notificacion
        const guide = await Guide.findById(experience.guideId);
        const guideUserId = guide?.userId;

        if (guideUserId) {
          const guideNotification = new Notification({
            userId: guideUserId,   // user._id del guia
            actorId: user._id,     // quien hizo la accion
            type: "reservation",
            title: "Nueva reserva",
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

/* GET /reservations/confirm/:reservationId/:token */
export async function confirmReservation(req: Request, res: Response) {
  try {
    const { reservationId, token } = req.params;

    // Buscar la reservación con el token
    const reservation = await Reservation.findById(reservationId)
      .populate('experienceId')
      .populate('userId');

    if (!reservation) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reservación no encontrada</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 500px; margin: 0 auto; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>La reservación no fue encontrada.</p>
            <a href="/" style="color: #667eea;">Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar que el token coincida
    if (reservation.confirmationToken !== token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Token inválido</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 500px; margin: 0 auto; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Token Inválido</h1>
            <p>El enlace de confirmación no es válido.</p>
            <a href="/" style="color: #667eea;">Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar que el token no haya expirado
    if (reservation.confirmationTokenExpires && new Date() > reservation.confirmationTokenExpires) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Enlace Expirado</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 500px; margin: 0 auto; }
            h1 { color: #ff9800; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⏰ Enlace Expirado</h1>
            <p>El enlace de confirmación ha expirado (48 horas).</p>
            <p>Por favor, crea una nueva reservación.</p>
            <a href="/" style="color: #667eea;">Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar que la reservación no esté ya confirmada
    if (reservation.status === 'confirmed') {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Ya Confirmada</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 500px; margin: 0 auto; }
            h1 { color: #48bb78; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Ya Confirmada</h1>
            <p>Esta reservación ya fue confirmada anteriormente.</p>
            <a href="/api/reservations/my-reservations" style="color: #667eea;">Ver mis reservaciones</a>
          </div>
        </body>
        </html>
      `);
    }

    // Actualizar el estado a confirmado
    reservation.status = 'confirmed';
    reservation.confirmationToken = undefined;
    reservation.confirmationTokenExpires = undefined;
    await reservation.save();

    // Enviar email de confirmación exitosa
    const user = reservation.userId as any;
    const experience = reservation.experienceId as any;

    if (user && experience) {
      try {
        await emailService.sendReservationConfirmedEmail(
          user.email,
          user.name,
          experience.title,
          experience.date,
          experience.location,
          reservation.seats as number,
          reservation.total as number,
          experience.currency || 'MXN'
        );
      } catch (emailError) {
        console.error('Error al enviar email de confirmación exitosa:', emailError);
      }
    }

    // Mostrar página de éxito
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reservación Confirmada</title>
        <style>
          body { 
            font-family: Arial; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            margin: 0;
          }
          .container { 
            background: white; 
            color: #333; 
            padding: 40px; 
            border-radius: 15px; 
            max-width: 600px; 
            margin: 0 auto; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 { 
            color: #48bb78; 
            margin-bottom: 20px;
          }
          .reservation-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
          }
          .detail-row {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>¡Reservación Confirmada!</h1>
          <p>Tu reservación ha sido confirmada exitosamente.</p>
          
          <div class="reservation-details">
            <div class="detail-row">
              <strong>Experiencia:</strong> ${experience.title}
            </div>
            <div class="detail-row">
              <strong>Fecha:</strong> ${new Date(experience.date).toLocaleDateString('es-MX', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </div>
            <div class="detail-row">
              <strong>Ubicación:</strong> ${experience.location}
            </div>
            <div class="detail-row">
              <strong>Personas:</strong> ${reservation.seats}
            </div>
          </div>
          
          <p>Hemos enviado un email de confirmación con todos los detalles.</p>
          <p>El guía se pondrá en contacto contigo pronto.</p>
          
          <a href="/api/reservations/my-reservations" class="button">Ver Mis Reservaciones</a>
          <br><br>
          <a href="/api" style="color: #667eea;">Volver al inicio</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error al confirmar reservación:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Error</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .container { background: white; color: #333; padding: 40px; border-radius: 15px; max-width: 500px; margin: 0 auto; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <p>Ocurrió un error al confirmar la reservación.</p>
          <a href="/" style="color: #667eea;">Volver al inicio</a>
        </div>
      </body>
      </html>
    `);
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