# Pruebas Unitarias - VERTIKA

Este directorio contiene las pruebas unitarias para todos los endpoints de la API de VERTIKA.

## 🧪 Estructura de Tests

```
test/
├── setup.ts              # Configuración global de tests
├── auth.test.ts          # Tests de autenticación
├── users.test.ts         # Tests de usuarios
├── experiences.test.ts   # Tests de experiencias
├── reservations.test.ts  # Tests de reservaciones
├── reviews.test.ts       # Tests de reseñas
└── generateToken.ts      # Utilidad para generar tokens JWT
```

## 📦 Dependencias de Testing

Las pruebas utilizan:

- **Jest**: Framework de testing
- **Supertest**: Para pruebas HTTP
- **ts-jest**: Soporte de TypeScript en Jest

## ⚙️ Instalación

Instala las dependencias de testing:

```bash
npm install --save-dev jest @jest/globals ts-jest @types/jest supertest @types/supertest
```

## 🚀 Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Tests específicos

```bash
npm test -- auth.test.ts
npm test -- experiences.test.ts
```

### Con cobertura

```bash
npm test -- --coverage
```

### Modo watch (desarrollo)

```bash
npm test -- --watch
```

## 📝 Tests Implementados

### Auth Tests (`auth.test.ts`)

- ✅ Registro de usuario
- ✅ Login
- ✅ Refresh token
- ✅ Obtener perfil
- ✅ Recuperación de contraseña
- ✅ Logout
- ✅ Validaciones de campos

### User Tests (`users.test.ts`)

- ✅ Listar usuarios
- ✅ Obtener usuario por ID
- ✅ Actualizar perfil
- ✅ Eliminar usuario
- ✅ Autenticación requerida

### Experience Tests (`experiences.test.ts`)

- ✅ Listar experiencias
- ✅ Crear experiencia
- ✅ Obtener experiencia por ID
- ✅ Actualizar experiencia
- ✅ Publicar experiencia
- ✅ Archivar experiencia
- ✅ Eliminar experiencia
- ✅ Validación de propietario
- ✅ Validación de guía verificado

### Reservation Tests (`reservations.test.ts`)

- ✅ Listar reservaciones
- ✅ Crear reservación
- ✅ Obtener reservación por ID
- ✅ Obtener reservaciones por usuario
- ✅ Confirmar reservación
- ✅ Cancelar reservación
- ✅ Eliminar reservación

### Review Tests (`reviews.test.ts`)

- ✅ Listar reseñas
- ✅ Crear reseña
- ✅ Obtener reseña por ID
- ✅ Obtener reseñas por experiencia
- ✅ Obtener reseñas por guía
- ✅ Obtener reseñas por usuario
- ✅ Actualizar reseña
- ✅ Eliminar reseña
- ✅ Validación de calificaciones (0-5)

## 🔧 Configuración

### Variables de Entorno

Asegúrate de tener un archivo `.env` con las variables necesarias:

```env
MONGO_URL='mongodb+srv://...'
DB_NAME='vertika'
JWT_SECRET='tu_secreto_de_prueba'
```

### IDs de Prueba

Los tests utilizan IDs de muestra. Para ejecutar los tests correctamente:

1. **Opción 1**: Reemplaza los IDs en cada archivo de test con IDs reales de tu base de datos
2. **Opción 2**: Crea datos de semilla (seed) con IDs conocidos

Ejemplo de IDs a reemplazar:

```typescript
// En cada archivo .test.ts
const testUserId = "69151fa525a16fe4e4157cc9"; // Reemplazar
const experienceId = "69151fdb25a16fe4e4157ccc"; // Reemplazar
```

## 📊 Cobertura de Tests

Los tests cubren:

- ✅ Casos exitosos (happy path)
- ✅ Casos de error (validaciones)
- ✅ Autenticación y autorización
- ✅ Validación de datos de entrada
- ✅ Manejo de errores 404, 401, 400, 403

## 🎯 Ejemplo de Salida

```bash
 PASS  test/auth.test.ts
  Auth Endpoints
    POST /api/auth/register
      ✓ should register a new user successfully (245ms)
      ✓ should fail to register with duplicate email (123ms)
      ✓ should fail to register with invalid email (89ms)
    POST /api/auth/login
      ✓ should login successfully with valid credentials (156ms)
      ✓ should fail to login with wrong password (98ms)

Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        12.456s
```

## 🚨 Notas Importantes

### Base de Datos

- Los tests se ejecutan contra la base de datos configurada en `.env`
- **NO** uses la base de datos de producción
- Considera crear una base de datos específica para testing

### Datos de Prueba

- Los tests crean datos durante la ejecución
- Algunos tests dependen de datos existentes (IDs válidos)
- Considera implementar limpieza después de cada suite de tests

### Emails

- Las pruebas de recuperación de contraseña intentarán enviar emails reales
- Los emails de test irán a las direcciones configuradas
- Considera usar un servicio de email de testing (como Mailtrap)

## 🔄 Mejoras Futuras

- [ ] Implementar mocks para servicios externos (email, S3)
- [ ] Crear base de datos de test separada
- [ ] Implementar datos de semilla (seeding)
- [ ] Agregar tests de integración completos
- [ ] Implementar limpieza automática de datos de test
- [ ] Tests de carga de archivos (multer/S3)
- [ ] Tests de Socket.IO (notificaciones en tiempo real)

## 📖 Referencias

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Express APIs](https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/)
