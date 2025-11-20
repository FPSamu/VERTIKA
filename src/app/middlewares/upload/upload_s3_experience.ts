import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || ""
  }
});
 
const BUCKET = process.env.S3_BUCKET || "iteso-deservidor2025";

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
      return cb(new Error("S3Experience: No autenticado"), "");
    }
    
    // Generar nombre único para cada foto de experiencia
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const key = `experiences/${userId}/${uniqueFileName}`;
    
    cb(null, key);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Solo aceptar imágenes
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Permitir hasta 10 fotos por experiencia, cada una con máximo 5MB
export const uploadExperiencePhotos = multer({
  storage: s3Storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB por foto
    files: 10 // máximo 10 fotos
  }
});
