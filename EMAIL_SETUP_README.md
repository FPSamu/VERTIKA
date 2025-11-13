# Configuración del Servicio de Email

## 📝 Guía Rápida

Para habilitar el envío de emails en VERTIKA, debes configurar un servidor SMTP. Aquí te mostramos cómo hacerlo con los proveedores más comunes.

## 🔧 Configuración por Proveedor

### Gmail

#### Opción 1: Contraseña de Aplicación (Recomendado)

1. **Habilitar verificación en 2 pasos:**
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Actívala si no lo está

2. **Generar contraseña de aplicación:**
   - Ve a: Cuenta de Google → Seguridad → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro dispositivo"
   - Copia la contraseña de 16 caracteres

3. **Configurar `.env`:**

   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=tu_email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

#### Opción 2: OAuth2 (Más seguro, más complejo)

Para producción, considera usar OAuth2 con Gmail API.

---

### Outlook / Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@outlook.com
SMTP_PASSWORD=tu_contraseña
```

**Nota:** Si tienes verificación en 2 pasos, necesitas una contraseña de aplicación.

---

### Yahoo Mail

```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@yahoo.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
```

Yahoo también requiere contraseñas de aplicación.

---

### SendGrid (Recomendado para Producción)

SendGrid es un servicio especializado en envío de emails transaccionales.

1. **Crear cuenta:** `https://sendgrid.com` (Gratis hasta 100 emails/día)
2. **Obtener API Key:** Settings → API Keys → Create API Key
3. **Configurar `.env`:**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.tu_api_key_aqui
```

**Ventajas:**

- Mejor deliverability
- Analytics detallados
- No necesitas tu email personal
- Maneja rebotes y spam automáticamente

---

### Amazon SES (Para Producción a Gran Escala)

1. **Configurar AWS SES**
2. **Obtener credenciales SMTP**
3. **Configurar:**

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_access_key
SMTP_PASSWORD=tu_secret_key
```

---

### Mailtrap (Solo para Desarrollo)

**Perfecto para probar sin enviar emails reales.**

1. **Crear cuenta:** `https://mailtrap.io` (Gratis)
2. **Obtener credenciales** de tu inbox
3. **Configurar `.env`:**

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=tu_usuario_mailtrap
SMTP_PASSWORD=tu_contraseña_mailtrap
```

**Ventajas:**

- Captura emails sin enviarlos
- Interfaz web para ver emails
- Prueba HTML y texto plano
- Inspecciona headers

---

## 🔒 Puertos SMTP

| Puerto | Tipo | Descripción |
|--------|------|-------------|
| 25 | No cifrado | Bloqueado por muchos proveedores |
| 587 | STARTTLS | **Recomendado** para envío |
| 465 | SSL/TLS | Alternativa segura |
| 2525 | STARTTLS | Backup si 587 está bloqueado |

**Configuración según puerto:**

```bash
# Puerto 587 (STARTTLS)
SMTP_PORT=587
SMTP_SECURE=false

# Puerto 465 (SSL/TLS)
SMTP_PORT=465
SMTP_SECURE=true
```

---

## ✅ Verificar Configuración

### 1. Probar el Servidor SMTP

Usa este script de Node.js para verificar:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error de configuración SMTP:', error);
  } else {
    console.log('✅ Servidor SMTP listo para enviar emails');
  }
});
```

### 2. Enviar Email de Prueba

```javascript
const testEmail = await transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'tu_email@ejemplo.com',
  subject: 'Prueba de SMTP',
  text: 'Si recibes esto, la configuración funciona correctamente.',
});

console.log('Email enviado:', testEmail.messageId);
```

---

## 🚨 Solución de Problemas

### Error: "Invalid login"

**Causas comunes:**

- Credenciales incorrectas
- Necesitas contraseña de aplicación
- Verificación en 2 pasos no configurada

**Solución:**

1. Verifica usuario y contraseña
2. Para Gmail/Yahoo: genera contraseña de aplicación
3. Revisa que no haya espacios extra en `.env`

---

### Error: "Connection timeout"

**Causas:**

- Puerto bloqueado por firewall
- ISP bloquea puerto 25/587

**Solución:**

1. Prueba puerto alternativo (2525)
2. Verifica firewall/antivirus
3. Prueba desde otra red

---

### Error: "Self-signed certificate"

**Causa:** Problemas con certificados SSL

**Solución temporal (solo desarrollo):**

```javascript
const transporter = nodemailer.createTransport({
  // ... otras opciones
  tls: {
    rejectUnauthorized: false
  }
});
```

---

### Emails van a spam

**Soluciones:**

1. **SPF Record:** Configura registro SPF en tu dominio
2. **DKIM:** Habilita DKIM en tu proveedor
3. **Usa servicio especializado:** SendGrid, AWS SES
4. **Evita palabras spam:** "gratis", "urgente", etc.
5. **Email verificado:** Usa un email del mismo dominio

---

## 🌐 Variables de Entorno Completas

Tu archivo `.env` debe tener:

```bash
# Configuración de correo electrónico (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# URL del frontend (para enlaces en emails)
FRONTEND_URL=http://localhost:5173
```

**En producción:**

```bash
FRONTEND_URL=https://vertika.com
```

---

## 📊 Mejores Prácticas

### Desarrollo

✅ Usa Mailtrap para capturar emails
✅ Prueba todas las plantillas
✅ Verifica enlaces en emails

### Producción

✅ Usa SendGrid o AWS SES
✅ Monitorea tasas de entrega
✅ Implementa manejo de rebotes
✅ Configura SPF y DKIM
✅ Guarda logs de emails enviados

---

## 📚 Recursos Adicionales

- [Nodemailer Docs](https://nodemailer.com/)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SPF/DKIM Setup](https://www.dmarcanalyzer.com/spf/how-to-create-an-spf-record/)

---

## 🔐 Seguridad

### ⚠️ Nunca hagas esto

❌ Subir `.env` a Git
❌ Compartir contraseñas de aplicación
❌ Usar tu email personal en producción
❌ Desactivar verificación SSL en producción

### ✅ Haz esto

✅ Usa variables de entorno
✅ Usa servicios dedicados (SendGrid, SES)
✅ Rota contraseñas regularmente
✅ Monitorea intentos fallidos
✅ Implementa rate limiting

---

## 🎯 Recomendación Final

**Para Desarrollo:**

```bash
# Opción 1: Mailtrap (sin enviar emails reales)
SMTP_HOST=smtp.mailtrap.io

# Opción 2: Gmail con contraseña de aplicación
SMTP_HOST=smtp.gmail.com
```

**Para Producción:**

```bash
# Opción 1: SendGrid (hasta 100/día gratis)
SMTP_HOST=smtp.sendgrid.net

# Opción 2: AWS SES (más barato a escala)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
```

---

¿Necesitas ayuda? Consulta `EMAIL_VERIFICATION_README.md` para más información sobre el flujo completo de verificación.
