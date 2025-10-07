import { Request, Response } from "express";

/* GET /reviews */
export function listReviews(req: Request, res: Response) {
  res.json([
    {
      id: "rev1",
      reservationId: "res1",
      userId: "user1",
      experienceId: "exp1",
      guideId: "g1",
      experienceRating: 5,
      guideRating: 5,
      comment: "Excelente experiencia, guía muy profesional.",
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
}

/* GET /reviews/:id */
export function getReviewById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

/* POST /reviews */
export function createReview(req: Request, res: Response) {
  const now = new Date().toISOString();
  res.status(201).json({
    id: "new_rev_id",
    ...req.body,
    photos: req.body.photos ?? [],
    createdAt: now,
    updatedAt: now,
  });
}

/* PATCH /reviews/:id */
export function updateReview(req: Request, res: Response) {
  res.json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
}

/* DELETE /reviews/:id */
export function deleteReview(req: Request, res: Response) {
  res.status(204).send();
}