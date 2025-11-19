import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || ""
  }
});
const BUCKET = process.env.S3_BUCKET || "iteso-deservidor2025";

export async function deleteS3Object(key: string) {
  if (!key) return;
  try {
    const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
    await s3.send(cmd);
  } catch (err) {
    console.warn("deleteS3Object failed", key, err);
  }
}

export async function getPresignedUrl(key: string, expiresInSec = 300) {
  if (!key) throw new Error("Missing key");
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresInSec });
}