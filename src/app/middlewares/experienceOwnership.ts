// experienceOwnership.middleware.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Experience from "../experiences/experience.model";
import Guide from "../guides/guide.model";

// Middleware que verifica si el usuario autenticado es dueño de la experiencia
export async function experienceOwnershipMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const experienceId = req.params.id;
    const authenticatedUserId = (req as any).user?.userId;

    //console.log("Authenticated User ID:", authenticatedUserId);

    if (!authenticatedUserId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Validar que el experienceId sea válido
    if (!mongoose.Types.ObjectId.isValid(experienceId)) {
      return res.status(400).json({ error: "ID de experiencia no válido" });
    }

    // Buscar la experiencia
    const experience = await Experience.findById(experienceId);
    if (!experience) {
       //console.log("Experience found:", experience);
      return res.status(404).json({ error: "Experiencia no encontrada" });
    }

    // Buscar el guía del usuario autenticado
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(authenticatedUserId) });
    //console.log("Guide found:", guide);
    if (!guide) {
      return res.status(403).json({ error: "No eres un guía registrado" });
    }

    //console.log("Experience guideId:", experience.guideId);
    //console.log("Guide _id:", guide._id.toString());

    // Verificar que el guideId de la experiencia coincida con el _id del guía
    if ((experience.guideId as any).toString() !== guide._id.toString()) {
      return res.status(403).json({ error: "No tienes permisos para modificar esta experiencia" });
    }

    // Todo bien, el usuario es dueño de la experiencia
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar propiedad de la experiencia" });
  }
}
