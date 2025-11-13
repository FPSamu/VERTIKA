import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('Inicializando EmailService...');
    console.log('EMAIL_ADDRESS:', process.env.EMAIL_ADDRESS || 'NO CONFIGURADO');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurado' : 'NO CONFIGURADO');
    
    // Configurar el transporter con Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('EmailService inicializado correctamente\n');
  }

  /**
   * Envía un email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      console.log(`Preparando email para: ${options.to}`);
      console.log(`Asunto: ${options.subject}`);
      
      const mailOptions = {
        from: `"VERTIKA" <${process.env.EMAIL_ADDRESS}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado exitosamente a ${options.to}`);
      console.log(`Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      return false;
    }
  }

  /**
   * Genera un token de verificación
   */
  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    // URL del backend para verificación directa
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = `${backendUrl}/api/auth/verify-email/${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏔️ Bienvenido a VERTIKA</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Gracias por registrarte en VERTIKA, tu plataforma para experiencias de montañismo.</p>
            <p>Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>
            
            <center>
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </center>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            
            <p>Si no creaste una cuenta en VERTIKA, puedes ignorar este email.</p>
            
            <p>¡Nos vemos en las montañas! 🏔️</p>
            <p>El equipo de VERTIKA</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VERTIKA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '✅ Verifica tu email - VERTIKA',
      html,
    });
  }

  /**
   * Envía email de bienvenida después de verificar
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Email Verificado!</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Tu email ha sido verificado exitosamente. ¡Ya puedes disfrutar de todas las funcionalidades de VERTIKA!</p>
            
            <h3>¿Qué puedes hacer ahora?</h3>
            
            <div class="feature">
              <strong>🔍 Explora experiencias</strong>
              <p>Descubre increíbles tours de montañismo creados por guías expertos.</p>
            </div>
            
            <div class="feature">
              <strong>📅 Haz reservaciones</strong>
              <p>Reserva tu próxima aventura en las montañas.</p>
            </div>
            
            <div class="feature">
              <strong>⭐ Deja reseñas</strong>
              <p>Comparte tu experiencia con otros aventureros.</p>
            </div>
            
            <div class="feature">
              <strong>🎒 Conviértete en guía</strong>
              <p>Si eres un experto en montañismo, ¡solicita ser guía y comparte tus conocimientos!</p>
            </div>
            
            <p>¡Gracias por unirte a nuestra comunidad de aventureros! 🏔️</p>
            <p>El equipo de VERTIKA</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 ¡Bienvenido a VERTIKA!',
      html,
    });
  }

  /**
   * Envía notificación de que ahora es guía
   */
  async sendGuideApprovalEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 ¡Ahora eres Guía!</h1>
          </div>
          <div class="content">
            <h2>¡Felicidades ${name}!</h2>
            <p>Tu solicitud para convertirte en guía ha sido aprobada. ¡Ya puedes crear y compartir tus experiencias de montañismo!</p>
            
            <h3>Como guía puedes:</h3>
            <ul>
              <li>✅ Crear experiencias de montañismo personalizadas</li>
              <li>✅ Establecer precios y disponibilidad</li>
              <li>✅ Gestionar reservaciones de tus tours</li>
              <li>✅ Recibir reseñas de tus clientes</li>
              <li>✅ Construir tu reputación como guía experto</li>
            </ul>
            
            <p>¡Estamos emocionados de tenerte como parte de nuestro equipo de guías! 🏔️</p>
            <p>El equipo de VERTIKA</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎊 ¡Felicidades! Ahora eres guía en VERTIKA',
      html,
    });
  }
}

export default EmailService;
