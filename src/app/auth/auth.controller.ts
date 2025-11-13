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

    console.log(`\n🚀 REGISTRO INICIADO - Email: ${email}`);
    console.log(`📝 Datos recibidos: name=${name}, dateOfBirth=${dateOfBirth}`);

    const result = await authService.register(
      name,
      email,
      password,
      new Date(dateOfBirth)
    );

    console.log(`✅ REGISTRO COMPLETADO - User ID: ${result.user._id}`);

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

    console.error('❌ ERROR EN REGISTER:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Error - VERTIKA</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>Token de verificación requerido</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    console.log(`Verificando email con token: ${token.substring(0, 10)}...`);
    const result = await authService.verifyEmailWithToken(token);

    if (!result.success) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Error - VERTIKA</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; }
            h1 { color: #e74c3c; }
            p { color: #666; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ ${result.message}</h1>
            <p>El enlace de verificación puede haber expirado o ya fue usado.</p>
            <p>Por favor, solicita un nuevo enlace de verificación.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    console.log(`Email verificado exitosamente para: ${result.user?.email}`);
    
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Email Verificado! - VERTIKA</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; }
          h1 { color: #27ae60; margin-bottom: 20px; }
          p { color: #666; font-size: 16px; line-height: 1.6; }
          .emoji { font-size: 60px; margin-bottom: 20px; }
          .user-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">✅</div>
          <h1>¡Email Verificado Exitosamente!</h1>
          <div class="user-info">
            <strong>Email:</strong> ${result.user?.email || 'N/A'}<br>
            <strong>Nombre:</strong> ${result.user?.name || 'N/A'}
          </div>
          <p>Tu cuenta ha sido verificada correctamente.</p>
          <p>Ya puedes iniciar sesión y disfrutar de todas las funcionalidades de VERTIKA 🏔️</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Ir a VERTIKA</a>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error en verifyEmailWithToken:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Error - VERTIKA</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { background: white; padding: 40px; border-radius: 10px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error del Servidor</h1>
          <p>Ocurrió un error al verificar tu email. Por favor, intenta nuevamente más tarde.</p>
        </div>
      </body>
      </html>
    `);
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
