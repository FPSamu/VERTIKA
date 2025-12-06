import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser, updateAvatar, renderEditProfile, getUserProfile} from "./user.controller";
import { uploadS3Profile } from "../middlewares/upload/upload_s3_image";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: No autenticado
 */
router.get("/", authMiddleware, getUsers);

router.get("/me/edit", authMiddleware, renderEditProfile);

router.get("/profile/:id", getUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *          description: OK
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id", authMiddleware, getUserById);


/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar usuario 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 */
router.patch("/:id", authMiddleware, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 */
router.delete("/:id", authMiddleware, deleteUser);



/**
 * @swagger
 * /api/users/me/avatar:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar avatar del usuario autenticado
 *     security:
 *       - bearerAuth: []   # usa el esquema de token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del avatar a subir
 *     responses:
 *       200:
 *         description: Avatar actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                   description: URL pública del nuevo avatar
 *       401:
 *         description: No autorizado, token faltante o inválido
 *       400:
 *         description: Error en la subida del archivo o formato inválido
 */
router.patch("/me/avatar", authMiddleware, uploadS3Profile.single("avatar"), updateAvatar);

export default router;