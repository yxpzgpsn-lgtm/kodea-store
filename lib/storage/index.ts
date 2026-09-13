import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3-compatible object storage (works against AWS S3, Cloudflare R2,
 * Backblaze B2, or any S3-compatible endpoint via S3_ENDPOINT).
 */
function getClient(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

function requireBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not set. Configure object storage in .env.");
  return bucket;
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const bucket = requireBucket();
  await getClient().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );

  const publicBase = process.env.S3_PUBLIC_URL;
  return publicBase ? `${publicBase.replace(/\/$/, "")}/${key}` : key;
}

export async function deleteObject(key: string): Promise<void> {
  const bucket = requireBucket();
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getSignedUploadUrl(key: string, contentType: string): Promise<string> {
  const bucket = requireBucket();
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(getClient(), command, { expiresIn: 900 });
}
