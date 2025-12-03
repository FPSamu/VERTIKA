import { connection } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../users/user.model';
import Guide from '../guides/guide.model';
import { ObjectId } from 'mongodb';
import EmailService from '../services/email.service';

const emailService = new EmailService();

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private getUsersCollection() {
    if (!connection.db) {
      throw new Error('Database not connected');
    }
    return connection.db.collection(process.env.USERS_COLLECTION || 'users');
  }

  /**
   * Registra un nuevo usuario
   */
  async register(
    name: string,
    email: string,
    password: string,
    dateOfBirth: Date
  ): Promise<{ user: any; tokens: AuthTokens }> {
    const usersCollection = this.getUsersCollection();
    
    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    //Fecha
    const now = new Date();
    // Crear nuevo usuario
    const newUser = new User({
    name,
    email,
    password: hashedPassword,
    dateOfBirth,
    roles: ['customer'],
    createdAt: now,
    updatedAt: now
  });

    // Generar token de verificación
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    console.log(`🔐 Token de verificación generado para: ${email}`);

    // Agregar token al usuario
    (newUser as any).verificationToken = verificationToken;
    (newUser as any).verificationExpires = verificationExpires;

    // Insertar en la base de datos
    const result = await usersCollection.insertOne(newUser as any);
    console.log(`💾 Usuario creado en BD con ID: ${result.insertedId}`);

    // Enviar email de verificación
    console.log(`📧 Intentando enviar email de verificación a: ${newUser.email}`);
    const emailSent = await emailService.sendVerificationEmail(
      newUser.email,
      newUser.name,
      verificationToken
    );
    
    if (emailSent) {
      console.log(`✅ Email de verificación enviado correctamente a: ${newUser.email}`);
    } else {
      console.error(`❌ No se pudo enviar el email de verificación a: ${newUser.email}`);
    }

    // Generar tokens JWT
    const tokens = this.generateTokens({
      userId: result.insertedId.toString(),
      email: newUser.email,
      roles: newUser.roles,
    });

    // Guardar refresh token en la BD
    await usersCollection.updateOne(
      { _id: result.insertedId },
      { $set: { refreshToken: tokens.refreshToken } }
    );

    // Remover la contraseña del objeto de respuesta
    const userResponse: any = {
      _id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
      emailVerified: newUser.emailVerified,
      dateOfBirth: newUser.dateOfBirth,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return { user: userResponse, tokens };
  }

  /**
   * Inicia sesión de un usuario
   */
  async login(email: string, password: string): Promise<{ user: any; tokens: AuthTokens }> {
    const usersCollection = this.getUsersCollection();
    
    // Buscar usuario
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    // Guardar refresh token en la BD
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          refreshToken: tokens.refreshToken,
          updatedAt: new Date()
        } 
      }
    );

    // Remover datos sensibles
    const userResponse: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      emailVerified: user.emailVerified,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, tokens };
  }

  /**
   * Refresca el access token usando el refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const usersCollection = this.getUsersCollection();
    
    try {
      // Verificar el refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as TokenPayload;

      // Buscar usuario y verificar que el refresh token coincida
      const user = await usersCollection.findOne({
        _id: new ObjectId(decoded.userId),
        refreshToken: refreshToken,
      });

      if (!user) {
        throw new Error('Token inválido');
      }

      // Generar nuevo access token
      const accessToken = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          roles: user.roles,
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' } as SignOptions
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(userId: string): Promise<void> {
    const usersCollection = this.getUsersCollection();
    
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { refreshToken: '' },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Verifica un token de acceso
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Genera access token y refresh token
   */
  public generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' } as SignOptions
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: string): Promise<any | null> {
    const usersCollection = this.getUsersCollection();
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return null;
    }

    // Remover datos sensibles
    const userResponse: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      emailVerified: user.emailVerified,
      dateOfBirth: user.dateOfBirth,
      avatarUrl: user.avatarUrl ?? null,
      avatarKey: user.avatarKey ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }

  /**
   * Verifica el email del usuario usando el token de verificación
   */
  async verifyEmailWithToken(token: string): Promise<{ success: boolean; message: string; user?: any }> {
    const usersCollection = this.getUsersCollection();

    try {
      // Buscar usuario con el token de verificación
      const user = await usersCollection.findOne({
        verificationToken: token,
        verificationExpires: { $gt: new Date() } // Token no expirado
      });

      if (!user) {
        return {
          success: false,
          message: 'Token de verificación inválido o expirado'
        };
      }

      // Verificar el email y eliminar el token
      const result = await usersCollection.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            emailVerified: true,
            updatedAt: new Date()
          },
          $unset: {
            verificationToken: '',
            verificationExpires: ''
          }
        },
        {
          returnDocument: 'after',
          projection: { password: 0, refreshToken: 0, verificationToken: 0 }
        }
      );

      if (!result) {
        return {
          success: false,
          message: 'Error al verificar email'
        };
      }

      // Enviar email de bienvenida
      await emailService.sendWelcomeEmail(result.email, result.name);

      return {
        success: true,
        message: 'Email verificado exitosamente',
        user: result
      };
    } catch (error) {
      console.error('Error en verifyEmailWithToken:', error);
      return {
        success: false,
        message: 'Error al verificar email'
      };
    }
  }

  /**
   * Solicita convertirse en guía
   * Solo usuarios con email verificado pueden convertirse en guías
   */
  async requestToBecomeGuide(
    userId: string,
    guideData?: {
      bio?: string;
      languages?: string[];
      experienceYears?: number;
      specialties?: string[];
    }
  ): Promise<{ success: boolean; message: string; user?: any }> {
    const usersCollection = this.getUsersCollection();

    try {
      // Buscar el usuario
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Verificar que el email esté verificado
      if (!user.emailVerified) {
        return {
          success: false,
          message: 'Debes verificar tu email antes de solicitar ser guía'
        };
      }

      // Verificar que no sea ya un guía
      if (user.roles && user.roles.includes('guide')) {
        return {
          success: false,
          message: 'Ya eres un guía'
        };
      }

      // Agregar el rol 'guide' al usuario
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $addToSet: { roles: 'guide' }, // $addToSet evita duplicados
          $set: { updatedAt: new Date() }
        },
        {
          returnDocument: 'after',
          projection: { password: 0, refreshToken: 0 }
        }
      );

      if (!result) {
        return {
          success: false,
          message: 'Error al actualizar usuario'
        };
      }

      // Crear el documento del guía en la colección guides
      // Usar datos proporcionados o valores por defecto
      const newGuide = new Guide({
        userId: new ObjectId(userId),
        bio: guideData?.bio || 'Nuevo guía en VERTIKA',
        experienceYears: guideData?.experienceYears ?? 0,
        languages: guideData?.languages && guideData.languages.length > 0 ? guideData.languages : ['es'],
        certifications: [],
        specialties: guideData?.specialties || [],
        verified: false,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newGuide.save();

      // Enviar email de aprobación como guía
      await emailService.sendGuideApprovalEmail(result.email, result.name);

      return {
        success: true,
        message: 'Ahora eres un guía. ¡Puedes empezar a crear experiencias! Recuerda completar tu perfil de guía.',
        user: result
      };
    } catch (error) {
      console.error('Error en requestToBecomeGuide:', error);
      return {
        success: false,
        message: 'Error al procesar la solicitud'
      };
    }
  }

  /**
   * Solicita el restablecimiento de contraseña (genera token y envía email)
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const usersCollection = this.getUsersCollection();

      // Buscar el usuario por email
      const user = await usersCollection.findOne({ email });

      // Por seguridad, siempre devolvemos el mismo mensaje aunque el usuario no exista
      if (!user) {
        console.log(`⚠️ Usuario no encontrado: ${email}`);
        return {
          success: true,
          message: 'Si el email existe, recibirás un enlace de recuperación'
        };
      }

      // Generar token de reset (válido por 5 minutos)
      const resetToken = emailService.generateVerificationToken();
      const resetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      console.log(`🔑 Token de reset generado para: ${email}`);
      console.log(`⏰ Token expira en: ${resetExpires.toLocaleString()}`);

      // Actualizar usuario con el token de reset
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
            updatedAt: new Date()
          }
        }
      );

      // Enviar email de recuperación
      console.log(`📧 Enviando email de recuperación a: ${email}`);
      const emailSent = await emailService.sendPasswordResetEmail(
        email,
        user.name,
        resetToken
      );

      if (emailSent) {
        console.log(`✅ Email de recuperación enviado a: ${email}`);
      } else {
        console.error(`❌ Error al enviar email de recuperación a: ${email}`);
      }

      return {
        success: true,
        message: 'Email de recuperación enviado'
      };
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);
      throw error;
    }
  }

  /**
   * Verifica si un token de reset es válido
   */
  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const usersCollection = this.getUsersCollection();

      const user = await usersCollection.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      return !!user;
    } catch (error) {
      console.error('Error en verifyResetToken:', error);
      return false;
    }
  }

  /**
   * Restablece la contraseña usando el token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const usersCollection = this.getUsersCollection();

      // Buscar usuario con token válido y no expirado
      const user = await usersCollection.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return {
          success: false,
          message: 'El token de recuperación es inválido o ha expirado'
        };
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      console.log(`🔄 Actualizando contraseña para usuario: ${user.email}`);

      // Actualizar contraseña y limpiar tokens de reset
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          },
          $unset: {
            resetPasswordToken: '',
            resetPasswordExpires: ''
          }
        }
      );

      console.log(`✅ Contraseña actualizada para: ${user.email}`);

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return {
        success: false,
        message: 'Error al restablecer la contraseña'
      };
    }
  }
}

export default AuthService;
