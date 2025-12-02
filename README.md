<p align="center">
  <img src="https://imgur.com/G39Rg8s.png" alt="Logo VERTIKA" height="240">
</p>

**VERTIKA** es una plataforma web que conecta a usuarios con guías y agencias de montaña para reservar experiencias al aire libre.
Busca ofrecer un servicio confiable, accesible y regional, verificación de guías y un sistema de reseñas para fomentar la seguridad y transparencia.

## 🚀 Características Principales

### Autenticación y Seguridad

- ✅ **Sistema completo de autenticación** con JWT (Access & Refresh Tokens)
- ✅ **Verificación de email** con tokens de un solo uso (24h de validez)
- ✅ **Recuperación de contraseña** con tokens de 5 minutos (enviados por email)
- ✅ **Roles de usuario**: Customer (cliente) y Guide (guía)
- ✅ **Middleware de autorización** basado en roles
- ✅ **Encriptación de contraseñas** con bcrypt

### Gestión de Usuarios

- ✅ **Registro e inicio de sesión** con validación de datos
- ✅ **CRUD completo de usuarios** (crear, leer, actualizar, eliminar)
- ✅ **Sistema de solicitud para ser guía** (requiere email verificado)
- ✅ **Perfil de usuario** protegido con autenticación

### Gestión de Experiencias y Reviews

- ✅ **Creación de experiencias** con validación de guía verificado
- ✅ **Sistema de carga de fotos a S3** para experiencias y reviews
- ✅ **Subir fotos durante la creación** o agregarlas posteriormente
- ✅ **Máximo 10 fotos por experiencia** (5MB cada una)
- ✅ **Máximo 5 fotos por review** (5MB cada una)
- ✅ **Almacenamiento en AWS S3** con URLs públicas
- ✅ **Validación de propiedad** para modificar experiencias

### Sistema de Emails

- ✅ **Email de verificación** al registrarse (con diseño HTML profesional)
- ✅ **Email de bienvenida** después de verificar la cuenta
- ✅ **Email de aprobación** al convertirse en guía
- ✅ **Email de recuperación de contraseña** con enlace seguro (5 min de validez)
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
│   │   │   ├── auth.ts              # Middleware de autenticación JWT
│   │   │   ├── guideVerification.ts # Middleware de verificación de guía (usuario autenticado)
│   │   │   ├── guideVerificationByUserId.ts # Middleware de verificación de guía (por userId del body)
│   │   │   ├── experienceOwnership.ts # Middleware de validación de propiedad de experiencia
│   │   │   └── upload/              # Middlewares de carga de archivos
│   │   │       ├── upload_s3_image.ts      # Upload de imágenes de perfil a S3
│   │   │       ├── upload_s3_experience.ts # Upload de fotos de experiencias a S3
│   │   │       └── upload_s3_review.ts     # Upload de fotos de reviews a S3
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
- **AWS SDK S3** - Almacenamiento de imágenes en S3
- **Multer** + **Multer-S3** - Carga de archivos multipart

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

# Configuración de AWS S3 (para carga de imágenes)
S3_ACCESS_KEY='tu_access_key'
S3_SECRET_KEY='tu_secret_key'
S3_REGION='us-east-1'
S3_BUCKET='tu-bucket-name'
```

### 4. Iniciar el servidor

**Modo desarrollo** (con hot reload):

```bash
npm run dev
```

El servidor estará disponible en: http://localhost:3000

## Sockets

Se implementó Socket.IO para manejar notificaciones en tiempo real. Ejemplo: Cuando llega una nueva reserva o cancelación, el servidor emite un evento al usuario correspondiente (ej. guía) y el cliente actualiza la interfaz automáticamente: la campana parpadea y se muestra la notificación en el modal sin recargar la página. Esto mejora la experiencia del usuario y permite recibir alertas instantáneas directamente en la vista.

Integración de Sockets en reservation-controller

```reservation.controller.ts
//Notificacion
const guide = await Guide.findById(experience.guideId);
const guideUserId = guide?.userId;

if (guideUserId) {
  const guideNotification = new Notification({
  userId: guideUserId,   // user._id del guia
  actorId: user._id,     // quien hizo la accion
  type: "reservation",
  title: "Nueva reserva",
   message: `${user.name} ha reservado tu experiencia "${experience.title}"`,
  data: {
            reservationId: newReservation._id,
            experienceId: experience._id,
        },
        read: false,
      });

  await guideNotification.save()
  console.log("Notificación creada para el guía:", guideNotification);
  //envia la notification al room del user
  getIO().to(guideUserId.toString()).emit('newNotification', guideNotification);
  console.log('Evento newNotification emitido por socket', guideNotification);
```

Integración de Sockets en cliente

```main.js
//Socket
// Configurar socket **después** de crear HTML
const socket = io('/');
socket.emit('join', user._id); //Se une al room de su user

socket.on('newNotification', (notif) => { //Recibe datos enviados desde el servidor
console.log('Nueva notificación:', notif);

const bell = document.getElementById('notifIcon');
//Blink y anadir notificacion
if (bell) {
    bell.classList.add('blink');
    setTimeout(() => bell.classList.remove('blink'), 2000);

  if (!bell.querySelector('.notif-badge')) {
     const badge = document.createElement('span');
     badge.classList.add('notif-badge');
     bell.appendChild(badge);
  }

  }
  //Agregar notificacion dinamica
  const list = document.getElementById('notificationsList');
  if (list) {
      const li = document.createElement('li');
      li.textContent = notif.message;
      list.prepend(li);
  }
});
```

Reservar experiencia
<img src="https://imgur.com/hXzy4NV.png" alt="Perfil" height="380">

Campana de notificaciones
<img src="https://imgur.com/u8tG52o.png" alt="Perfil" height="380">

Cancelar reservación

<img src="https://imgur.com/NftYrx8.png" alt="Perfil" height="380">

Despliegue de notificaciones
<img src="https://imgur.com/xhIEPAG.png" alt="Perfil" height="380">

## Carga de Archivos

Esta entrega implementa la funcionalidad de subida, almacenamiento y visualización de archivos en la nube usando buckets de **AWS S3**. Se ha integrado tanto en el backend (API) como en las vistas del frontend, considerando permisos y validaciones.

Middleware para subir archivos a AWS S3, específicamente diseñado para subir imágenes de perfil de usuario.

```upload_s3_profileImage.ts
const s3Storage = multerS3({
  s3,
  bucket: BUCKET,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  acl: "public-read",
  key: (req: Request, file, cb) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      // Si no está autenticado, rechazamos mediante cb con error para que multer lo capture
      return cb(new Error("S3Storage: No autenticado"), "");
    }
    const key = `users/${userId}/profile.png`; // carpeta por user
    cb(null, key);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  console.log("multer-s3 -> fileFilter called", file.originalname, file.mimetype);
  cb(null, !!file.mimetype && file.mimetype.startsWith("image/"));
};

export const uploadS3Profile = multer({
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

Pantalla de cambio de imagen de perfil

<img src="https://imgur.com/E24kVW5.png" alt="Perfil" height="380">
<img src="https://imgur.com/zaLtcu2.png" alt="Perfil Foto" height="400">

Objetos en el bucket de S3

<img src="https://imgur.com/ecyKsum.png" alt="S3" height="340">
<img src="https://imgur.com/4ZUlMlG.png" alt="S3 profile" height="240">

Visualización de experiencias

<img src="https://imgur.com/uOfvuWe.png" alt="S3" height="440">

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

**Solicitar recuperación de contraseña**

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

- Envía un email con enlace de recuperación
- El enlace expira en 5 minutos
- Responde con mensaje genérico por seguridad

**Restablecer contraseña**

```http
POST /api/auth/reset-password/{token}
Content-Type: application/json

{
  "password": "NewPassword123"
}
```

- Usa el token recibido en el email
- La contraseña debe cumplir requisitos de seguridad
- Token se invalida después del uso

> 📖 **Documentación completa**: Ver [RESET_PASSWORD_GUIDE.md](./RESET_PASSWORD_GUIDE.md) para detalles del flujo de recuperación

#### Experiencias (`/api/experiences`)

**Crear experiencia con fotos**

```http
POST /api/experiences
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Body (form-data):
userId: "69151fa525a16fe4e4157ccb"    # ID del usuario (debe ser guía verificado)
title: "Ascenso al Pico de Orizaba"
description: "Ascenso de 2 días..."
activity: "alpinismo"
location: "Pico de Orizaba, Puebla"
difficulty: "difícil"
date: "2025-11-15T08:00:00Z"
maxGroupSize: "6"
pricePerPerson: "8500"
photos: [file1.jpg]                    # Hasta 10 fotos (5MB c/u)
photos: [file2.jpg]
```

- Valida que el `userId` corresponda a un guía verificado
- Obtiene automáticamente el `guideId` de la colección `guides`
- Sube las fotos a S3 y almacena las URLs
- Crea la experiencia en estado `draft`

**Agregar fotos a experiencia existente**

```http
POST /api/experiences/{id}/upload-photos
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Body (form-data):
photos: [file3.jpg]
photos: [file4.jpg]
```

- Solo el propietario de la experiencia puede agregar fotos
- Las fotos se agregan al array existente (no se reemplazan)
- Máximo 10 fotos por solicitud

**Listar experiencias**

```http
GET /api/experiences
```

**Obtener experiencia por ID**

```http
GET /api/experiences/{id}
```

**Publicar experiencia**

```http
PATCH /api/experiences/{id}/publish
Authorization: Bearer {accessToken}
```

**Archivar experiencia**

```http
PATCH /api/experiences/{id}/archive
Authorization: Bearer {accessToken}
```

#### Reviews (`/api/reviews`)

**Crear review con fotos**

```http
POST /api/reviews
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Body (form-data):
reservationId: "69151fdb25a16fe4e4157ccc"
userId: "69151fa525a16fe4e4157ccb"
experienceId: "69151fdb25a16fe4e4157ccc"
guideId: "69151fa525a16fe4e4157cca"
experienceRating: "5"
guideRating: "5"
comment: "¡Excelente experiencia!"
photos: [file1.jpg]                    # Hasta 5 fotos (5MB c/u)
photos: [file2.jpg]
```

- Disponible para cualquier usuario autenticado
- Sube las fotos a S3 automáticamente
- No requiere rol de guía

**Agregar fotos a review existente**

```http
POST /api/reviews/{id}/upload-photos
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Body (form-data):
photos: [file3.jpg]
```

- Solo el creador de la review puede agregar fotos
- Máximo 5 fotos por solicitud

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
5. **Crear experiencia con fotos**: Guía crea experiencias con hasta 10 fotos
6. **Publicar experiencia**: Guía publica la experiencia para que sea visible
7. **Reservar**: Usuario reserva una experiencia
8. **Reseña con fotos**: Usuario deja una reseña con hasta 5 fotos después de la experiencia

### Flujo de Carga de Fotos

#### Para Experiencias (solo guías verificados):

**Opción 1: Durante la creación** (Recomendado)

```
1. Usuario envía userId en el body
2. Sistema valida que userId sea un guía verificado
3. Sistema busca el guía en la colección guides
4. Sistema obtiene automáticamente el guideId
5. Multer sube las fotos a S3 (hasta 10)
6. Sistema crea la experiencia con las URLs de las fotos
```

**Opción 2: Después de crear**

```
1. Usuario autenticado (guía) solicita agregar fotos
2. Sistema valida que sea el propietario de la experiencia
3. Multer sube las fotos a S3 (hasta 10)
4. Sistema agrega las URLs al array existente
```

#### Para Reviews (cualquier usuario):

**Opción 1: Durante la creación** (Recomendado)

```
1. Usuario autenticado crea review
2. Multer sube las fotos a S3 (hasta 5)
3. Sistema crea la review con las URLs de las fotos
```

**Opción 2: Después de crear**

```
1. Usuario autenticado (creador) solicita agregar fotos
2. Sistema valida que sea el propietario de la review
3. Multer sube las fotos a S3 (hasta 5)
4. Sistema agrega las URLs al array existente
```

**Almacenamiento en S3:**

- Experiencias: `experiences/{userId}/{uuid}.{ext}`
- Reviews: `reviews/{userId}/{uuid}.{ext}`
- ACL: `public-read` (URLs accesibles públicamente)
- Límite de tamaño: 5MB por foto

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
- **Recuperación de contraseña con tokens de 5 minutos**
- Gestión de usuarios (CRUD)
- Sistema de roles (customer/guide)
- Envío de emails (verificación, bienvenida, aprobación, recuperación)
- Documentación con Swagger
- **Módulo de experiencias con carga de fotos a S3**
- **Sistema de reviews con carga de fotos a S3**
- **Validación de guías verificados por userId**
- **Validación de propiedad de experiencias**

### 🔄 En Desarrollo

- Sistema de reservaciones
- Integración de pagos
- Panel de administración
- Sistema de notificaciones en tiempo real

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
