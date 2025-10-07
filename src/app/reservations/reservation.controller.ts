import { Request, Response } from "express";

/* GET /reservations */
export function listReservations(req: Request, res: Response) {
  res.json([
    {
      id: "res1",
      experienceId: "exp1",
      userId: "user1",
      seats: 2,
      status: "pending",
      total: 17000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
}

/* GET /reservations/:id */
export function getReservationById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

/* POST /reservations */
export function createReservation(req: Request, res: Response) {
  const now = new Date().toISOString();
  res.status(201).json({
    id: "new_res_id",
    status: "pending",
    ...req.body,
    createdAt: now,
    updatedAt: now,
  });
}

/* PATCH /reservations/:id */
export function updateReservation(req: Request, res: Response) {
  res.json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
}

/* PATCH /reservations/:id/status */
export function updateReservationStatus(req: Request, res: Response) {
  const { status } = req.body;
  res.json({
    id: req.params.id,
    status: status ?? "pending",
    updatedAt: new Date().toISOString(),
  });
}

/* DELETE /reservations/:id */
export function deleteReservation(req: Request, res: Response) {
  res.status(204).send();
}