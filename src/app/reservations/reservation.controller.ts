import { Request, Response } from "express";
import Reservation from "../reservations/reservation.model";
import mongoose from "mongoose";

/* GET /reservations */
export async function listReservations(req: Request, res: Response) {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar reservas" });
  }
}

/* GET /reservations/:id */
export async function getReservationById(req: Request, res: Response) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
}

/* POST /reservations */
export async function createReservation(req: Request, res: Response) {
  try {
    const { experienceId, userId, seats, total, status } = req.body;

    const newReservation = await Reservation.create({
      experienceId,
      userId,
      seats,
      total,
      status, // opcional, por defecto 'pending'
    });

    res.status(201).json(newReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear reserva" });
  }
}


/* PATCH /reservations/:id */
export async function updateReservation(req: Request, res: Response) {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
}

/* DELETE /reservations/:id */
export async function deleteReservation(req: Request, res: Response) {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Reserva no encontrada" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar reserva" });
  }
}