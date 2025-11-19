import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

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
      // Si no está autenticado, rechazamos mediante cb con error para que multer lo capture
      return cb(new Error("S3Storage: No autenticado"), "");
    }
    const key = `users/${userId}/profile.png`; // carpeta por user
    cb(null, key);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  console.log("multer-s3 -> fileFilter called", file.originalname, file.mimetype);
  cb(null, !!file.mimetype && file.mimetype.startsWith("image/"));
};

export const uploadS3Profile = multer({
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});