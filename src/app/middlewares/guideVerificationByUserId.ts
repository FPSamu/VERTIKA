// guideVerificationByUserId.middleware.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Guide from "../guides/guide.model";
import User from "../users/user.model";

// Middleware que verifica si el userId del body corresponde a un guía verificado
export async function guideVerificationByUserIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido en el body" });
    }

    // Validar que el userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "userId no es un ObjectId válido" });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que el usuario tenga rol de guía
    if (!user.roles.includes("guide")) {
      return res.status(403).json({ error: "El usuario no tiene permisos de guía" });
    }

    // Buscar el registro del guía y verificar que esté aprobado
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!guide) {
      return res.status(404).json({ error: "Guía no encontrado en la colección de guides" });
    }

    if (!guide.verified) {
      return res.status(403).json({ error: "El guía no está verificado" });
    }

    // Todo bien, podemos continuar
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar guía" });
  }
}
