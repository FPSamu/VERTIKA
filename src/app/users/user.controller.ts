import { Request, Response } from "express";
import UserModel from "./user.model"
import { deleteS3Object} from "../utils/s3.helper";

interface S3File extends Express.Multer.File {
  location: string;
  key: string;
}



export async function getUsers(req: Request, res: Response) {
  try {
    const users = await UserModel.find().select("-passwordHash -refreshToken -verificationToken");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("ID recibido:", id);

    const user = await UserModel.findById(id).lean();
    //console.log("Usuario encontrado:", user);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.render("users/public-profile", { user, title: `Perfil — ${user.name}`});

  } catch (error) {
    console.error("Error en getUserById:", error);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
};

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date();

    const updated = await UserModel.findByIdAndUpdate(id, updates, { new: true })
      .select("-passwordHash");

    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error actualizando usuario" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Si tiene avatar, eliminarlo en S3
    if (user.avatarKey) {
      await deleteS3Object(user.avatarKey);
    }

    await user.deleteOne();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Error eliminando usuario" });
  }
}


export async function updateAvatar(req: Request, res: Response) {
  try {
    const file = req.file as S3File | undefined;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Update Avatar: No autenticado" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Guardar nuevo avatar
    user.avatarUrl = (req.file as any).location;
    user.avatarKey = (req.file as any).key;
    user.updatedAt = new Date();

    await user.save();

    res.json({
      message: "Avatar actualizado correctamente",
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    res.status(500).json({ error: "Error subiendo avatar", details: err });
  }
}