import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/db/project";

export const dynamic = "force-dynamic";

/**
 * GET /api/project
 * ดึงข้อมูลโครงการ หลักสูตร วิทยากร สถานที่
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "PRJ-2567-TR048";
    const project = await getProject(projectId);
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("GET /api/project error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load project details" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/project
 * อัปเดตข้อมูลโครงการ หลักสูตร วิทยากร จากหน้าแอดมิน
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = body.id || "PRJ-2567-TR048";
    const updated = await updateProject(body, projectId);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error("PUT /api/project error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}
