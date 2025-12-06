import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../users/user.model";
import Experience from "../experiences/experience.model";
import Review from "./review.model";
import Reservation from "../reservations/reservation.model";


/* GET /reviews/new/:reservationId (Vista para crear review) */
export async function showCreateReviewPage(req: Request, res: Response) {
  try {
    const reservation = await Reservation.findById(req.params.reservationId)
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

    // Verificar si ya existe una review para esta reserva
    const existingReview = await Review.findOne({ reservationId: req.params.reservationId });
    if (existingReview) {
      return res.status(400).send("Ya has dejado una reseña para esta experiencia.");
    }

    res.render('reviews/create-review', { 
      layout: false, // Usamos layout false porque el archivo ya tiene estructura HTML completa
      reservation 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cargar página de reseña");
  }
}

/* GET /reviews */
export async function listReviews(req: Request, res: Response) {
  try {
    const filter: any = {};

    // Soportar tanto params como query
    const guideId = req.params.guideId || req.query.guideId;
    const userId = req.params.userId || req.query.userId;
    const experienceId = req.params.experienceId || req.query.experienceId;
    const reservationId = req.query.reservationId;

    if (guideId && mongoose.Types.ObjectId.isValid(guideId as string)) {
      filter.guideId = new mongoose.Types.ObjectId(guideId as string);
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
      filter.userId = new mongoose.Types.ObjectId(userId as string);
    }
    if (experienceId && mongoose.Types.ObjectId.isValid(experienceId as string)) {
      filter.experienceId = new mongoose.Types.ObjectId(experienceId as string);
    }
    if (reservationId && mongoose.Types.ObjectId.isValid(reservationId as string)) {
      filter.reservationId = new mongoose.Types.ObjectId(reservationId as string);
    }

    const reviews = await Review.find(filter)
      .populate('userId', 'name avatarUrl')
      .populate('experienceId', 'title')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar reviews" });
  }
}

/* GET /reviews/:id */
export async function getReviewById(req: Request, res: Response) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review no encontrada" });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener review" });
  }
}

/* POST /reviews */
export async function createReview(req: Request, res: Response) {
  try {
    // Si hay fotos subidas, Multer las habrá procesado
    const files = req.files as Express.MulterS3.File[];
    const photoUrls = files && files.length > 0 ? files.map(file => file.location) : [];

    const { reservationId, userId, experienceId, guideId, experienceRating, guideRating, comment } = req.body;
    
    const newReview = await Review.create({
      reservationId,
      userId,
      experienceId,
      guideId,
      experienceRating,
      guideRating,
      comment,
      photos: photoUrls,
    });
    
    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear review" });
  }
}

/* PATCH /reviews/:id */
export async function updateReview(req: Request, res: Response) {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Review no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar review" });
  }
}

/* DELETE /reviews/:id */
export async function deleteReview(req: Request, res: Response) {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review no encontrada" });
    res.status(200).json({ message: "Review eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar review" });
  }
}

/* POST /reviews/:id/upload-photos (agregar fotos a review existente) */
export async function uploadReviewPhotos(req: Request, res: Response) {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: "Review no encontrada" });
    }

    // Verificar que el usuario sea el dueño de la review
    const userId = (req as any).user?._id;
    if ((review.userId as any).toString() !== userId) {
      return res.status(403).json({ error: "No tienes permisos para modificar esta review" });
    }

    // Multer ya subió las imágenes a S3, ahora obtenemos las URLs
    const files = req.files as Express.MulterS3.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron imágenes" });
    }

    // Obtener las URLs de las fotos subidas
    const photoUrls = files.map(file => file.location);

    // Agregar las nuevas URLs al array de fotos existente
    const currentPhotos = (review.photos as string[]) || [];
    review.photos = [...currentPhotos, ...photoUrls];
    await review.save();

    res.status(200).json({
      message: "Fotos subidas correctamente",
      photos: photoUrls,
      review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al subir fotos de review" });
  }
}