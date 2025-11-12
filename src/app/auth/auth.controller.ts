import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import AuthService from './auth.service';

const authService = new AuthService();

/**
 * Registra un nuevo usuario
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password, dateOfBirth } = req.body;

    const result = await authService.register(
      name,
      email,
      password,
      new Date(dateOfBirth)
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    });
  } catch (error: any) {
    if (error.message === 'El usuario ya existe') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
    });
  }
};

/**
 * Inicia sesión de un usuario
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    });
  } catch (error: any) {
    if (error.message === 'Credenciales inválidas') {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
    });
  }
};

/**
 * Refresca el access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token actualizado exitosamente',
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

/**
 * Cierra sesión del usuario
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
      return;
    }

    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error: any) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
    });
  }
};

/**
 * Obtiene el perfil del usuario autenticado
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error: any) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
    });
  }
};

/**
 * Verifica el email del usuario usando el token enviado por correo
 */
export const verifyEmailWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token de verificación requerido',
      });
      return;
    }

    const result = await authService.verifyEmailWithToken(token);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error('Error en verifyEmailWithToken:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email',
    });
  }
};

/**
 * Solicita convertirse en guía
 */
export const requestToBecomeGuide = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
      return;
    }

    const result = await authService.requestToBecomeGuide(userId);

    if (!result.success) {
      // Determinar el código de estado según el mensaje
      let statusCode = 400;
      
      if (result.message === 'Usuario no encontrado') {
        statusCode = 404;
      } else if (result.message === 'Debes verificar tu email antes de solicitar ser guía') {
        statusCode = 403;
      } else if (result.message === 'Ya eres un guía') {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error('Error en requestToBecomeGuide:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
    });
  }
};
