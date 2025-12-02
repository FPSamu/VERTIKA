import { Router } from "express";
import {
  listReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
  showMyReservationsPage,
  getUserReservations,
  confirmReservation,
} from "./reservation.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Endpoints de reservas
 */

/**
 * @swagger
 * /api/reservations/my-reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Página de mis reservaciones
 *     responses:
 *       200:
 *         description: Página renderizada
 */
router.get("/my-reservations", showMyReservationsPage);

/**
 * @swagger
 * /api/reservations/confirm/{reservationId}/{token}:
 *   get:
 *     tags: [Reservations]
 *     summary: Confirmar reservación con token de email
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservación confirmada exitosamente
 */
router.get("/confirm/:reservationId/:token", confirmReservation);

/**
 * @swagger
 * /api/reservations/user/{userId}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reservaciones de un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reservaciones del usuario
 */
router.get("/user/:userId", authMiddleware, getUserReservations);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservas
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida correctamente
 */
router.get("/", listReservations);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener una reserva por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       404:
 *         description: No encontrada
 */
router.get("/:id", getReservationById);

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Crear una nueva reserva
 *     description: Crear una reserva para una experiencia. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - experienceId
 *               - userId
 *               - seats
 *               - total
 *             properties:
 *               experienceId:
 *                 type: string
 *                 example: "69151fdb25a16fe4e4157ccc"
 *               userId:
 *                 type: string
 *                 example: "69151fa525a16fe4e4157ccb"
 *               seats:
 *                 type: number
 *                 example: 2
 *               total:
 *                 type: number
 *                 example: 17000
 *               status:
 *                 type: string
 *                 enum: ["pending", "confirmed", "cancelled"]
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 */
router.post("/", authMiddleware, createReservation);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     tags: [Reservations]
 *     summary: Cancelar reserva
 *     description: Cancela una reservación cambiando su estado a 'cancelled'.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada
 *       404:
 *         description: Reserva no encontrada
 */
router.patch("/:id/cancel", cancelReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Actualizar una reserva existente
 *     description: Permite modificar cualquier campo de la reserva (por ejemplo seats, total o status). Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               seats: 3
 *               total: 25500
 *               status: "confirmed"
 *     responses:
 *       200:
 *         description: Reserva actualizada
 */
router.patch("/:id", authMiddleware, updateReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Eliminar una reserva
 *     description: Elimina una reserva por su ID. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eliminada correctamente
 */
router.delete("/:id", authMiddleware, deleteReservation);

export default router;