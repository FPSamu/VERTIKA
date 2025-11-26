import { Request, Response } from "express";
import Notification from "./notification.model";

// Crear una nueva notificación
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, actorId, type, title, message, data } = req.body;

    const notification = new Notification({
      userId,
      actorId,
      type,
      title,
      message,
      data,
      read: false,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err: any) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Error creating notification" });
  }
};

// Listar notificaciones de un usuario
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // limitar a las 50 más recientes
    res.json(notifications);
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

// Marcar notificación como leída
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true, updatedAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err: any) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Error updating notification" });
  }
};

// Marcar todas las notificaciones de un usuario como leídas
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, updatedAt: new Date() }
    );
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err: any) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ error: "Error updating notifications" });
  }
};