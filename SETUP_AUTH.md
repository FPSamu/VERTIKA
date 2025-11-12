# 🚀 Sistema de Autenticación Implementado

## ✅ Archivos Creados/Modificados

### Nuevos Archivos:
1. ✅ `src/app/auth/auth.service.ts` - Servicio de autenticación con lógica de negocio
2. ✅ `src/app/auth/auth.controller.ts` - Controladores para las rutas de autenticación
3. ✅ `src/app/auth/auth.validators.ts` - Validadores para los endpoints
4. ✅ `src/app/auth/auth.routes.ts` - Definición de rutas de autenticación
5. ✅ `src/app/types/express.d.ts` - Tipos extendidos de Express para TypeScript
6. ✅ `AUTH_GUIDE.md` - Documentación completa del sistema de autenticación

### Archivos Modificados:
1. ✅ `src/app/users/user.model.ts` - Añadido campo `password` y `refreshToken`
2. ✅ `src/app/varTypes.ts` - Cambiado tipo 'customer' a 'user'
3. ✅ `src/app/middlewares/auth.ts` - Middleware completo de autenticación y roles
4. ✅ `src/app/routes.ts` - Integradas las rutas de autenticación
5. ✅ `src/index.ts` - Habilitada conexión a MongoDB
6. ✅ `.env.example` - Añadidas variables de entorno necesarias

## 📋 Configuración Necesaria

### 1. Instalar Dependencias Adicionales

Si no están instaladas, ejecuta:

```bash
npm install mongodb
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
PORT=3000

# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=vertika
USERS_COLLECTION=users

# JWT Secrets (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=vertika_secret_super_seguro_2025
JWT_REFRESH_SECRET=vertika_refresh_secret_super_seguro_2025

# Expiración de tokens
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

**IMPORTANTE:** Cambia los secretos JWT por valores únicos y seguros.

### 3. Base de Datos

El sistema creará automáticamente la colección de usuarios. MongoDB debe estar corriendo en:
- URL: `mongodb://localhost:27017`
- Base de datos: `vertika`
- Colección: `users`

## 🎯 Endpoints Disponibles

### Públicos (No requieren autenticación):
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar access token

### Protegidos (Requieren autenticación):
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

## 🧪 Prueba Rápida

### 1. Iniciar el servidor:

```bash
npm run dev
```

### 2. Registrar un usuario:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123",
    "dateOfBirth": "1995-05-15"
  }'
```

### 3. Iniciar sesión:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123"
  }'
```

Guarda el `accessToken` que recibes en la respuesta.

### 4. Obtener perfil (usando el token):

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

## 🔐 Uso de Middlewares en Otras Rutas

### Proteger una ruta con autenticación:

```typescript
import { authMiddleware } from './app/middlewares/auth';

router.get('/ruta-protegida', authMiddleware, tuControlador);
```

### Proteger con roles específicos:

```typescript
import { authMiddleware, roleMiddleware } from './app/middlewares/auth';

// Solo guías
router.post('/crear-experiencia', 
  authMiddleware, 
  roleMiddleware('guide'), 
  crearExperienciaController
);

// Guías o usuarios
router.get('/ver-experiencia', 
  authMiddleware, 
  roleMiddleware('guide', 'user'), 
  verExperienciaController
);
```

### Autenticación opcional:

```typescript
import { optionalAuthMiddleware } from './app/middlewares/auth';

// Si hay token lo valida, si no hay, permite continuar
router.get('/experiencias-publicas', 
  optionalAuthMiddleware, 
  listarExperienciasController
);
```

## 📝 Acceder a Datos del Usuario en Controladores

En tus controladores, puedes acceder a la información del usuario autenticado:

```typescript
export const miControlador = async (req: Request, res: Response) => {
  const userId = req.userId;           // ID del usuario
  const userEmail = req.userEmail;     // Email del usuario
  const userRoles = req.userRoles;     // Roles del usuario ['user'] o ['guide']
  
  // Tu lógica aquí...
};
```

## 🔄 Flujo de Tokens

1. **Login/Register:** Usuario recibe `accessToken` (15 min) y `refreshToken` (7 días)
2. **Peticiones:** Usar `accessToken` en header: `Authorization: Bearer <token>`
3. **Token Expirado:** Cuando `accessToken` expire, usar `refreshToken` en `/api/auth/refresh`
4. **Logout:** Revoca el `refreshToken` de la base de datos

## 📚 Documentación Completa

Para más detalles, consulta: `AUTH_GUIDE.md`

## 🎉 Sistema Listo!

El sistema de autenticación está completamente funcional y listo para usar. Ahora puedes:

- Registrar usuarios
- Iniciar sesión
- Proteger rutas
- Validar roles
- Renovar tokens
- Cerrar sesión

## 🚧 Próximos Pasos Sugeridos

1. Implementar verificación de email
2. Añadir recuperación de contraseña
3. Crear endpoint para que usuarios soliciten ser guías
4. Implementar rate limiting
5. Añadir tests unitarios
