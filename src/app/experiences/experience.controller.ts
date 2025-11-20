import { Request, Response } from "express";
import mongoose from "mongoose";
import Experience from "../experiences/experience.model";
import Guide from "../guides/guide.model";

/* GET /experiences */
export async function listExperiences(req: Request, res: Response) {
  try {
    const experiences = await Experience.find();
    res.json(experiences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar experiencias" });
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
    const experience = await Experience.findById(req.params.id);
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
    const { userId, ...restBody } = req.body;

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
    const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Experiencia no encontrada" });
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