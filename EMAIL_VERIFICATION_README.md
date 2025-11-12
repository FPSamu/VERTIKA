# Sistema de Verificación de Email

## 📧 Descripción

Este documento describe el sistema completo de verificación de email implementado en VERTIKA, que incluye:

1. **Verificación por Token**: Los usuarios reciben un email con un token único para verificar su cuenta
2. **Email de Bienvenida**: Después de verificar, se envía un email de bienvenida
3. **Notificación de Guía**: Cuando un usuario se convierte en guía, recibe un email de confirmación

## 🔐 Flujo de Verificación

### 1. Registro de Usuario

Cuando un usuario se registra en `/api/auth/register`:

1. Se crea el usuario con `emailVerified: false`
2. Se genera un token de verificación único (64 caracteres hexadecimales)
3. El token expira en 24 horas
4. Se envía un email con un enlace de verificación
5. Se devuelven los tokens JWT (access y refresh)

**Campos agregados al usuario:**
```typescript
{
  verificationToken: string,    // Token único para verificación
  verificationExpires: Date     // Fecha de expiración (24 horas)
}
```

### 2. Verificación de Email

El usuario hace clic en el enlace del email: `GET /api/auth/verify-email/{token}`

1. Se busca el usuario con ese token
2. Se verifica que el token no haya expirado
3. Si es válido:
   - Se marca `emailVerified: true`
   - Se eliminan `verificationToken` y `verificationExpires`
   - Se envía un email de bienvenida
4. Se devuelve el usuario actualizado

### 3. Solicitud para ser Guía

Cuando un usuario verificado solicita ser guía en `/api/auth/request-guide`:

1. Se verifica que `emailVerified === true`
2. Se agrega el rol `'guide'` al array de roles
3. Se envía un email de aprobación como guía
4. El usuario puede ahora crear experiencias

## 🛠️ Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion

# URL del frontend
FRONTEND_URL=http://localhost:5173
```

### Configuración para Gmail

1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una contraseña de aplicación:
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro dispositivo"
   - Copia la contraseña generada
3. Usa esta contraseña en `SMTP_PASSWORD`

### Configuración para Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@outlook.com
SMTP_PASSWORD=tu_contraseña
```

## 📨 Tipos de Emails

### 1. Email de Verificación

**Cuándo se envía:** Al registrarse
**Contiene:**
- Enlace de verificación con token único
- Nota de expiración (24 horas)
- Botón destacado "Verificar Email"

### 2. Email de Bienvenida

**Cuándo se envía:** Después de verificar el email
**Contiene:**
- Mensaje de bienvenida personalizado
- Lista de características de la plataforma
- Enlaces a explorar experiencias y convertirse en guía

### 3. Email de Aprobación como Guía

**Cuándo se envía:** Al solicitar y aprobar el rol de guía
**Contiene:**
- Confirmación del nuevo rol
- Información sobre qué puede hacer como guía
- Enlace para crear la primera experiencia

## 🔗 Endpoints

### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "dateOfBirth": "1995-05-15"
}
```

**Respuesta:** 
- 201: Usuario creado, email de verificación enviado
- 400: Datos inválidos
- 409: Email ya existe

### Verificar Email
```http
GET /api/auth/verify-email/{token}
```

**Respuesta:**
- 200: Email verificado exitosamente
- 400: Token inválido o expirado

### Solicitar ser Guía
```http
POST /api/auth/request-guide
Authorization: Bearer {accessToken}
```

**Respuesta:**
- 200: Ahora eres un guía
- 403: Email no verificado
- 409: Ya eres un guía

## 🧪 Pruebas de Desarrollo

### Herramienta de Correo de Prueba

Para desarrollo sin configurar un servidor SMTP real, puedes usar:

1. **Mailtrap** (https://mailtrap.io)
   ```bash
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=tu_usuario_mailtrap
   SMTP_PASSWORD=tu_contraseña_mailtrap
   ```

2. **Ethereal Email** (https://ethereal.email)
   - Crea una cuenta gratuita
   - Copia las credenciales SMTP
   - Los emails se pueden ver en su bandeja web

### Verificar Emails en Base de Datos

Para ver los tokens generados durante desarrollo:

```javascript
// En MongoDB Compass o shell
db.users.find({ email: "usuario@ejemplo.com" }, {
  verificationToken: 1,
  verificationExpires: 1,
  emailVerified: 1
})
```

## ⚠️ Seguridad

### Mejores Prácticas Implementadas

1. **Tokens únicos y seguros**: Generados con `crypto.randomBytes(32)`
2. **Expiración de tokens**: Los tokens expiran en 24 horas
3. **Un solo uso**: Los tokens se eliminan después de usarse
4. **Verificación obligatoria**: Los guías deben tener email verificado

### Recomendaciones Adicionales

1. **Rate Limiting**: Implementa límite de intentos de verificación
2. **Reenvío de Email**: Agrega endpoint para reenviar email de verificación
3. **HTTPS**: Usa HTTPS en producción para enlaces seguros
4. **Logs**: Registra intentos de verificación fallidos

## 🚀 Próximos Pasos Sugeridos

1. **Reenvío de Verificación**: Endpoint para reenviar email si expiró
   ```
   POST /api/auth/resend-verification
   ```

2. **Notificaciones adicionales**: 
   - Email cuando se crea una reservación
   - Email cuando se recibe una reseña
   - Recordatorios de experiencias próximas

3. **Plantillas personalizadas**: 
   - Agregar logo de VERTIKA
   - Diseño responsive mejorado
   - Soporte para múltiples idiomas

4. **Gestión de preferencias**: 
   - Permitir a usuarios elegir qué emails recibir
   - Frecuencia de notificaciones

## 📄 Estructura de Archivos

```
src/
├── app/
│   ├── auth/
│   │   ├── auth.service.ts      # Lógica de verificación
│   │   ├── auth.controller.ts   # Endpoint de verificación
│   │   └── auth.routes.ts       # Ruta GET /verify-email/:token
│   ├── services/
│   │   └── email.service.ts     # Servicio de envío de emails
│   └── users/
│       └── user.model.ts        # Modelo con campos de verificación
```

## 🐛 Solución de Problemas

### Los emails no se envían

1. Verifica las credenciales SMTP en `.env`
2. Revisa los logs del servidor para errores
3. Confirma que el puerto no está bloqueado por firewall
4. Para Gmail, asegúrate de usar contraseña de aplicación

### Token inválido o expirado

1. Los tokens expiran en 24 horas
2. Los tokens solo se pueden usar una vez
3. Usa el endpoint de reenvío (cuando se implemente)

### Email verificado pero no puede ser guía

1. Verifica que `emailVerified === true` en la base de datos
2. Asegúrate de que el token de acceso esté actualizado
3. Revisa que el middleware de autenticación funcione correctamente

## 📞 Soporte

Para más información sobre el sistema de autenticación completo, consulta `AUTH_README.md`.
