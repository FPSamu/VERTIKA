import { Router } from "express";
import {
  listReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview
} from "./review.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Endpoints de reseñas
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Listar reseñas
 *     description: Obtiene todas las reseñas. Puede filtrarse por query params (p.ej. experienceId, guideId, userId, reservationId).
 *     parameters:
 *       - in: query
 *         name: experienceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: guideId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: reservationId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas obtenida correctamente
 */
router.get("/", listReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener una reseña por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *       404:
 *         description: No encontrada
 */
router.get("/:id", getReviewById);

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear una nueva reseña
 *     description: Crear una reseña asociada a una reserva. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - userId
 *               - experienceId
 *               - guideId
 *             properties:
 *               reservationId:
 *                 type: string
 *               userId:
 *                 type: string
 *               experienceId:
 *                 type: string
 *               guideId:
 *                 type: string
 *               experienceRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               guideRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Reseña creada correctamente
 */
router.post("/", authMiddleware, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Actualizar una reseña existente
 *     description: Permite modificar campos de la reseña (ratings, comment, photos). Requiere autenticación.
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
 *               experienceRating: 4
 *               guideRating: 5
 *               comment: "Comentario actualizado"
 *               photos: ["https://example.com/newphoto.jpg"]
 *     responses:
 *       200:
 *         description: Reseña actualizada
 */
router.patch("/:id", authMiddleware, updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Eliminar una reseña
 *     description: Elimina una reseña por su ID. Requiere autenticación.
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
router.delete("/:id", authMiddleware, deleteReview);

export default router;