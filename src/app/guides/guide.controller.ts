import { Request, Response } from "express";
import mongoose from "mongoose";
import Guide from "../guides/guide.model";

/* GET /guides */
export async function listGuides(req: Request, res: Response) {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const guides = await Guide.find();
    const userIds = guides.map(g => g.userId);

    const users = await mongoose.connection.db
      .collection("users")
      .find({ _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .project({ name: 1, email: 1 })
      .toArray();

    const guidesWithUser = guides.map(guide => {
      const user = users.find(u => u._id.equals(guide.userId));
      return {
        ...guide.toObject(),
        user: user ? { name: user.name, email: user.email } : null
      };
    });

    res.json(guidesWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar guías" });
  }
}

/* GET /guides/:id */
export async function getGuideById(req: Request, res: Response) {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "Guía no encontrada" });

    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const user = await mongoose.connection.db
      .collection("users")
      .findOne(
        { _id: new mongoose.Types.ObjectId(guide.userId) },
        { projection: { name: 1, email: 1 } }
      );

    const guideWithUser = {
      ...guide.toObject(),
      user: user ? { name: user.name, email: user.email } : null
    };

    res.json(guideWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener guía" });
  }
}

/*POST /guides */
export async function createGuide(req: Request, res: Response) {
    try {
        const { userId, bio, experienceYears, languages, certifications, specialties } = req.body;
        const newGuide = await Guide.create({
            userId,
            bio,
            experienceYears,
            languages,
            certifications,
            specialties,
        });
        res.status(201).json(newGuide);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear guía" });
    }
}

/*PATCH /guides/:id */
export async function updateGuide(req: Request, res: Response) {
    try {
        const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!guide) return res.status(404).json({ error: "Guía no encontrada" });
        res.json(guide);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar guía" });
    }
}

/* DELETE /guides/:id */
export async function deleteGuide(req: Request, res: Response) {
    try {
        const guide = await Guide.findByIdAndDelete(req.params.id);
        if (!guide) return res.status(404).json({ error: "Guía no encontrada" });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar guía" });
    }
}