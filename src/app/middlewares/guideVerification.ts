// guideVerification.middleware.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Guide from "../guides/guide.model";

// Extendemos Request para tener tipado del user del authMiddleware
interface AuthRequestWithUser extends Request {
  user?: {
    userId: string;
    roles: string[];
    emailVerified: boolean;
  };
}

export async function guideVerificationMiddleware(
  req: AuthRequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // // Checar que tenga rol de guía
    // if (!user.roles.includes("guide")) {
    //   return res.status(403).json({ error: "No tienes permisos de guía" });
    // }

    // Buscar el registro del guía y verificar que esté aprobado
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(user.userId) });
    if (!guide) {
      return res.status(404).json({ error: "Guía no encontrado" });
    }

    if (!guide.verified) {
      return res.status(403).json({ error: "Guía no verificado" });
    }

    // Todo bien, podemos continuar
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al verificar guía" });
  }
}