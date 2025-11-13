import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Guide from "../guides/guide.model";

export async function guideVerificationMiddleware(req: Request,res: Response,next: NextFunction
) {
  try {
    const userId = req.userId;
    const userRoles = req.userRoles;

    if (!userId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Checar que tenga rol de guía
    if (!userRoles?.includes("guide")) {
      return res.status(403).json({ error: "No tienes permisos de guía" });
    }

    // Buscar el registro del guía y verificar que esté aprobado
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!guide) {
      return res.status(404).json({ error: "Guía no encontrado" });
    }

    if (!guide.verified) {
      return res.status(403).json({ error: "Guía no verificado" });
    }

    // Todo bien, seguimos al controlador
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar guía" });
  }
}