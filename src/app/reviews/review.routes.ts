import { Router } from "express";
import {
  listReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  uploadReviewPhotos as uploadPhotosController
} from "./review.controller";
import { authMiddleware } from "../middlewares/auth";
import { uploadReviewPhotos } from "../middlewares/upload/upload_s3_review";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Endpoints de reseñas
 */

/**
 * @swagger
 * /api/reviews:
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
 * /api/reviews/experience/{experienceId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas por experiencia
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/experience/:experienceId", listReviews);

/**
 * @swagger
 * /api/reviews/guide/{guideId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas por guía
 *     parameters:
 *       - in: path
 *         name: guideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/guide/:guideId", listReviews);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas por usuario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get("/user/:userId", listReviews);

/**
 * @swagger
 * /api/reviews/{id}:
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
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear una nueva reseña con fotos opcionales
 *     description: Crear una reseña asociada a una reserva. Puede incluir hasta 5 fotos (5MB c/u). Requiere autenticación. Disponible para cualquier usuario (con o sin rol de guía).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                   format: binary
 *                 description: Fotos de la reseña (opcional, máximo 5 imágenes de 5MB c/u)
 *     responses:
 *       201:
 *         description: Reseña creada correctamente
 */
router.post("/", authMiddleware, uploadReviewPhotos.array("photos", 5), createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
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
router.put("/:id", authMiddleware, updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
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

/**
 * @swagger
 * /api/reviews/{id}/upload-photos:
 *   post:
 *     tags: [Reviews]
 *     summary: Agregar fotos a una reseña existente
 *     description: Permite al usuario agregar hasta 5 fotos (5MB c/u) a S3 para su reseña. Solo el creador de la reseña puede agregar fotos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes de la reseña (máximo 5, 5MB cada una)
 *     responses:
 *       200:
 *         description: Fotos agregadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 photos:
 *                   type: array
 *                   items:
 *                     type: string
 *                 review:
 *                   type: object
 *       400:
 *         description: No se proporcionaron imágenes
 *       403:
 *         description: No tienes permisos para modificar esta reseña
 *       404:
 *         description: Reseña no encontrada
 */
router.post(
  "/:id/upload-photos",
  authMiddleware,
  uploadReviewPhotos.array("photos", 5),
  uploadPhotosController
);

export default router;