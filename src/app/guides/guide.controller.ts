import { Request, Response } from "express";

/* GET /guides */
export function listGuides(req: Request, res: Response) {
  res.json([
    { id: "g1", userId: "u1", bio: "Guía dummy", rating: 0, verified: false },
  ]);
}

/* GET /guides/:id */
export function getGuideById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

/*POST /guides */
export function createGuide(req: Request, res: Response) {
  res.status(201).json("Nuevo guia");
}

/*PATCH /guides/:id */
export function updateGuide(req: Request, res: Response) {
  res.json({ id: req.params.id, ...req.body });
}

/* DELETE /guides/:id */
export function deleteGuide(req: Request, res: Response) {
  const { id } = req.params;
  console.log("Eliminar guia:", id);
  res.status(204).send();
}