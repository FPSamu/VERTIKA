import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser, updateAvatar,getMe } from "./user.controller";
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
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *          description: OK 
 *       description:
 *           missing token
 */
router.get("/:id", getUserById);


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

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Renderiza la vista HTML del perfil del usuario autenticado
 *     description: Devuelve la página HTML del perfil del usuario actualmente autenticado.
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - text/html
 *     responses:
 *       200:
 *         description: Página HTML del perfil del usuario
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<!doctype html><html><head><title>Mi perfil</title></head><body>...</body></html>"
 *       401:
 *         description: No autenticado / Token faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autenticado"
 */
router.get("/me", authMiddleware, getMe);

export default router;