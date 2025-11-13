import { Router } from "express";
import {
  listExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  publishExperience,
  republishExperience,
  archiveExperience,
  deleteExperience,
} from "./experience.controller";
import { authMiddleware } from "../middlewares/auth";
import { guideVerificationMiddleware } from "../middlewares/guideVerification";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Experiences
 *   description: Endpoints de experiencias 
 */

/**
 * @swagger
 * /api/experiences:
 *   get:
 *     tags: [Experiences]
 *     summary: Listar experiencias 
 *     responses:
 *       200:
 *         description: Lista de experiencias obtenida correctamente
 */
router.get("/", listExperiences);

/**
 * @swagger
 * /api/experiences/{id}:
 *   get:
 *     tags: [Experiences]
 *     summary: Obtener una experiencia por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiencia encontrada
 *       404:
 *         description: No encontrada
 */
router.get("/:id", getExperienceById);

/**
 * @swagger
 * /api/experiences:
 *   post:
 *     tags: [Experiences]
 *     summary: Crear una nueva experiencia (borrador)
 *     description: Crea una experiencia en estado 'draft'. Solo disponible para guías verificados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guideId
 *               - title
 *               - description
 *               - activity
 *               - location
 *               - difficulty
 *               - date
 *               - maxGroupSize
 *               - pricePerPerson
 *             properties:
 *               guideId:
 *                 type: string
 *                 example: "g1"
 *               title:
 *                 type: string
 *                 example: "Ascenso al Pico de Orizaba"
 *               description:
 *                 type: string
 *                 example: "Ascenso de 2 días, incluye guía certificado y campamento base."
 *               activity:
 *                 type: string
 *                 enum: ["hiking", "alpinismo", "trail", "escalada"]
 *               location:
 *                 type: string
 *                 example: "Pico de Orizaba, Puebla"
 *               difficulty:
 *                 type: string
 *                 example: "difícil"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-15T08:00:00Z"
 *               minGroupSize:
 *                 type: number
 *                 example: 2
 *               maxGroupSize:
 *                 type: number
 *                 example: 6
 *               pricePerPerson:
 *                 type: number
 *                 example: 8500
 *               currency:
 *                 type: string
 *                 enum: ["MXN", "USD"]
 *                 example: "MXN"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "https://example.com/photo1.jpg"
 *     responses:
 *       201:
 *         description: Experiencia creada correctamente
 */
router.post("/", authMiddleware, guideVerificationMiddleware,createExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   patch:
 *     tags: [Experiences]
 *     summary: Actualizar una experiencia existente
 *     description: Permite modificar los datos de una experiencia mientras no esté archivada.
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
 *               title: "Ascenso actualizado"
 *               description: "Cambio en la fecha del itinerario"
 *               date: "2025-11-20T09:00:00Z"
 *     responses:
 *       200:
 *         description: Experiencia actualizada
 */
router.patch("/:id", authMiddleware, guideVerificationMiddleware, updateExperience);

/**
 * @swagger
 * /api/experiences/{id}/publish:
 *   patch:
 *     tags: [Experiences]
 *     summary: Publicar una experiencia
 *     description: Cambia el estado de una experiencia a "published".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiencia publicada
 */
router.patch("/:id/publish", authMiddleware,guideVerificationMiddleware ,publishExperience);

/**
 * @swagger
 * /api/experiences/{id}/republish:
 *   post:
 *     tags: [Experiences]
 *     summary: Clonar y crear una nueva experiencia como borrador
 *     description: Duplica una experiencia existente y crea un nuevo borrador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Nueva experiencia clonada en estado draft
 */
router.post("/:id/republish", authMiddleware,guideVerificationMiddleware ,republishExperience);

/**
 * @swagger
 * /api/experiences/{id}/archive:
 *   patch:
 *     tags: [Experiences]
 *     summary: Archivar una experiencia
 *     description: Cambia el estado de la experiencia a "archived".
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiencia archivada correctamente
 */
router.patch("/:id/archive", authMiddleware,guideVerificationMiddleware ,archiveExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   delete:
 *     tags: [Experiences]
 *     summary: Eliminar una experiencia
 *     description: Elimina una experiencia por su ID.
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
router.delete("/:id", authMiddleware,guideVerificationMiddleware, deleteExperience);

export default router;