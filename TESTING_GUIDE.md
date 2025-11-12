# 🧪 Guía Rápida de Pruebas - Verificación de Email

## ⚡ Configuración Rápida (5 minutos)

### Paso 1: Configurar Mailtrap (Recomendado para desarrollo)

1. **Ir a Mailtrap:**
   - Visita: https://mailtrap.io
   - Crea cuenta gratuita (con email o GitHub)

2. **Obtener Credenciales:**
   - En el dashboard, ve a "My Inbox"
   - Copia las credenciales SMTP

3. **Configurar `.env`:**
   ```bash
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_SECURE=false
   SMTP_USER=abc123def456        # Tu usuario de Mailtrap
   SMTP_PASSWORD=xyz789uvw012    # Tu password de Mailtrap
   FRONTEND_URL=http://localhost:5173
   ```

4. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

---

## 🔬 Prueba Completa del Flujo

### 1. Registrar Usuario

**Request:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123",
  "dateOfBirth": "1995-05-15"
}
```

**Respuesta esperada (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "roles": ["user"],
      "emailVerified": false,
      ...
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

**✅ Verificar:**
- Usuario creado con `emailVerified: false`
- Email recibido en Mailtrap inbox
- Email contiene enlace con token

---

### 2. Ver Email en Mailtrap

**Ir a Mailtrap inbox:**
- Deberías ver un email nuevo
- Asunto: "Verifica tu email en VERTIKA"
- Contiene botón "Verificar Email"
- Tiene un enlace con formato: `http://localhost:5173/verify-email/{TOKEN}`

**Copiar el token:**
- El token es el último segmento de la URL
- Ejemplo: si el enlace es `http://localhost:5173/verify-email/abc123...`
- El token es: `abc123...`

---

### 3. Verificar Email

**Request:**
```bash
GET http://localhost:3000/api/auth/verify-email/{TOKEN_COPIADO}
```

**Ejemplo:**
```bash
GET http://localhost:3000/api/auth/verify-email/a1b2c3d4e5f6...
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "roles": ["user"],
      "emailVerified": true,
      ...
    }
  }
}
```

**✅ Verificar:**
- `emailVerified` ahora es `true`
- Nuevo email de bienvenida en Mailtrap
- Asunto: "¡Bienvenido a VERTIKA!"

---

### 4. Solicitar ser Guía

**Request:**
```bash
POST http://localhost:3000/api/auth/request-guide
Authorization: Bearer {ACCESS_TOKEN_DEL_PASO_1}
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "message": "Ahora eres un guía. ¡Puedes empezar a crear experiencias!",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "roles": ["user", "guide"],
      "emailVerified": true,
      ...
    }
  }
}
```

**✅ Verificar:**
- Usuario tiene rol `"guide"`
- Nuevo email en Mailtrap
- Asunto: "¡Ahora eres un guía en VERTIKA!"

---

## 🎯 Casos de Prueba

### ✅ Casos Exitosos

| Caso | Endpoint | Resultado Esperado |
|------|----------|-------------------|
| Registro nuevo usuario | POST /register | 201, email enviado |
| Verificar con token válido | GET /verify-email/:token | 200, emailVerified=true |
| Ser guía con email verificado | POST /request-guide | 200, rol "guide" agregado |

---

### ❌ Casos de Error

#### Token Inválido
```bash
GET http://localhost:3000/api/auth/verify-email/token_invalido
```
**Respuesta (400):**
```json
{
  "success": false,
  "message": "Token de verificación inválido o expirado"
}
```

---

#### Token Expirado (después de 24 horas)
```bash
GET http://localhost:3000/api/auth/verify-email/{TOKEN_VIEJO}
```
**Respuesta (400):**
```json
{
  "success": false,
  "message": "Token de verificación inválido o expirado"
}
```

---

#### Solicitar ser guía sin verificar email
```bash
POST http://localhost:3000/api/auth/request-guide
Authorization: Bearer {TOKEN_USUARIO_NO_VERIFICADO}
```
**Respuesta (403):**
```json
{
  "success": false,
  "message": "Debes verificar tu email antes de solicitar ser guía"
}
```

---

#### Solicitar ser guía cuando ya eres guía
```bash
POST http://localhost:3000/api/auth/request-guide
Authorization: Bearer {TOKEN_USUARIO_YA_GUIA}
```
**Respuesta (409):**
```json
{
  "success": false,
  "message": "Ya eres un guía"
}
```

---

## 🔍 Verificar en Base de Datos

### Ver usuario en MongoDB:

```javascript
// MongoDB Compass o Shell
db.users.findOne({ email: "test@example.com" })
```

**Antes de verificar:**
```json
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "emailVerified": false,
  "verificationToken": "abc123def456...",
  "verificationExpires": ISODate("2025-01-XX..."),
  "roles": ["user"]
}
```

**Después de verificar:**
```json
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "emailVerified": true,
  // verificationToken y verificationExpires eliminados
  "roles": ["user"]
}
```

**Después de ser guía:**
```json
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "emailVerified": true,
  "roles": ["user", "guide"]
}
```

---

## 🛠️ Herramientas de Prueba

### Postman / Insomnia

**Colección sugerida:**

```json
{
  "name": "VERTIKA - Email Verification",
  "requests": [
    {
      "name": "1. Register User",
      "method": "POST",
      "url": "http://localhost:3000/api/auth/register",
      "body": {
        "name": "Test User",
        "email": "test@example.com",
        "password": "Password123",
        "dateOfBirth": "1995-05-15"
      }
    },
    {
      "name": "2. Verify Email",
      "method": "GET",
      "url": "http://localhost:3000/api/auth/verify-email/{{token}}"
    },
    {
      "name": "3. Request to be Guide",
      "method": "POST",
      "url": "http://localhost:3000/api/auth/request-guide",
      "headers": {
        "Authorization": "Bearer {{accessToken}}"
      }
    }
  ]
}
```

---

### cURL Commands

**1. Registrar:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "dateOfBirth": "1995-05-15"
  }'
```

**2. Verificar:**
```bash
curl http://localhost:3000/api/auth/verify-email/TOKEN_AQUI
```

**3. Ser guía:**
```bash
curl -X POST http://localhost:3000/api/auth/request-guide \
  -H "Authorization: Bearer ACCESS_TOKEN_AQUI"
```

---

### Thunder Client (VS Code Extension)

1. Instalar Thunder Client en VS Code
2. Crear nueva colección "VERTIKA"
3. Agregar los 3 requests del flujo
4. Usar variables de entorno para tokens

---

## 📊 Checklist de Pruebas

### Funcionalidad Básica
- [ ] ✅ Usuario puede registrarse
- [ ] ✅ Email de verificación se envía
- [ ] ✅ Email contiene token único
- [ ] ✅ Token es válido por 24 horas
- [ ] ✅ Usuario puede verificar con token
- [ ] ✅ Email de bienvenida se envía
- [ ] ✅ Usuario verificado puede ser guía
- [ ] ✅ Email de guía aprobado se envía

### Seguridad
- [ ] ✅ Token solo funciona una vez
- [ ] ✅ Token expira después de 24h
- [ ] ✅ Token inválido retorna error
- [ ] ✅ No puede ser guía sin verificar
- [ ] ✅ No puede ser guía dos veces

### Emails
- [ ] ✅ Plantilla de verificación correcta
- [ ] ✅ Plantilla de bienvenida correcta
- [ ] ✅ Plantilla de guía correcta
- [ ] ✅ Enlaces funcionan
- [ ] ✅ Diseño responsive

---

## 🐛 Troubleshooting Rápido

### "Error al enviar email"
**Solución:** Verifica credenciales SMTP en `.env`

### "Token inválido" en token recién creado
**Solución:** Asegúrate de copiar el token completo sin espacios

### Email no llega a Mailtrap
**Solución:** 
1. Revisa logs del servidor
2. Verifica que Mailtrap esté en el inbox correcto
3. Espera unos segundos

### Usuario no puede ser guía
**Solución:** Verifica que `emailVerified === true` en DB

---

## 🎉 Prueba Exitosa

Si completaste todos los pasos y recibiste los 3 emails en Mailtrap:

✅ **¡El sistema funciona correctamente!**

Puedes proceder a:
1. Configurar SMTP de producción (SendGrid, AWS SES)
2. Integrar con frontend
3. Implementar funcionalidades adicionales

---

## 📞 Soporte

- Ver documentación completa: `EMAIL_VERIFICATION_README.md`
- Configurar SMTP: `EMAIL_SETUP_README.md`
- Sistema de auth: `AUTH_README.md`

---

*Guía de pruebas para VERTIKA - Sistema de Verificación de Email*
