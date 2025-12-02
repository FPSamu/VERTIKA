# 🧪 Guía Rápida de Testing - VERTIKA

## 📦 Instalación Rápida

```bash
# Instalar dependencias de testing
npm install --save-dev jest @jest/globals ts-jest @types/jest supertest @types/supertest
```

## 🚀 Comandos Básicos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil para desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm test -- auth.test.ts

# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="should register"
```

## ⚡ Ejecución Rápida por Módulo

```bash
# Tests de autenticación
npm test -- auth.test.ts

# Tests de usuarios
npm test -- users.test.ts

# Tests de experiencias
npm test -- experiences.test.ts

# Tests de reservaciones
npm test -- reservations.test.ts

# Tests de reseñas
npm test -- reviews.test.ts
```

## 🔧 Preparación Previa

### 1. Configurar Variables de Entorno

Crea o verifica tu archivo `.env`:

```env
# Base de datos (usa una BD de prueba, NO producción)
MONGO_URL='mongodb+srv://user:pass@cluster.mongodb.net/'
DB_NAME='vertika_test'

# JWT
JWT_SECRET='test_secret_key'
JWT_REFRESH_SECRET='test_refresh_secret_key'

# Email (opcional para tests)
EMAIL_ADDRESS='test@gmail.com'
EMAIL_PASS='app_password'
```

### 2. Actualizar IDs de Prueba

Abre cada archivo `.test.ts` y actualiza los IDs con valores reales de tu BD:

```typescript
// Ejemplo en auth.test.ts
const testUserId = "TU_USER_ID_AQUI";

// Ejemplo en experiences.test.ts
const guideUserId = "TU_GUIDE_ID_AQUI";
const experienceId = "TU_EXPERIENCE_ID_AQUI";
```

### 3. Crear Datos de Semilla (Opcional)

Puedes crear un script para poblar tu BD de prueba:

```typescript
// scripts/seed-test-data.ts
// Crear usuarios, guías, experiencias de prueba
```

## 📊 Interpretar Resultados

### ✅ Test Exitoso

```
✓ should register a new user successfully (245ms)
```

### ❌ Test Fallido

```
✕ should login successfully (156ms)
  Expected: 200
  Received: 401
```

### ⏭️ Test Omitido

```
○ should delete experience (skipped)
```

## 🎯 Cobertura de Código

Después de ejecutar `npm run test:coverage`, verás:

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
auth.controller.ts    |   85.71 |    75.00 |   90.00 |   85.00 |
user.controller.ts    |   78.26 |    70.00 |   80.00 |   77.78 |
----------------------|---------|----------|---------|---------|
```

El reporte HTML estará en: `coverage/lcov-report/index.html`

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"

```bash
# Verifica tu MONGO_URL en .env
# Asegúrate de que la BD está accesible
```

### Error: "JWT_SECRET is not defined"

```bash
# Agrega JWT_SECRET a tu .env
JWT_SECRET='tu_secreto_aqui'
```

### Error: "Test timeout"

```bash
# Aumenta el timeout en jest.config.js
testTimeout: 60000  // 60 segundos
```

### Tests fallan por IDs inválidos

```bash
# Actualiza los IDs en cada archivo .test.ts
# O crea datos de semilla con IDs conocidos
```

## 📝 Ejemplos de Uso

### Probar endpoint específico mientras desarrollas

```bash
# Terminal 1: Ejecutar servidor
npm run dev

# Terminal 2: Ejecutar tests en modo watch
npm run test:watch -- auth.test.ts
```

### Verificar antes de hacer commit

```bash
# Ejecutar todos los tests
npm test

# Ver cobertura
npm run test:coverage

# Solo si todos pasan, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"
```

## 🎨 Personalizar Tests

### Agregar nuevo test

```typescript
// En cualquier archivo .test.ts
it("should do something specific", async () => {
  const response = await request(app).get("/api/endpoint").expect(200);

  expect(response.body).toHaveProperty("key");
});
```

### Crear suite de tests

```typescript
describe("New Feature", () => {
  it("test case 1", async () => {
    /* ... */
  });
  it("test case 2", async () => {
    /* ... */
  });
});
```

## 🔄 Integración con CI/CD

Agrega a tu workflow de GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 📚 Recursos

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Supertest Docs](https://github.com/visionmedia/supertest)
- [Test README completo](./test/README.md)

---

**¡Happy Testing! 🎉**
