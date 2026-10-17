import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2FileItem } from "../types";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "training-form-r2";
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

// In-memory file registry สำหรับ fallback เมื่อยังไม่ได้ระบุ R2 credentials
let inMemoryFiles: R2FileItem[] = [
  {
    id: "f-1",
    fileName: "คู่มือโครงการฝึกอบรม AI for Public Sector.pdf",
    r2Key: "projects/PRJ-2567-TR048/documents/syllabus_ai_gov.pdf",
    fileUrl: "https://example.com/syllabus_ai_gov.pdf",
    fileType: "application/pdf",
    fileSize: 4528000,
    category: "document",
    uploadedAt: "2024-05-10T09:00:00.000Z",
  },
  {
    id: "f-2",
    fileName: "ภาพถ่ายวิทยากร ดร.ธีรพงศ์ อนันตโภคิน.jpg",
    r2Key: "projects/PRJ-2567-TR048/speakers/speaker_dr_theerapong.jpg",
    fileUrl: "https://example.com/speaker_dr_theerapong.jpg",
    fileType: "image/jpeg",
    fileSize: 845000,
    category: "speaker",
    uploadedAt: "2024-05-12T10:30:00.000Z",
  },
  {
    id: "f-3",
    fileName: "ภาพบรรยากาศ Workshop วันที่ 1.jpg",
    r2Key: "projects/PRJ-2567-TR048/gallery/workshop_day1_centara.jpg",
    fileUrl: "https://example.com/workshop_day1_centara.jpg",
    fileType: "image/jpeg",
    fileSize: 2150000,
    category: "gallery",
    uploadedAt: "2024-05-15T16:45:00.000Z",
  },
];

/**
 * ตรวจสอบว่าระบบตั้งค่าการเชื่อมต่อ Cloudflare R2 ครบถ้วนหรือไม่
 */
export function isR2Configured(): boolean {
  return Boolean(
    accountId &&
      accessKeyId &&
      secretAccessKey &&
      accountId.trim().length > 0 &&
      accessKeyId.trim().length > 0
  );
}

/**
 * สร้าง AWS S3 Client สำหรับ Cloudflare R2
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
}

/**
 * สร้าง Presigned URL สำหรับการอัปโหลดไฟล์โดยตรงจาก Browser สู่ Cloudflare R2
 * โดยไม่ต้องผ่าน Next.js Server (ประหยัดแบนด์วิดท์ และรองรับไฟล์ขนาดใหญ่)
 */
export async function generateR2PresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 900 // 15 นาที
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client();

  if (!client) {
    // โหมดจำลองเมื่อยังไม่เชื่อมต่อ R2
    return {
      uploadUrl: `/api/r2/upload?mockKey=${encodeURIComponent(key)}`,
      publicUrl: `/uploads/${key}`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  const filePublicUrl = publicUrl
    ? `${publicUrl.replace(/\/$/, "")}/${key}`
    : uploadUrl.split("?")[0];

  return { uploadUrl, publicUrl: filePublicUrl };
}

/**
 * อัปโหลดไฟล์ Buffer ไปยัง Cloudflare R2 ผ่าน Server
 */
export async function uploadBufferToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();

  if (!client) {
    return `/uploads/${key}`;
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  return publicUrl
    ? `${publicUrl.replace(/\/$/, "")}/${key}`
    : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
}

/**
 * ลบไฟล์ออกจาก Cloudflare R2
 */
export async function deleteFileFromR2(key: string): Promise<boolean> {
  const client = getR2Client();

  if (!client) {
    inMemoryFiles = inMemoryFiles.filter((f) => f.r2Key !== key);
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.error("Failed to delete from R2:", err);
    return false;
  }
}

/**
 * รายการไฟล์ในระบบ (ผสานระหว่าง R2 Bucket และ Metadata)
 */
export async function listR2Files(
  prefix: string = "projects/PRJ-2567-TR048"
): Promise<R2FileItem[]> {
  const client = getR2Client();

  if (!client) {
    return inMemoryFiles;
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await client.send(command);
    const contents = response.Contents || [];

    return contents.map((item, idx) => {
      const key = item.Key || "";
      const fileName = key.split("/").pop() || "unknown";
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
      const isPdf = /\.pdf$/i.test(fileName);

      let category: R2FileItem["category"] = "document";
      if (key.includes("/speakers/")) category = "speaker";
      else if (key.includes("/gallery/")) category = "gallery";
      else if (isPdf) category = "document";

      const fileUrl = publicUrl
        ? `${publicUrl.replace(/\/$/, "")}/${key}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

      return {
        id: `r2-${idx + 1}`,
        fileName,
        r2Key: key,
        fileUrl,
        fileType: isImage ? "image/jpeg" : isPdf ? "application/pdf" : "application/octet-stream",
        fileSize: item.Size || 0,
        category,
        uploadedAt: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn("Failed to list R2 files, using mock:", err);
    return inMemoryFiles;
  }
}

/**
 * บันทึกไฟล์ใหม่ลงใน InMemory Registry
 */
export function addInMemoryFile(file: R2FileItem) {
  inMemoryFiles.unshift(file);
}
