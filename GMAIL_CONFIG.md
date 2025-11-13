# 📧 Configuración de Email con Gmail

## ⚙️ Variables de Entorno

El sistema ahora usa las siguientes variables en tu `.env`:

```bash
EMAIL_ADDRESS='vertike.iteso@gmail.com'
EMAIL_PASS='vertikaPass@'
FRONTEND_URL='http://localhost:5173'
```

## 🔐 Importante: Contraseña de Aplicación

**⚠️ NOTA IMPORTANTE:** Para que Gmail funcione con aplicaciones externas, **NO debes usar tu contraseña normal de Gmail**. Debes generar una "Contraseña de aplicación".

### Pasos para Generar Contraseña de Aplicación en Gmail:

1. **Habilitar verificación en 2 pasos:**

   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Actívala si no lo está

2. **Generar contraseña de aplicación:**

   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro dispositivo"
   - Ingresa un nombre: "VERTIKA Backend"
   - Copia la contraseña de 16 caracteres generada

3. **Actualizar `.env`:**
   ```bash
   EMAIL_PASS='xxxx xxxx xxxx xxxx'  # La contraseña de 16 caracteres
   ```

## 🚫 Si No Puedes Usar Contraseñas de Aplicación

Si tu cuenta de Gmail no permite contraseñas de aplicación, tienes estas opciones:

### Opción 1: Permitir apps menos seguras (No recomendado)

- Ve a: https://myaccount.google.com/lesssecureapps
- Activa "Permitir aplicaciones menos seguras"
- Usa tu contraseña normal en `EMAIL_PASS`

### Opción 2: Usar Mailtrap (Para desarrollo)

En tu `.env`:

```bash
# Comentar o eliminar EMAIL_ADDRESS y EMAIL_PASS
# Agregar estas variables temporales para desarrollo:
SMTP_HOST='smtp.mailtrap.io'
SMTP_PORT='2525'
SMTP_USER='tu_usuario_mailtrap'
SMTP_PASSWORD='tu_password_mailtrap'
```

Y modificar `email.service.ts` temporalmente:

```typescript
constructor() {
  if (process.env.SMTP_HOST) {
    // Configuración de Mailtrap
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '2525'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Configuración de Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
}
```

## ✅ Verificar que Funciona

### Test Manual con Node.js:

Crea un archivo `test-email.js`:

```javascript
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail(
  {
    from: process.env.EMAIL_ADDRESS,
    to: process.env.EMAIL_ADDRESS, // Enviar a ti mismo
    subject: "Test VERTIKA",
    text: "¡La configuración funciona!",
  },
  (error, info) => {
    if (error) {
      console.error("❌ Error:", error);
    } else {
      console.log("✅ Email enviado:", info.messageId);
    }
  }
);
```

Ejecutar:

```bash
node test-email.js
```

## 🔄 Flujo Completo de Emails en VERTIKA

### 1. Email de Verificación

**Cuándo:** Al registrar usuario nuevo
**De:** vertike.iteso@gmail.com
**Para:** Email del usuario registrado
**Contiene:** Enlace de verificación con token

### 2. Email de Bienvenida

**Cuándo:** Después de verificar email
**De:** vertike.iteso@gmail.com
**Para:** Email del usuario verificado
**Contiene:** Mensaje de bienvenida y links de la plataforma

### 3. Email de Guía Aprobado

**Cuándo:** Usuario solicita ser guía
**De:** vertike.iteso@gmail.com
**Para:** Email del nuevo guía
**Contiene:** Confirmación y próximos pasos

## 📝 Estructura del Código

El servicio de email (`src/app/services/email.service.ts`) ahora usa:

```typescript
constructor() {
  this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,    // vertike.iteso@gmail.com
      pass: process.env.EMAIL_PASS,       // Tu contraseña de aplicación
    },
  });
}
```

Todos los emails se envían desde: `"VERTIKA" <vertike.iteso@gmail.com>`

## 🐛 Solución de Problemas

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa:** La contraseña no es válida
**Solución:**

1. Verifica que sea una contraseña de aplicación (no tu contraseña normal)
2. Quita espacios de la contraseña en el `.env`
3. Genera una nueva contraseña de aplicación

### Error: "Less secure app access"

**Causa:** Gmail bloqueando apps de terceros
**Solución:**

1. Usa contraseña de aplicación con verificación en 2 pasos
2. O activa "apps menos seguras" (no recomendado)

### Emails no llegan

**Posibles causas:**

1. Van a spam (revisar carpeta de spam)
2. Email no válido del destinatario
3. Límite de envío de Gmail alcanzado (500/día)

### Test: Verificar conexión SMTP

```javascript
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error de configuración:", error);
  } else {
    console.log("✅ Servidor listo para enviar emails");
  }
});
```

## 📊 Límites de Gmail

| Tipo                    | Límite |
| ----------------------- | ------ |
| Emails por día          | 500    |
| Destinatarios por email | 500    |
| Emails por segundo      | ~1-2   |

Para aplicaciones en producción con más de 500 emails/día, considera:

- SendGrid (gratis hasta 100/día, luego de pago)
- AWS SES (muy económico)
- Mailgun
- Postmark

## ✨ Resumen

Tu configuración actual:

- ✅ Email: `vertike.iteso@gmail.com`
- ✅ Servicio: Gmail
- ✅ Variables: `EMAIL_ADDRESS` y `EMAIL_PASS`
- ✅ Frontend URL: `http://localhost:5173`

Para probar:

1. Asegúrate de tener contraseña de aplicación
2. Registra un usuario desde tu API
3. Revisa la bandeja de entrada del email registrado
4. Verifica que llegue el email de verificación

¡Todo listo para enviar emails! 🚀
