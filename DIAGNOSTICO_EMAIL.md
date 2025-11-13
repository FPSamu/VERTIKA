# 🔍 Diagnóstico de Email - VERTIKA

## ✅ Pruebas Realizadas

### 1. Test de Configuración SMTP (test-email.js)

**Resultado:** ✅ ÉXITO

```
✅ Servidor SMTP configurado correctamente
✅ Email enviado exitosamente!
📬 Message ID: <72096847-723a-71ef-c086-3cf7c74c4f62@gmail.com>
```

**Conclusión:** La configuración de Gmail funciona correctamente. El transporter de nodemailer puede enviar emails.

---

### 2. Test de Registro de Usuario (test-register.js)

**Resultado:** ✅ Usuario creado exitosamente

```
📊 Status: 201 Created
User ID: 6914cb43cf8e911562b57a10
Email: prueba@example.com
```

**Conclusión:** El endpoint de registro funciona y el usuario se guarda en la base de datos.

---

## 🔍 Cosas a Verificar

### Paso 1: Revisar Logs del Servidor

Cuando ejecutaste el registro, deberías ver en la terminal del servidor (`npm run dev`) mensajes como:

```
🔐 Token de verificación generado para: prueba@example.com
💾 Usuario creado en BD con ID: 6914cb43cf8e911562b57a10
📧 Intentando enviar email de verificación a: prueba@example.com
📧 Preparando email para: prueba@example.com
📧 Asunto: ✅ Verifica tu email - VERTIKA
✅ Email enviado exitosamente a prueba@example.com
📬 Message ID: <algún-id>
✅ Email de verificación enviado correctamente a: prueba@example.com
```

**Si NO ves estos mensajes:**

- El servicio de email puede tener un problema
- Puede haber un error silencioso

**Si ves los mensajes pero dice "❌ No se pudo enviar":**

- Hay un error en el servicio de email
- Revisa la configuración de Gmail

---

### Paso 2: Revisar la Cuenta de Gmail

1. **Bandeja de Salida:**

   - Inicia sesión en: vertika.iteso@gmail.com
   - Ve a "Enviados"
   - Busca emails enviados hoy

2. **Si no hay emails en "Enviados":**
   - El email no se está enviando realmente
   - Aunque nodemailer dice que sí

---

### Paso 3: Revisar el Email del Destinatario

Si enviaste a tu email personal:

- Revisa bandeja de entrada
- **Revisa SPAM** (muy importante)
- Revisa "Todas" las carpetas

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Email no aparece en "Enviados" de Gmail

**Posible causa:** La contraseña de aplicación es incorrecta o expiró

**Solución:**

1. Ve a: https://myaccount.google.com/apppasswords
2. Elimina la contraseña anterior
3. Genera una nueva
4. Actualiza `.env` con la nueva contraseña
5. Reinicia el servidor

---

### Problema 2: Emails van a SPAM

**Solución:**

1. Configura SPF en el dominio (solo si tienes dominio propio)
2. Por ahora, marca el email como "No es spam"
3. Considera usar un servicio como SendGrid

---

### Problema 3: "Less Secure Apps" bloqueado

**Solución:**
Gmail ya no permite "apps menos seguras". **DEBES usar contraseña de aplicación** con verificación en 2 pasos.

---

### Problema 4: Límite de envío alcanzado

Gmail tiene límite de **500 emails por día**.

**Verificar:**

- Revisa cuántos emails has enviado hoy
- Si alcanzaste el límite, espera 24 horas

---

## 🔧 Pruebas Adicionales

### Test Manual desde el Código

Agrega esto temporalmente en `auth.service.ts` después de crear el usuario:

```typescript
// TEST: Enviar email directo
console.log("🧪 TEST: Enviando email directo...");
const testResult = await emailService.sendVerificationEmail(
  "TU_EMAIL_PERSONAL@gmail.com", // Pon tu email aquí
  "Test User",
  "test-token-123"
);
console.log("🧪 TEST Result:", testResult);
```

---

### Verificar en Base de Datos

```javascript
// En MongoDB Compass o Shell
db.users.findOne({ email: "prueba@example.com" });
```

Deberías ver:

```json
{
  "_id": ObjectId("..."),
  "email": "prueba@example.com",
  "verificationToken": "algún-token-largo",
  "verificationExpires": ISODate("2025-11-13..."),
  "emailVerified": false
}
```

---

## 📊 Estado Actual

### ✅ Funcionando:

- Configuración de Gmail (test directo funciona)
- Registro de usuarios
- Generación de tokens
- Guardado en base de datos

### ❓ Por Verificar:

- Si el servicio de email se ejecuta durante el registro
- Si hay errores silenciosos
- Si los emails llegan al destinatario

---

## 🎯 Próximos Pasos

1. **Ver los logs del servidor** cuando registres un usuario
2. **Revisar Gmail** (vertika.iteso@gmail.com) en la carpeta "Enviados"
3. **Revisar SPAM** en el email del destinatario
4. Si nada de eso funciona, probar con **Mailtrap** para desarrollo

---

## 🔄 Alternativa Temporal: Usar Mailtrap

Si quieres estar 100% seguro de que el código funciona, usa Mailtrap:

1. **Crear cuenta en Mailtrap.io**
2. **Obtener credenciales SMTP**
3. **Modificar `.env` temporalmente:**

   ```bash
   # Comentar Gmail
   # EMAIL_ADDRESS='vertika.iteso@gmail.com'
   # EMAIL_PASS='qpfj ckwy nytf lsuv'

   # Agregar Mailtrap
   SMTP_HOST='smtp.mailtrap.io'
   SMTP_PORT='2525'
   SMTP_USER='tu_usuario_mailtrap'
   SMTP_PASSWORD='tu_password_mailtrap'
   ```

4. **Modificar `email.service.ts`:**
   ```typescript
   constructor() {
     if (process.env.SMTP_HOST) {
       // Mailtrap
       this.transporter = nodemailer.createTransport({
         host: process.env.SMTP_HOST,
         port: parseInt(process.env.SMTP_PORT || '2525'),
         auth: {
           user: process.env.SMTP_USER,
           pass: process.env.SMTP_PASSWORD,
         },
       });
     } else {
       // Gmail
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

Con Mailtrap verás los emails en su interfaz web, aunque no lleguen realmente a ninguna bandeja.

---

## 📝 Información de la Prueba

**Fecha:** 12 de noviembre de 2025
**Usuario de prueba creado:** prueba@example.com
**ID:** 6914cb43cf8e911562b57a10
**Email enviado desde:** vertika.iteso@gmail.com
**Contraseña de aplicación:** qpfj ckwy nytf lsuv

---

**¿Qué sigue?**

Por favor revisa:

1. Los logs de tu servidor
2. La carpeta "Enviados" de vertika.iteso@gmail.com
3. La carpeta de SPAM de prueba@example.com (o tu email si lo cambiaste)

Y dime qué encuentras para continuar con el diagnóstico.
