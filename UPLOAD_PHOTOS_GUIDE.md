# Subir Fotos a Experiencias

## 🎯 Opciones Disponibles

### Opción 1: Subir fotos AL CREAR la experiencia (RECOMENDADO)

**Endpoint**: `POST /api/experiences`

Puedes incluir hasta 10 fotos directamente cuando creas la experiencia. Las fotos se suben a S3 y las URLs se guardan automáticamente.

### Opción 2: Agregar fotos DESPUÉS de crear la experiencia

**Endpoint**: `POST /api/experiences/:id/upload-photos`

Si ya tienes una experiencia creada, puedes agregar más fotos posteriormente.

### Requisitos para CREAR experiencia

- Usuario autenticado con token JWT
- Enviar `userId` en el body
- El `userId` debe corresponder a un usuario con rol "guide" en la base de datos
- El guía debe estar verificado (campo `verified: true` en la colección `guides`)

### Requisitos para AGREGAR fotos a experiencia existente

- Usuario autenticado con token JWT
- El usuario autenticado debe ser el propietario de la experiencia (su guía asociado debe coincidir con el `guideId` de la experiencia)

### Configuración S3

Las siguientes variables deben estar configuradas en el archivo `.env`:

```
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=your_region
S3_BUCKET=your_bucket_name
```

### Características

- **Máximo 10 fotos** por solicitud
- **Tamaño máximo**: 5MB por foto
- **Formatos aceptados**: Cualquier formato de imagen (jpg, png, gif, etc.)
- **Almacenamiento**: Las fotos se guardan en S3 con la estructura `experiences/{userId}/{uniqueId}.{extension}`
- **ACL**: `public-read` (accesibles públicamente)

---

## 📝 Opción 1: Crear experiencia CON fotos (RECOMENDADO)

### Endpoint

```
POST http://localhost:3000/api/experiences
```

### Headers

```
Authorization: Bearer {tu_token_jwt}
```

### Body (form-data)

| Campo          | Tipo | Requerido | Ejemplo                                                            |
| -------------- | ---- | --------- | ------------------------------------------------------------------ |
| userId         | text | ✅        | `69151fa525a16fe4e4157ccb` (el guideId se obtiene automáticamente) |
| title          | text | ✅        | `Ascenso al Pico de Orizaba`                                       |
| description    | text | ✅        | `Ascenso de 2 días...`                                             |
| activity       | text | ✅        | `alpinismo`                                                        |
| location       | text | ✅        | `Pico de Orizaba, Puebla`                                          |
| difficulty     | text | ✅        | `difícil`                                                          |
| date           | text | ✅        | `2025-11-15T08:00:00Z`                                             |
| maxGroupSize   | text | ✅        | `6`                                                                |
| pricePerPerson | text | ✅        | `8500`                                                             |
| minGroupSize   | text | ❌        | `2`                                                                |
| currency       | text | ❌        | `MXN`                                                              |
| photos         | file | ❌        | `[file1.jpg]`                                                      |
| photos         | file | ❌        | `[file2.png]`                                                      |
| photos         | file | ❌        | `[file3.jpg]`                                                      |

**⚠️ IMPORTANTE**:

- En Postman, todos los campos numéricos (`maxGroupSize`, `pricePerPerson`, etc.) deben enviarse como **text** en form-data
- Para agregar múltiples fotos, usa el mismo campo `photos` varias veces (hasta 10 veces)

### Respuesta Exitosa (201)

```json
{
  "_id": "69151fdb25a16fe4e4157ccc",
  "guideId": "69151fa525a16fe4e4157ccb",
  "title": "Ascenso al Pico de Orizaba",
  "description": "Ascenso de 2 días...",
  "photos": [
    "https://bucket.s3.region.amazonaws.com/experiences/user-id/uuid1.jpg",
    "https://bucket.s3.region.amazonaws.com/experiences/user-id/uuid2.png",
    "https://bucket.s3.region.amazonaws.com/experiences/user-id/uuid3.jpg"
  ],
  "status": "draft",
  "createdAt": "2025-11-19T..."
  // ... otros campos
}
```

---

## 📝 Opción 2: Agregar fotos a experiencia existente

### Endpoint

```
POST http://localhost:3000/api/experiences/:id/upload-photos
```

### Headers

```
Authorization: Bearer {tu_token_jwt}
```

### Body (form-data)

- Campo: `photos` (tipo File)
- Valor: Seleccionar múltiples archivos (hasta 10)

### Ejemplo de Request

```
POST http://localhost:3000/api/experiences/69151fdb25a16fe4e4157ccc/upload-photos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Form Data:
photos: [file1.jpg]
photos: [file2.png]
photos: [file3.jpg]
```

### Respuestas

#### ✅ 200 - Éxito

```json
{
  "message": "Fotos subidas correctamente",
  "photos": [
    "https://bucket-name.s3.region.amazonaws.com/experiences/user-id/uuid1.jpg",
    "https://bucket-name.s3.region.amazonaws.com/experiences/user-id/uuid2.png"
  ],
  "experience": {
    "_id": "69151fdb25a16fe4e4157ccc",
    "title": "Ascenso al Pico de Orizaba",
    "photos": [
      "https://bucket-name.s3.region.amazonaws.com/experiences/user-id/uuid1.jpg",
      "https://bucket-name.s3.region.amazonaws.com/experiences/user-id/uuid2.png"
    ]
    // ... resto de campos
  }
}
```

#### ❌ 400 - Sin imágenes

```json
{
  "error": "No se proporcionaron imágenes"
}
```

#### ❌ 401 - No autenticado

```json
{
  "mensaje": "Token no proporcionado"
}
```

#### ❌ 403 - Sin permisos

```json
{
  "error": "No tienes permisos para modificar esta experiencia"
}
```

O

```json
{
  "error": "No tienes permisos de guía"
}
```

#### ❌ 404 - Experiencia no encontrada

```json
{
  "error": "Experiencia no encontrada"
}
```

### Flujo de validación

1. **authMiddleware**: Verifica que haya un token JWT válido
2. **guideVerificationMiddleware**:
   - Verifica que el usuario tenga rol "guide"
   - Verifica que el guía esté verificado en la BD
3. **uploadExperiencePhotos**: Middleware de Multer que sube las fotos a S3
4. **uploadPhotosController**:
   - Verifica que la experiencia exista
   - Verifica que el usuario sea el dueño de la experiencia
   - Agrega las URLs de las fotos al array existente
   - Guarda la experiencia actualizada

### Notas importantes

- Las fotos se **agregan** al array existente, no lo reemplazan
- Cada foto se guarda con un nombre único usando UUID
- Si subes fotos en múltiples solicitudes, todas se acumularán en el array `photos`
- Las fotos tienen ACL `public-read`, por lo que las URLs son accesibles directamente
