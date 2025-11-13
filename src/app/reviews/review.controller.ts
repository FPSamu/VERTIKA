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
    const { reservationId, userId, experienceId, guideId, experienceRating, guideRating, comment, photos } = req.body;
    const newReview = await Review.create({
      reservationId,
      userId,
      experienceId,
      guideId,
      experienceRating,
      guideRating,
      comment,
      photos: photos ?? [],
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