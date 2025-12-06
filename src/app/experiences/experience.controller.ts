import { Request, Response } from "express";
import mongoose from "mongoose";
import Experience from "../experiences/experience.model";
import Guide from "../guides/guide.model";
import Reservation from "../reservations/reservation.model";
import EmailService from "../services/email.service";
import { StatusType } from '../varTypes';

const emailService = new EmailService();

/* GET /experiences */
export async function listExperiences(req: Request, res: Response) {
  try {
    // 1. Extraer parámetros del Query String
    const { 
        search, 
        startDate, 
        endDate, 
        minPrice, 
        maxPrice, 
        people, 
        activity 
    } = req.query;

    // 2. Filtros Base (Obligatorios)
    // - Status: Publicado
    // - Booked: No llena (false)
    // - Date: Futuras (por defecto hoy en adelante, a menos que especifiquen fecha)
    const filter: any = {
      status: StatusType.PUBLISHED,
      booked: false,
    };

    // 3. Lógica de Fechas
    if (startDate || endDate) {
      filter.date = {};
      // Si hay fecha inicio, buscamos desde esa fecha. Si no, desde "ahora".
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      } else {
        filter.date.$gte = new Date(); 
      }
      
      // Si hay fecha fin
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    } else {
      // Si no filtran por fecha, por defecto mostrar solo futuras
      filter.date = { $gte: new Date() };
    }

    // 4. Filtro de Búsqueda de Texto (Tu regex anterior)
    if (search) {
      const cleanSearch = (search as string).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(cleanSearch, "i");
      
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex }
      ];
    }

    // 5. Filtro por Actividad (Dropdown)
    if (activity && activity !== "") {
      filter.activity = activity;
    }

    // 6. Filtro por Personas (Capacidad)
    // Buscamos experiencias donde el cupo máximo sea >= a las personas que van
    if (people) {
      filter.maxGroupSize = { $gte: Number(people) };
    }

    // 7. Filtro por Precio (Rango)
    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerPerson.$lte = Number(maxPrice);
    }

    // 8. Ejecución
    const experiences = await Experience.find(filter)
                                      .sort({ date: 1 }) // Ordenar por fecha más próxima
                                      .populate('guideId', 'name avatarUrl rating');

    res.json(experiences);

  } catch (err) {
    console.error("Error filtrando experiencias:", err);
    res.status(500).json({ error: "Error al buscar experiencias" });
  }
}



/* GET /experiences/my-experiences (Vista para guías) */
export async function showMyExperiencesPage(req: Request, res: Response) {
  try {
    // Simplemente renderizar la vista, la autenticación se hace en el frontend
    res.render('experiences/my-experiences');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar página" });
  }
}

/* GET /experiences/create (Vista para crear experiencia) */
export async function showCreateExperiencePage(req: Request, res: Response) {
  try {
    // Renderizar la vista de creación de experiencia
    res.render('experiences/create-experience');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar página" });
  }
}

/* GET /experiences/guide/:userId (API para obtener experiencias del guía) */
export async function getGuideExperiences(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    // Buscar el guía por userId
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!guide) {
      return res.status(404).json({ error: "Guía no encontrado" });
    }

    // Obtener todas las experiencias del guía (publicadas y no publicadas)
    const experiences = await Experience.find({ guideId: guide._id }).sort({ createdAt: -1 });
    
    res.json(experiences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener experiencias del guía" });
  }
}

/* GET /experiences/:id */
export async function getExperienceById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de experiencia inválido" });
    }
    
    const experience = await Experience.findById(id);
    if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(experience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener experiencia" });
  }
}

/* POST /experiences (draft) */
export async function createExperience(req: Request, res: Response) {
  try {
    const { userId, activity, difficulty, ...restBody } = req.body;

    // Validar activity enum
    const validActivities = ['hiking', 'alpinismo', 'trail', 'escalada'];
    if (activity && !validActivities.includes(activity)) {
      return res.status(400).json({ error: `Actividad inválida. Debe ser: ${validActivities.join(', ')}` });
    }

    // Validar difficulty enum
    const validDifficulties = ['fácil', 'medio', 'difícil'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: `Dificultad inválida. Debe ser: ${validDifficulties.join(', ')}` });
    }

    // El middleware guideVerificationByUserIdMiddleware ya validó que existe el guía
    // Ahora buscamos el guía para obtener su _id
    const guide = await Guide.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!guide) {
      return res.status(404).json({ error: "Guía no encontrado" });
    }

    // Si hay fotos subidas, Multer las habrá procesado
    const files = req.files as Express.MulterS3.File[];
    const photoUrls = files && files.length > 0 ? files.map(file => file.location) : [];

    // Crear la experiencia con el guideId obtenido del documento Guide
    const experienceData = {
      ...restBody,
      activity,
      difficulty,
      guideId: guide._id,  // Usamos el _id del guía, no el userId
      photos: photoUrls
    };

    const newExperience = await Experience.create(experienceData);
    res.status(201).json(newExperience);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear experiencia" });
  }
}

/* PATCH /experiences/:id (editar campos) */
export async function updateExperience(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });

    // Preparar objeto de actualización
    const updates: any = { ...req.body };

    // Manejo de fotos
    // 1. Determinar qué fotos existentes se conservan
    let finalPhotos: string[] = experience.photos as string[] || [];
    
    // Si el frontend envía 'keepPhotos', usamos eso como base.
    // Si no lo envía, asumimos que no se borró ninguna (o que no se tocó la sección de fotos)
    // Para soportar "borrar todas", el frontend debería enviar un flag o un array vacío explícito si es posible.
    // Vamos a usar un campo auxiliar 'photosEdited' para saber si se tocó la lista.
    
    if (req.body.photosEdited === 'true') {
        let keep = req.body.keepPhotos || [];
        if (!Array.isArray(keep)) {
            keep = [keep];
        }
        finalPhotos = keep;
    }

    // 2. Agregar nuevas fotos subidas
    if (req.files) {
        const files = req.files as Express.MulterS3.File[];
        const newUrls = files.map(f => f.location);
        finalPhotos = [...finalPhotos, ...newUrls];
        updates.photos = finalPhotos;
    } else if (req.body.photosEdited === 'true') {
        // Si no hubo archivos nuevos pero sí se editaron (ej. borrar), actualizamos
        updates.photos = finalPhotos;
    }

    // Limpiar campos auxiliares
    delete updates.keepPhotos;
    delete updates.photosEdited;

    const updated = await Experience.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar experiencia" });
  }
}

/* PATCH /experiences/:id/publish */
export async function publishExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "published" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al publicar experiencia" });
  }
}

/* POST /experiences/:id/republish (clonar como draft) */
export async function republishExperience(req: Request, res: Response) {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ error: "Experiencia no encontrada" });

    const cloned = await Experience.create({
      ...experience.toObject(),
      _id: undefined,
      status: "draft",
      booked: false,
      rating: 0,
      createdAt: new Date(),
      updateDate: new Date(),
    });

    res.status(201).json(cloned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al replicar experiencia" });
  }
}

/* PATCH /experiences/:id/archive */
export async function archiveExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al archivar experiencia" });
  }
}

/* PATCH /experiences/:id/start */
export async function startExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "progress" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar experiencia" });
  }
}

/* PATCH /experiences/:id/finish */
export async function finishExperience(req: Request, res: Response) {
  try {
    const updated = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });

    // Enviar correos a los usuarios que reservaron
    try {
      const reservations = await Reservation.find({ experienceId: updated._id }).populate('userId');
      
      for (const reservation of reservations) {
        const user = reservation.userId as any;
        if (user && user.email) {
          emailService.sendReviewRequestEmail(user.email, user.name, (updated as any).title, (reservation as any)._id.toString())
            .catch(e => console.error(`Error enviando correo a ${user.email}:`, e));
        }
      }
    } catch (emailError) {
      console.error("Error en proceso de envío de correos:", emailError);
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al finalizar experiencia" });
  }
}

/* DELETE /experiences/:id */
export async function deleteExperience(req: Request, res: Response) {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Experiencia no encontrada" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar experiencia" });
  }
}

/* POST /experiences/:id/upload-photos (subir fotos a S3) */
export async function uploadExperiencePhotos(req: Request, res: Response) {
  try {
    const experienceId = req.params.id;
    const experience = await Experience.findById(experienceId);
    
    if (!experience) {
      return res.status(404).json({ error: "Experiencia no encontrada" });
    }

    // El middleware experienceOwnershipMiddleware ya validó la propiedad
    
    // Multer ya subió las imágenes a S3, ahora obtenemos las URLs
    const files = req.files as Express.MulterS3.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron imágenes" });
    }

    // Obtener las URLs de las fotos subidas
    const photoUrls = files.map(file => file.location);

    // Agregar las nuevas URLs al array de fotos existente
    const currentPhotos = (experience.photos as string[]) || [];
    experience.photos = [...currentPhotos, ...photoUrls];
    await experience.save();

    res.status(200).json({
      message: "Fotos subidas correctamente",
      photos: photoUrls,
      experience
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al subir fotos de experiencia" });
  }
}

/* GET /experiences/view/:id (Vista de detalle de experiencia) */
export async function showExperienceDetailPage(req: Request, res: Response) {
  try {
    const experienceId = req.params.id;

    // Pasamos el ID como variable a la plantilla Handlebars
    res.render('experiences/experience', { experienceId }); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cargar la página");
  }
}