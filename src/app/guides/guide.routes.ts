import { Router } from "express";
import { listGuides, getGuideById, createGuide, updateGuide, deleteGuide } from "./guide.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Guides
 *   description: Endpoints de guías
 */

/**
 * @swagger
 * /guides:
 *   get:
 *     tags: [Guides]
 *     summary: Listar guías
 *     responses:
 *       200:
 *         description: Lista de guías obtenida correctamente
 */
router.get("/", listGuides);

/**
 * @swagger
 * /guides/{id}:
 *   get:
 *     tags: [Guides]
 *     summary: Obtener un guía por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guía encontrado
 *       404:
 *         description: Guía no encontrado
 */
router.get("/:id", getGuideById);

/**
 * @swagger
 * /guides:
 *   post:
 *     tags: [Guides]
 *     summary: Crear un nuevo guía
 *     description: Crea un perfil de guía.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               bio:
 *                 type: string
 *               experienceYears:
 *                 type: number
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Guia creado correctamente
 */
router.post("/", authMiddleware, createGuide);

/**
 * @swagger
 * /guides/{id}:
 *   patch:
 *     tags: [Guides]
 *     summary: Actualizar información de un guía
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
 *               bio: "Nuevo texto de bio"
 *               experienceYears: 5
 *     responses:
 *       200:
 *         description: Guía actualizado
 */
router.patch("/:id", authMiddleware, updateGuide);

/**
 * @swagger
 * /guides/{id}:
 *   delete:
 *     tags: [Guides]
 *     summary: Eliminar un guía
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Guía eliminado correctamente
 */
router.delete("/:id", authMiddleware, deleteGuide);

export default router;