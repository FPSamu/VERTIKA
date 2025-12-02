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

  /**
   * Envía email de confirmación de reservación
   */
  async sendReservationConfirmationEmail(
    userEmail: string,
    userName: string,
    experienceTitle: string,
    experienceDate: Date,
    experienceLocation: string,
    seats: number,
    total: number,
    currency: string,
    reservationId: string,
    confirmationToken: string
  ): Promise<boolean> {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const confirmationUrl = `${backendUrl}/api/reservations/confirm/${reservationId}/${confirmationToken}`;

    const dateFormatted = new Date(experienceDate).toLocaleDateString('es-MX', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const totalFormatted = new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: currency || 'MXN' 
    }).format(total);

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
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
          }
          .reservation-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .reservation-title {
            font-size: 20px;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .reservation-detail {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .reservation-detail:last-child {
            border-bottom: none;
          }
          .detail-label {
            flex: 0 0 140px;
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            flex: 1;
            color: #2c3e50;
          }
          .total-section {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label {
            font-size: 16px;
          }
          .total-amount {
            font-size: 28px;
            font-weight: bold;
          }
          .confirmation-box {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .confirmation-box h3 {
            color: #856404;
            margin: 0 0 15px 0;
          }
          .confirmation-box p {
            color: #856404;
            margin: 10px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            margin: 15px 0;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .button:hover {
            opacity: 0.9;
          }
          .link-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
          }
          .link-section p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
          }
          .link-section a {
            color: #667eea;
            word-break: break-all;
            font-size: 12px;
          }
          .important-note {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .important-note strong {
            color: #1565c0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 13px;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Confirmación de Reservación</h1>
            <p>Tu aventura está a un paso de confirmarse</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              ¡Hola <strong>${userName}</strong>!
            </div>
            
            <p>Hemos recibido tu solicitud de reservación. Para confirmarla y asegurar tu lugar en esta increíble experiencia, por favor haz clic en el botón de abajo.</p>
            
            <div class="reservation-card">
              <div class="reservation-title">🏔️ ${experienceTitle}</div>
              
              <div class="reservation-detail">
                <div class="detail-label">📅 Fecha:</div>
                <div class="detail-value">${dateFormatted}</div>
              </div>
              
              <div class="reservation-detail">
                <div class="detail-label">📍 Ubicación:</div>
                <div class="detail-value">${experienceLocation}</div>
              </div>
              
              <div class="reservation-detail">
                <div class="detail-label">👥 Personas:</div>
                <div class="detail-value">${seats} ${seats === 1 ? 'persona' : 'personas'}</div>
              </div>
            </div>
            
            <div class="total-section">
              <div class="total-label">Total a pagar:</div>
              <div class="total-amount">${totalFormatted}</div>
            </div>
            
            <div class="confirmation-box">
              <h3>⚠️ Acción Requerida</h3>
              <p>Para confirmar tu reservación, haz clic en el siguiente botón:</p>
              
              <center>
                <a href="${confirmationUrl}" class="button">✅ Confirmar Reservación</a>
              </center>
              
              <div class="link-section">
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <a href="${confirmationUrl}">${confirmationUrl}</a>
              </div>
            </div>
            
            <div class="important-note">
              <strong>⏰ Importante:</strong> Este enlace de confirmación expirará en 48 horas. Si no confirmas tu reservación antes de ese tiempo, será cancelada automáticamente.
            </div>
            
            <p>Una vez que confirmes tu reservación, el guía recibirá tu información y se pondrá en contacto contigo para coordinar los detalles finales.</p>
            
            <p>Si tienes alguna pregunta o necesitas hacer cambios en tu reservación, no dudes en contactarnos.</p>
            
            <p style="margin-top: 30px;">¡Prepárate para una aventura inolvidable! 🏔️</p>
            <p><strong>El equipo de VERTIKA</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} VERTIKA. Todos los derechos reservados.</p>
            <p>Si no solicitaste esta reservación, puedes ignorar este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `✅ Confirma tu reservación - ${experienceTitle}`,
      html,
    });
  }

  /**
   * Envía email de confirmación exitosa
   */
  async sendReservationConfirmedEmail(
    userEmail: string,
    userName: string,
    experienceTitle: string,
    experienceDate: Date,
    experienceLocation: string,
    seats: number,
    total: number,
    currency: string
  ): Promise<boolean> {
    const dateFormatted = new Date(experienceDate).toLocaleDateString('es-MX', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const totalFormatted = new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: currency || 'MXN' 
    }).format(total);

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
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .success-icon {
            font-size: 60px;
            margin-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .reservation-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #48bb78;
          }
          .reservation-title {
            font-size: 20px;
            color: #2c3e50;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .reservation-detail {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .reservation-detail:last-child {
            border-bottom: none;
          }
          .detail-label {
            flex: 0 0 140px;
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            flex: 1;
            color: #2c3e50;
          }
          .total-section {
            background: #48bb78;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-amount {
            font-size: 28px;
            font-weight: bold;
          }
          .next-steps {
            background: #e3f2fd;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          }
          .next-steps h3 {
            color: #1565c0;
            margin-top: 0;
          }
          .next-steps ul {
            margin: 10px 0;
            padding-left: 25px;
          }
          .next-steps li {
            margin: 8px 0;
            color: #2c3e50;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>¡Reservación Confirmada!</h1>
          </div>
          
          <div class="content">
            <p><strong>¡Excelente noticia, ${userName}!</strong></p>
            
            <p>Tu reservación ha sido confirmada exitosamente. Ya tienes tu lugar asegurado en esta increíble experiencia de montañismo.</p>
            
            <div class="reservation-card">
              <div class="reservation-title">🏔️ ${experienceTitle}</div>
              
              <div class="reservation-detail">
                <div class="detail-label">📅 Fecha:</div>
                <div class="detail-value">${dateFormatted}</div>
              </div>
              
              <div class="reservation-detail">
                <div class="detail-label">📍 Ubicación:</div>
                <div class="detail-value">${experienceLocation}</div>
              </div>
              
              <div class="reservation-detail">
                <div class="detail-label">👥 Personas:</div>
                <div class="detail-value">${seats} ${seats === 1 ? 'persona' : 'personas'}</div>
              </div>
            </div>
            
            <div class="total-section">
              <div class="total-label">Total confirmado:</div>
              <div class="total-amount">${totalFormatted}</div>
            </div>
            
            <div class="next-steps">
              <h3>📝 Próximos Pasos</h3>
              <ul>
                <li>El guía se pondrá en contacto contigo pronto con los detalles finales</li>
                <li>Recibirás información sobre el punto de encuentro y horario exacto</li>
                <li>Te recomendamos preparar el equipo necesario para la actividad</li>
                <li>Si tienes preguntas, puedes contactar al guía directamente</li>
              </ul>
            </div>
            
            <p>Puedes ver los detalles de tu reservación en cualquier momento desde tu cuenta en VERTIKA.</p>
            
            <p style="margin-top: 30px;">¡Estamos emocionados de que formes parte de esta aventura! 🎉</p>
            <p><strong>El equipo de VERTIKA</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} VERTIKA. Todos los derechos reservados.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `✅ Reservación Confirmada - ${experienceTitle}`,
      html,
    });
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${backendUrl}/api/auth/reset-password/${token}`;

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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 13px;
            margin-top: 20px;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔑</div>
            <h1>Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <p><strong>Hola ${name},</strong></p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en VERTIKA.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Importante:</strong><br>
              Este enlace expirará en <strong>5 minutos</strong> por razones de seguridad.
            </div>
            
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              <strong>¿No solicitaste este cambio?</strong><br>
              Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá sin cambios.
            </p>
            
            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>El equipo de VERTIKA</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} VERTIKA. Todos los derechos reservados.</p>
            <p>Por tu seguridad, nunca compartas este enlace con nadie.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔑 Recuperación de Contraseña - VERTIKA',
      html,
    });
  }
}

export default EmailService;
