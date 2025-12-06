import { Request, Response } from "express";
import mongoose from "mongoose";
import Guide from "../guides/guide.model";
import userModel from "../users/user.model";
import Experience from '../experiences/experience.model';
import Review from '../reviews/review.model';


/* GET /guides */
export async function listGuides(req: Request, res: Response) {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ error: "Base de datos no conectada" });
    }

    const guides = await Guide.find();
    const userIds = guides.map(g => g.userId);

    const users = await mongoose.connection.db
      .collection("users")
      .find({ _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .project({ name: 1, email: 1 })
      .toArray();

    const guidesWithUser = guides.map(guide => {
      const user = users.find(u => u._id.equals(guide.userId));
      return {
        ...guide.toObject(),
        user: user ? { name: user.name, email: user.email } : null
      };
    });

    res.json(guidesWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar guías" });
  }
}

/* GET /guides/:id */
export async function getGuideById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // 2. Buscas la guía
    const guide = await Guide.findById(id).lean();
    
    if (!guide) {
        return res.status(404).json({ error: "Guía no encontrada" });
    }

    console.log("1. ID de guía encontrado:", guide._id);
    console.log("2. ID de usuario a buscar:", guide.userId);

    const user = await userModel.findById(guide.userId).select('name email avatarUrl').lean();

    console.log("3. Resultado de búsqueda de usuario:", user); // ¿Sigue siendo null aquí?

    // 4. Armas la respuesta
    const guideWithUser = {
      ...guide,
      user: user || null 
    };

    res.json(guideWithUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener guía" });
  }
}

/* GET /guides/profile/:guideId */
export async function getGuidePublicProfile(req: any, res: Response) {
  try {
    const { guideId } = req.params;

    console.log("1. 🚀 Iniciando carga de datos para:", guideId);

    // 1. Ejecutamos las consultas principales en paralelo (SIN POPULATE en Guide)
    const [guideRaw, experiences, reviewsRaw] = await Promise.all([
      // Buscamos la guía "pelona" (sin datos de usuario aún)
      Guide.findById(guideId).lean(),

      // Buscamos experiencias
      Experience.find({ guideId: guideId, status: 'published' })
                .sort({ date: 1 })
                .lean(),

      // Buscamos reviews (aquí sí dejamos el populate porque suele funcionar bien en reviews, 
      // pero abajo normalizamos el nombre del campo)
      Review.find({ guideId: guideId })
            .populate('userId', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .lean()
    ]);

    // Validación básica
    if (!guideRaw) {
        return res.status(404).render('error', { message: "Guía no encontrado" });
    }

    // 2. Buscamos MANUALMENTE al usuario dueño del perfil de guía
    // (Esto es lo que evita el StrictPopulateError)
    const guideUser = await userModel.findById(guideRaw.userId)
                                     .select('name email avatarUrl')
                                     .lean();

    // 3. Armamos el objeto final del guía combinando los datos
    const guideWithUser = {
      ...guideRaw,
      user: guideUser || null // Si no encuentra usuario, pone null en vez de romper
    };

    console.log("2. ✅ Guía armado con usuario:", guideWithUser);
   


    // 4. Preparamos las reviews para que tengan la misma estructura 
    // (Movemos la info de 'userId' a 'user' para que tu Handlebars sea consistente)
    const formattedReviews = reviewsRaw.map((r: any) => ({
        ...r,
        user: r.userId || null 
    }));

    // Verificar si es dueño
    let isOwner = false;
    if (req.user && guideRaw.userId.toString() === req.user.userId) {
        isOwner = true;
    }

    // 5. Renderizamos
    res.render('guides/guide-profile', {
      layout: false,
      guide: guideWithUser, // Pasamos el objeto manual
      experiences,
      reviews: formattedReviews,
      isOwner
    });

  } catch (err) {
    console.error("❌ Error en getGuidePublicProfile:", err);
    res.status(500).send("Error interno del servidor");
  }
}


/*POST /guides */
export async function createGuide(req: Request, res: Response) {
    try {
        const { userId, bio, experienceYears, languages, certifications, specialties } = req.body;
        const newGuide = await Guide.create({
            userId,
            bio,
            experienceYears,
            languages,
            certifications,
            specialties,
        });
        res.status(201).json(newGuide);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear guía" });
    }
}

/*PATCH /guides/:id */
export async function updateGuide(req: any, res: Response) {
    try {
        const { id } = req.params;
        const { bio, experienceYears, languages, specialties, name } = req.body;
        let { avatarUrl } = req.body;

        // Si se subió un archivo, usamos su URL
        if (req.file && (req.file as any).location) {
            avatarUrl = (req.file as any).location;
        }

        // 1. Buscar el guía
        const guide = await Guide.findById(id);
        if (!guide) return res.status(404).json({ error: "Guía no encontrada" });

        // 2. Verificar permisos (solo el dueño puede editar)
        if (guide.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "No tienes permiso para editar este perfil" });
        }

        // 3. Actualizar datos del Guía
        if (bio !== undefined) guide.bio = bio;
        if (experienceYears !== undefined) guide.experienceYears = experienceYears;
        
        // Manejo de arrays que pueden venir como strings desde FormData
        if (languages !== undefined) {
            guide.languages = typeof languages === 'string' ? languages.split(',').map((s: string) => s.trim()).filter((s: string) => s) : languages;
        }
        if (specialties !== undefined) {
            guide.specialties = typeof specialties === 'string' ? specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s) : specialties;
        }
        
        await guide.save();

        // 4. Actualizar datos del Usuario si es necesario
        let updatedUser = null;
        if (name || avatarUrl) {
            const updateData: any = {};
            if (name) updateData.name = name;
            if (avatarUrl) updateData.avatarUrl = avatarUrl;

            updatedUser = await userModel.findByIdAndUpdate(guide.userId, updateData, { new: true }).select('name email avatarUrl');
        } else {
            updatedUser = await userModel.findById(guide.userId).select('name email avatarUrl');
        }

        // 5. Responder con datos combinados
        const guideObject = guide.toObject();
        res.json({
            ...guideObject,
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar guía" });
    }
}

/* DELETE /guides/:id */
export async function deleteGuide(req: Request, res: Response) {
    try {
        const guide = await Guide.findByIdAndDelete(req.params.id);
        if (!guide) return res.status(404).json({ error: "Guía no encontrada" });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar guía" });
    }
}

export async function getGuideIdByUserId(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        // Buscamos si existe un guía ligado a este userId
        const guide = await Guide.findOne({ userId: userId }).select('_id').lean();
        
        if (!guide) {
            return res.status(404).json({ error: 'Usuario no es guía' });
        }
        
        // Devolvemos solo el ID
        res.json({ guideId: guide._id });
    } catch (error) {
        console.error("Error buscando ID de guía:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}