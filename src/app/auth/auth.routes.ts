import { Router } from 'express';
import * as authController from './auth.controller';
import { registerValidators, loginValidators, refreshTokenValidators, forgotPasswordValidators, resetPasswordValidators } from './auth.validators';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/register', authController.showRegisterPage);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - dateOfBirth
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1995-05-15
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario ya existe
 */
router.post('/register', registerValidators, authController.register);



router.get('/login', authController.showLoginPage);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidators, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token actualizado exitosamente
 *       401:
 *         description: Token inválido o expirado
 */
router.post('/refresh', refreshTokenValidators, authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verificar email con token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado por email
 *     description: Verifica el email del usuario usando el token enviado por correo electrónico durante el registro
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/verify-email/:token', authController.verifyEmailWithToken);

/**
 * @swagger
 * /api/auth/request-guide:
 *   post:
 *     summary: Solicitar convertirse en guía
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Permite a un usuario con email verificado convertirse en guía
 *     responses:
 *       200:
 *         description: Solicitud aprobada, ahora eres un guía
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Email no verificado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Ya eres un guía
 */
router.post('/request-guide', authMiddleware, authController.requestToBecomeGuide);

// Rutas de recuperación de contraseña
router.get('/forgot-password', authController.showForgotPasswordPage);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Authentication]
 *     description: Envía un email con un enlace para restablecer la contraseña (válido por 5 minutos)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Email de recuperación enviado (si el usuario existe)
 *       400:
 *         description: Datos inválidos
 */
router.post('/forgot-password', forgotPasswordValidators, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   get:
 *     summary: Mostrar página de restablecimiento de contraseña
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación de contraseña
 *     responses:
 *       200:
 *         description: Página de reset de contraseña
 */
router.get('/reset-password/:token', authController.showResetPasswordPage);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación de contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password/:token', resetPasswordValidators, authController.resetPassword);

export default router;
