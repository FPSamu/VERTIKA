import { Router } from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.controller";

import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Crear notificación 
router.post("/", authMiddleware, createNotification);

// Obtener notificaciones de un usuario
router.get("/:userId", authMiddleware,getUserNotifications);

// Marcar una notificación como leída
router.patch("/:id/read", authMiddleware, markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch("/:userId/read-all", authMiddleware, markAllAsRead);

export default router;