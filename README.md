<p align="center">
  <img src="https://imgur.com/G39Rg8s.png" alt="Logo VERTIKA" height="240">
</p> 

**VERTIKA** es una plataforma web que conecta a usuarios con guías y agencias de montaña para reservar experiencias al aire libre.
Busca ofrecer un servicio confiable, accesible y regional, verificación de guías y un sistema de reseñas para fomentar la seguridad y transparencia.
  
##  Diagrama ER  
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


## Documentación de la API (Swagger)
 
La documentación interactiva del API se encuentra disponible **al correr el proyecto** en:

👉 http://localhost:3000/swagger

Ahí podrás:
- Explorar todos los **endpoints** agrupados por módulo (Users, Guides, Experiences, Reservations, Reviews).
- Probar **peticiones** GET / POST / PATCH / DELETE directamente desde el navegador.
- Consultar los **schemas** esperados en cada endpoint y las respuestas actuales.
