import { NextRequest, NextResponse } from "next/server";
import { listR2Files, deleteFileFromR2 } from "@/lib/r2/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix") || "projects/PRJ-2567-TR048";

    const files = await listR2Files(prefix);

    return NextResponse.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to list R2 files" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key is required" },
        { status: 400 }
      );
    }

    const success = await deleteFileFromR2(key);

    return NextResponse.json({
      success,
      message: success ? "ลบไฟล์ออกจาก R2 เรียบร้อยแล้ว" : "ไม่สามารถลบไฟล์ได้",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete R2 file" },
      { status: 500 }
    );
  }
}
