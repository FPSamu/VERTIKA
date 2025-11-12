# Sistema de Autenticación - VERTIKA

Este documento describe el sistema de autenticación implementado en el backend de VERTIKA.

## Características

- ✅ Registro de usuarios
- ✅ Inicio de sesión con JWT
- ✅ Refresh tokens para renovar access tokens
- ✅ Cierre de sesión
- ✅ Middleware de autenticación
- ✅ Middleware de roles
- ✅ Validaciones de datos
- ✅ Encriptación de contraseñas con bcrypt

## Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example` y configura las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=vertika
USERS_COLLECTION=users

# Secretos JWT (¡IMPORTANTE! Cambiar en producción)
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secreto_super_seguro_aqui

# Expiración de tokens
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

## Endpoints de Autenticación

### 1. Registro de Usuario

**POST** `/api/auth/register`

Registra un nuevo usuario en el sistema.

**Body:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "dateOfBirth": "1995-05-15"
}
```

**Validaciones:**

- `name`: 2-100 caracteres
- `email`: Email válido y único
- `password`: Mínimo 8 caracteres, debe contener mayúsculas, minúsculas y números
- `dateOfBirth`: Usuario debe ser mayor de 18 años

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "roles": ["user"],
      "emailVerified": false,
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Inicio de Sesión

**POST** `/api/auth/login`

Inicia sesión con credenciales de usuario.

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": { /* datos del usuario */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 3. Renovar Access Token

**POST** `/api/auth/refresh`

Genera un nuevo access token usando el refresh token.

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Token actualizado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Cerrar Sesión

**POST** `/api/auth/logout`

**Headers:**

```sheel
Authorization: Bearer <access_token>
```

Cierra la sesión del usuario y revoca el refresh token.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### 5. Obtener Perfil

**GET** `/api/auth/profile`

**Headers:**

```shell
Authorization: Bearer <access_token>
```

Obtiene la información del usuario autenticado.

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "roles": ["user"],
      "emailVerified": false,
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    }
  }
}
```

## Uso de Middlewares

### Middleware de Autenticación

Protege rutas que requieren autenticación:

```typescript
import { authMiddleware } from './app/middlewares/auth';

router.get('/ruta-protegida', authMiddleware, controller);
```

### Middleware de Roles

Protege rutas que requieren roles específicos:

```typescript
import { authMiddleware, roleMiddleware } from './app/middlewares/auth';

// Solo guías pueden acceder
router.post('/crear-experiencia', 
  authMiddleware, 
  roleMiddleware('guide'), 
  controller
);

// Guías o usuarios pueden acceder
router.get('/ver-experiencia', 
  authMiddleware, 
  roleMiddleware('guide', 'user'), 
  controller
);
```

### Middleware de Autenticación Opcional

Para rutas donde la autenticación es opcional:

```typescript
import { optionalAuthMiddleware } from './app/middlewares/auth';

router.get('/experiencias-publicas', 
  optionalAuthMiddleware, 
  controller
);
```

## Estructura de Tokens

### Access Token

- **Duración:** 15 minutos (configurable)
- **Uso:** Autorización de peticiones
- **Contenido:**

  ```json
  {
    "userId": "...",
    "email": "...",
    "roles": ["user"]
  }
  ```

### Refresh Token

- **Duración:** 7 días (configurable)
- **Uso:** Renovar access tokens
- **Almacenamiento:** Base de datos (asociado al usuario)

## Flujo de Autenticación

1. **Registro/Login:** El usuario recibe ambos tokens
2. **Peticiones:** Usa el access token en el header `Authorization: Bearer <token>`
3. **Token expirado:** Cuando el access token expira, usar el refresh token para obtener uno nuevo
4. **Logout:** Revoca el refresh token de la base de datos

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens JWT firmados con secretos únicos
- ✅ Refresh tokens almacenados en BD (revocables)
- ✅ Validación de datos de entrada
- ✅ Edad mínima de 18 años
- ✅ Emails únicos

## Roles de Usuario

Actualmente el sistema soporta dos roles:

- **`user`**: Usuario regular (rol por defecto)
- **`guide`**: Guía de montañismo

Los usuarios pueden solicitar convertirse en guías posteriormente (funcionalidad a implementar).

## Errores Comunes

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| 400 | Datos inválidos | Los datos enviados no cumplen las validaciones |
| 401 | Token inválido o expirado | El token no es válido o ha expirado |
| 401 | No autorizado | No se proporcionó token o no es válido |
| 403 | Sin permisos | El usuario no tiene los permisos necesarios |
| 409 | Usuario ya existe | El email ya está registrado |
| 404 | Usuario no encontrado | El usuario no existe en la BD |

## Próximos Pasos

- [ ] Verificación de email
- [ ] Recuperación de contraseña
- [ ] Sistema para solicitar ser guía
- [ ] Validación adicional para guías
- [ ] Rate limiting para prevenir ataques
- [ ] 2FA (Two-Factor Authentication)

## Testing

Para probar los endpoints puedes usar:

- **Swagger UI:** `http://localhost:3000/swagger`
- **Postman:** Importar la colección de endpoints
- **curl:** Ejemplos de comandos

### Ejemplo con curl

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123",
    "dateOfBirth": "1995-05-15"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123"
  }'

# Perfil (requiere token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```
