import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "./review.model";


/* GET /reviews */
export async function listReviews(req: Request, res: Response) {
  try {
    const filter: any = {};

    if (req.query.guideId && mongoose.Types.ObjectId.isValid(req.query.guideId as string)) {
      filter.guideId = new mongoose.Types.ObjectId(req.query.guideId as string);
    }
    if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId as string)) {
      filter.userId = new mongoose.Types.ObjectId(req.query.userId as string);
    }
    if (req.query.experienceId && mongoose.Types.ObjectId.isValid(req.query.experienceId as string)) {
      filter.experienceId = new mongoose.Types.ObjectId(req.query.experienceId as string);
    }
    if (req.query.reservationId && mongoose.Types.ObjectId.isValid(req.query.reservationId as string)) {
      filter.reservationId = new mongoose.Types.ObjectId(req.query.reservationId as string);
    }

    const reviews = await Review.find(filter);
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
    res.status(204).send();
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