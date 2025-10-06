import { Request, Response } from "express";

/* GET /experiences */
export function listExperiences(req: Request, res: Response) {
  res.json([
    {
      id: "exp1",
      guideId: "g1",
      title: "Ascenso prueba",
      description: "Ascenso de 2 dias, equipo tecnico disponible para rentar",
      activity: "alpinismo",
      location: "Pico de Orizaba",
      difficulty: "dificil",
      date: new Date().toISOString(),
      minGroupSize: 2,
      maxGroupSize: 6,
      pricePerPerson: 8500,
      currency: "MXN",
      photos: [],
      status: "published",
      booked: false,
      rating: 0,
    },
  ]);
}

/* GET /experiences/:id */
export function getExperienceById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

/* POST /experiences (draft) */
export function createExperience(req: Request, res: Response) {
  res.status(201).json({ id: "new_exp_id", status: "draft", booked: false, rating: 0, ...req.body });
}

/* PATCH /experiences/:id (editar campos) */
export function updateExperience(req: Request, res: Response) {
  res.json({ id: req.params.id, ...req.body, updatedAt: new Date().toISOString() });
}

/* PATCH /experiences/:id/publish */
export function publishExperience(req: Request, res: Response) {
  res.json({ id: req.params.id, status: "published" });
}

/* POST /experiences/:id/republish (clonar como draft) */
export function republishExperience(req: Request, res: Response) {
  res
    .status(201)
    .json({ id: "cloned_exp_id", clonedFrom: req.params.id, status: "draft", booked: false, rating: 0 });
}

/* PATCH /experiences/:id/archive */
export function archiveExperience(req: Request, res: Response) {
  res.json({ id: req.params.id, status: "archived" });
}

/* DELETE /experiences/:id */
export function deleteExperience(req: Request, res: Response) {
  res.status(204).send();
}