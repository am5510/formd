import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToR2, addInMemoryFile } from "@/lib/r2/client";

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mockKey = searchParams.get("mockKey") || `uploads/${Date.now()}_file`;
    const contentType = req.headers.get("content-type") || "application/octet-stream";

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadBufferToR2(mockKey, buffer, contentType);

    const fileName = mockKey.split("/").pop() || "uploaded_file";
    addInMemoryFile({
      id: `r2-${Date.now()}`,
      fileName,
      r2Key: mockKey,
      fileUrl: publicUrl,
      fileType: contentType,
      fileSize: buffer.length,
      category: mockKey.includes("/gallery/") ? "gallery" : "document",
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      publicUrl,
      key: mockKey,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "document";
    const projectId = (formData.get("projectId") as string) || "PRJ-2567-TR048";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const r2Key = `projects/${projectId}/${category}/${Date.now()}_${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await uploadBufferToR2(r2Key, buffer, file.type);

    addInMemoryFile({
      id: `r2-${Date.now()}`,
      fileName: file.name,
      r2Key,
      fileUrl: publicUrl,
      fileType: file.type,
      fileSize: file.size,
      category: category as any,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        r2Key,
        fileUrl: publicUrl,
        fileSize: file.size,
        fileType: file.type,
        category,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Server upload failed" },
      { status: 500 }
    );
  }
}
