// src/models/user.model.ts
import { Schema, model, Document, Types } from "mongoose";
import { UserType } from "../varTypes"; // ajusta la ruta si es necesario

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  avatarKey?: string;
  roles: UserType[]; // o string[] si no usas UserType
  emailVerified: boolean;
  dateOfBirth?: Date;
  refreshToken?: string;
  verificationToken?: string;
  verificationExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // hashea la contraseña en el servicio de auth
  avatarUrl: { type: String, default: null },
  avatarKey: { type: String, default: null },
  roles: { type: [String], default: ["customer"] }, // valida contra UserType en la lógica si quieres
  emailVerified: { type: Boolean, default: false },
  dateOfBirth: { type: Date, default: null },
  refreshToken: { type: String, default: null },
  verificationToken: { type: String, default: null },
  verificationExpires: { type: Date, default: null }
}, {
  timestamps: true,
  versionKey: false
});


// Métodos / hooks pueden añadirse aquí si quieres (p.ej. comparePassword)
// NOTA: no se implementa hashing aquí para mantener separación de responsabilidades.

export default model<IUser>("User", UserSchema);