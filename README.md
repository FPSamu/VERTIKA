<p align="center">
  <img src="https://imgur.com/G39Rg8s.png" alt="Logo VERTIKA" height="240">
</p>

**VERTIKA** es una plataforma web que conecta a usuarios con guías y agencias de montaña para reservar experiencias al aire libre.
Busca ofrecer un servicio confiable, accesible y regional, verificación de guías y un sistema de reseñas para fomentar la seguridad y transparencia.

## 🚀 Características Principales

### Autenticación y Seguridad

- ✅ **Sistema completo de autenticación** con JWT (Access & Refresh Tokens)
- ✅ **Verificación de email** con tokens de un solo uso (24h de validez)
- ✅ **Roles de usuario**: Customer (cliente) y Guide (guía)
- ✅ **Middleware de autorización** basado en roles
- ✅ **Encriptación de contraseñas** con bcrypt

### Gestión de Usuarios

- ✅ **Registro e inicio de sesión** con validación de datos
- ✅ **CRUD completo de usuarios** (crear, leer, actualizar, eliminar)
- ✅ **Sistema de solicitud para ser guía** (requiere email verificado)
- ✅ **Perfil de usuario** protegido con autenticación

### Sistema de Emails

- ✅ **Email de verificación** al registrarse (con diseño HTML profesional)
- ✅ **Email de bienvenida** después de verificar la cuenta
- ✅ **Email de aprobación** al convertirse en guía
- ✅ **Configuración con Gmail** mediante contraseñas de aplicación

### API RESTful

- ✅ **Endpoints documentados** con Swagger UI
- ✅ **Validación de datos** con express-validator
- ✅ **Respuestas estandarizadas** en formato JSON
- ✅ **Manejo de errores** consistente

## 📁 Estructura del Proyecto

```
VERTIKA/
├── src/
│   ├── app/
│   │   ├── auth/                    # Módulo de autenticación
│   │   │   ├── auth.controller.ts   # Controladores de auth (register, login, verify, etc.)
│   │   │   ├── auth.service.ts      # Lógica de negocio de autenticación
│   │   │   ├── auth.routes.ts       # Rutas de autenticación (/api/auth/*)
│   │   │   └── auth.validators.ts   # Validadores de datos de entrada
│   │   │
│   │   ├── users/                   # Módulo de usuarios
│   │   │   ├── user.controller.ts   # Controladores CRUD de usuarios
│   │   │   ├── user.model.ts        # Modelo/Schema de Usuario
│   │   │   └── user.routes.ts       # Rutas de usuarios (/api/users/*)
│   │   │
│   │   ├── guides/                  # Módulo de guías
│   │   │   ├── guide.controller.ts
│   │   │   ├── guide.model.ts
│   │   │   └── guide.routes.ts
│   │   │
│   │   ├── experiences/             # Módulo de experiencias/expediciones
│   │   │   ├── experience.controller.ts
│   │   │   ├── experience.model.ts
│   │   │   └── experience.routes.ts
│   │   │
│   │   ├── reservations/            # Módulo de reservaciones
│   │   │   ├── reservation.controller.ts
│   │   │   ├── reservation.model.ts
│   │   │   └── reservation.routes.ts
│   │   │
│   │   ├── reviews/                 # Módulo de reseñas
│   │   │   ├── review.controller.ts
│   │   │   ├── review.model.ts
│   │   │   └── review.routes.ts
│   │   │
│   │   ├── services/                # Servicios auxiliares
│   │   │   └── email.service.ts     # Servicio de envío de emails (nodemailer)
│   │   │
│   │   ├── middlewares/             # Middlewares de Express
│   │   │   └── auth.ts              # Middleware de autenticación y roles
│   │   │
│   │   ├── types/                   # Tipos TypeScript personalizados
│   │   │   └── express.d.ts         # Extensiones de tipos para Express
│   │   │
│   │   ├── routes.ts                # Enrutador principal que agrupa todos los módulos
│   │   └── varTypes.ts              # Tipos y enums compartidos
│   │
│   ├── database/
│   │   └── index.ts                 # Configuración y conexión a MongoDB
│   │
│   ├── types.d.ts                   # Declaraciones de tipos globales
│   └── index.ts                     # Punto de entrada de la aplicación
│
├── .env                             # Variables de entorno (NO subir a Git)
├── .env.example                     # Ejemplo de configuración
├── package.json                     # Dependencias y scripts del proyecto
├── tsconfig.json                    # Configuración de TypeScript
├── swagger.config.ts                # Configuración de Swagger
│
└── README.md                        # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **Node.js** v20+ - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** v5.1.0 - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** v8.19.0 - ODM para MongoDB
- **JWT** (jsonwebtoken) - Autenticación con tokens
- **Bcrypt** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **Express Validator** - Validación de datos
- **Swagger** - Documentación de API
- **Dotenv** - Gestión de variables de entorno
- **Nodemon** - Hot reload en desarrollo

## ⚙️ Instalación y Configuración

### Prerrequisitos

- Node.js v20 o superior
- MongoDB Atlas (o MongoDB local)
- Cuenta de Gmail con contraseña de aplicación

### 1. Clonar el repositorio

```bash
git clone https://github.com/FPSamu/VERTIKA.git
cd VERTIKA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos MongoDB
MONGO_URL='mongodb+srv://usuario:password@cluster.mongodb.net/'
DB_NAME='vertika'
USERS_COLLECTION='users'

# Secretos JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET='tu_secreto_super_seguro_aqui'
JWT_REFRESH_SECRET='tu_refresh_secreto_super_seguro_aqui'

# Expiración de tokens
JWT_ACCESS_EXPIRATION='15m'
JWT_REFRESH_EXPIRATION='7d'

# Configuración de correo electrónico (Gmail)
EMAIL_ADDRESS='tu_email@gmail.com'
EMAIL_PASS='tu_contraseña_de_aplicacion'

# URL del frontend (para enlaces en emails)
FRONTEND_URL='http://localhost:5173'
```

### 4. Iniciar el servidor

**Modo desarrollo** (con hot reload):

```bash
npm run dev
```

El servidor estará disponible en: http://localhost:3000

## 📚 Uso de la API

### Endpoints Principales

#### Autenticación (`/api/auth`)

**Registrar usuario**

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

- Crea un nuevo usuario con rol "customer"
- Envía un email de verificación
- Retorna tokens JWT (access y refresh)

**Verificar email**

```http
GET /api/auth/verify-email/{token}
```

- Abre este enlace desde el email recibido
- Verifica la cuenta del usuario
- Muestra una página de confirmación

**Iniciar sesión**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Solicitar ser guía**

```http
POST /api/auth/request-guide
Authorization: Bearer {accessToken}
```

- Requiere email verificado
- Agrega el rol "guide" al usuario
- Envía email de confirmación

**Obtener perfil**

```http
GET /api/auth/profile
Authorization: Bearer {accessToken}
```

**Refrescar token**

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "tu_refresh_token"
}
```

**Cerrar sesión**

```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

#### Usuarios (`/api/users`)

```http
GET    /api/users              # Listar todos los usuarios
GET    /api/users/{id}         # Obtener usuario por ID
PATCH  /api/users/{id}         # Actualizar usuario
DELETE /api/users/{id}         # Eliminar usuario
```

> 🔒 Todos los endpoints de usuarios requieren autenticación

### Flujo de Trabajo Típico

1. **Registro**: Usuario se registra → Recibe email de verificación
2. **Verificación**: Usuario hace clic en el enlace → Email verificado
3. **Inicio de sesión**: Usuario inicia sesión → Recibe access token
4. **Solicitar ser guía**: Usuario con email verificado → Se convierte en guía
5. **Crear experiencia**: Guía crea experiencias de montañismo
6. **Reservar**: Usuario reserva una experiencia
7. **Reseña**: Usuario deja una reseña después de la experiencia

### Ver documentación interactiva

Abre http://localhost:3000/swagger y prueba los endpoints directamente desde el navegador.

## 🔐 Seguridad

- ✅ Contraseñas encriptadas con bcrypt (salt rounds: 10)
- ✅ Tokens JWT con expiración (15min access, 7 días refresh)
- ✅ Tokens de verificación de un solo uso con expiración de 24h
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Validación de datos de entrada con express-validator
- ✅ Variables sensibles en archivo .env (no incluido en Git)

## 🚧 Estado del Proyecto

### ✅ Completado

- Sistema de autenticación completo
- Verificación de email con tokens
- Gestión de usuarios (CRUD)
- Sistema de roles (customer/guide)
- Envío de emails (verificación, bienvenida, aprobación)
- Documentación con Swagger

### 🔄 En Desarrollo

- Módulo de experiencias/expediciones
- Sistema de reservaciones
- Sistema de reseñas
- Integración de pagos
- Panel de administración

## Diagrama ER

<p align="center">
   <img src="https://imgur.com/YRYY1Nl.png" alt="Diagrama ER" width="1200">
</p>

> El **Diagrama Entidad-Relación (ER)** muestra las principales entidades y cómo se relacionan en **VERTIKA**.

### Entidades principales:

- **Usuario** → representa al cliente que busca experiencias de montaña.
- **Guía** → perfiles verificados de guías de expedición.
- **Expedición** → cada salida de montaña (ej. Pico de Orizaba, Nevado de Colima).
- **Reserva** → conexión entre usuario y expedición, incluye pago y confirmación(todavia no implementados en el diagrama).
- **Reseña** → feedback de los usuarios hacia guías y expediciones.

### Relaciones clave:

- Un **usuario** puede hacer muchas **reservas**.
- Una **reserva** pertenece a un **usuario** y a una **expedición**.
- Un **guía** puede liderar varias **expediciones**.
- Cada **expedición** tiene múltiples **reseñas** (de distintos usuarios).

---

## Diagrama de Secuencia

<p align="center">
  <img src="https://imgur.com/0vgyKkc.png" alt="Diagrama de Secuencia" width="1000">
</p>

> Este diagrama representa el flujo típico de la **creacion de experiencia** y **reserva en VERTIKA**.

### Flujo de reserva:

1. El **usuario** busca expediciones disponibles en la plataforma.
2. El sistema despliega opciones con fecha, guía, precio y dificultad.
3. El **usuario** selecciona una expedición y solicita reservar.
4. El sistema valida disponibilidad y genera la solicitud de pago.
5. Tras confirmarse el pago, se crea la **reserva** en la base de datos.
6. El **guía** recibe la notificación y confirma la asistencia.
7. Al finalizar la expedición, el usuario puede dejar una **reseña**.
