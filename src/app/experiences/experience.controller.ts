import { Request, Response } from "express";
import mongoose from "mongoose";
import Experience from "../experiences/experience.model";

/* GET /experiences */
export async function listExperiences(req: Request, res: Response) {
  try {
    const experiences = await Experience.find();
    res.json(experiences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar experiencias" });
  }
}

/* GET /experiences/:id */
export async function getExperienceById(req: Request, res: Response) {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(experience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener experiencia" });
  }
}

/* POST /experiences (draft) */
export async function createExperience(req: Request, res: Response) {
  try {
    const newExperience = await Experience.create(req.body);
    res.status(201).json(newExperience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear experiencia" });
  }
}

/* PATCH /experiences/:id (editar campos) */
export async function updateExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar experiencia" });
  }
}

/* PATCH /experiences/:id/publish */
export async function publishExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "published" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al publicar experiencia" });
  }
}

/* POST /experiences/:id/republish (clonar como draft) */
export async function republishExperience(req: Request, res: Response) {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });

    const cloned = await Experience.create({
      ...experience.toObject(),
      _id: undefined,
      status: "draft",
      booked: false,
      rating: 0,
      createdAt: new Date(),
      updateDate: new Date(),
    });

    res.status(201).json(cloned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al replicar experiencia" });
  }
}

/* PATCH /experiences/:id/archive */
export async function archiveExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al archivar experiencia" });
  }
}

/* DELETE /experiences/:id */
export async function deleteExperience(req: Request, res: Response) {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar experiencia" });
  }
}