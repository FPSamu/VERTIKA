import { Router } from "express";
import { listGuides, getGuideById, createGuide, updateGuide, deleteGuide } from "./guide.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Guides
 *   description: Endpoints para gestionar guías
 */

/**
 * @swagger
 * /guides:
 *   get:
 *     tags: [Guides]
 *     summary: Listar todos los guías
 *     responses:
 *       200:
 *         description: Lista de guías obtenida correctamente
 * 
 */
router.get("/", listGuides);

/**
 * @swagger
 * /guides/{id}:
 *   get:
 *     tags: [Guides]
 *     summary: Obtener un guía por su ID
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
 *         description: Guía no encontrada
 */
router.get("/:id", getGuideById);

/**
 * @swagger
 * /guides:
 *   post:
 *     tags: [Guides]
 *     summary: Crear un nuevo guía
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bio
 *               - experienceYears
 *               - languages
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "69151fa525a16fe4e4157cc9"
 *               bio:
 *                 type: string
 *                 example: "Guía experto en montañismo y senderismo"
 *               experienceYears:
 *                 type: number
 *                 example: 5
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["es","en"]
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Wilderness First Aid","Guía de Montaña"]
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Alpinismo","Camping"]
 *     responses:
 *       201:
 *         description: Guía creado correctamente
 */
router.post("/", authMiddleware, createGuide);

/**
 * @swagger
 * /guides/{id}:
 *   patch:
 *     tags: [Guides]
 *     summary: Actualizar información de un guía existente
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
 *               bio: "Nuevo texto de bio"
 *               experienceYears: 5
 *     responses:
 *       200:
 *         description: Guía actualizado correctamente
 *       404:
 *         description: Guía no encontrada
 */
router.patch("/:id", authMiddleware, updateGuide);

/**
 * @swagger
 * /guides/{id}:
 *   delete:
 *     tags: [Guides]
 *     summary: Eliminar un guía por ID
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
 *         description: Guía eliminado correctamente
 *       404:
 *         description: Guía no encontrada
 */
router.delete("/:id", authMiddleware, deleteGuide);

export default router;