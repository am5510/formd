import { NextRequest, NextResponse } from "next/server";
import { generateR2PresignedUploadUrl } from "@/lib/r2/client";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, category = "document", projectId = "PRJ-2567-TR048" } =
      await req.json();

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "File name is required" },
        { status: 400 }
      );
    }

    // สร้าง R2 Key ตามโครงสร้างที่เป็นระบบ
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const r2Key = `projects/${projectId}/${category}/${timestamp}_${safeFileName}`;

    const { uploadUrl, publicUrl } = await generateR2PresignedUploadUrl(
      r2Key,
      fileType || "application/octet-stream"
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      r2Key,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
