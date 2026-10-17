import { NextRequest, NextResponse } from "next/server";
import {
  getActiveQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  resetToDefaultQuestions,
} from "@/lib/db/questions";
import { DIMENSIONS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "PRJ-2567-TR048";

    const questions = await getActiveQuestions(projectId);

    return NextResponse.json({
      success: true,
      count: questions.length,
      dimensions: DIMENSIONS,
      questions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "reset") {
      const reset = await resetToDefaultQuestions(body.projectId || "PRJ-2567-TR048");
      return NextResponse.json({
        success: true,
        message: "คืนค่าข้อคำถามมาตรฐาน 20 ข้อเรียบร้อยแล้ว",
        questions: reset,
      });
    }

    const { dimensionId, text, projectId = "PRJ-2567-TR048" } = body;

    if (!text || !dimensionId) {
      return NextResponse.json(
        { success: false, error: "dimensionId และ text จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    const dimension = DIMENSIONS.find((d) => d.id === Number(dimensionId));
    const dimensionTitle = dimension ? dimension.title : `มิติที่ ${dimensionId}`;

    const newQuestion = await createQuestion(
      Number(dimensionId),
      dimensionTitle,
      text,
      projectId
    );

    return NextResponse.json({
      success: true,
      message: "เพิ่มข้อคำถามเรียบร้อยแล้ว",
      question: newQuestion,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, text, dimensionId } = body;

    if (!id || !text) {
      return NextResponse.json(
        { success: false, error: "id และ text จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    let dimensionTitle: string | undefined;
    if (dimensionId) {
      const dim = DIMENSIONS.find((d) => d.id === Number(dimensionId));
      if (dim) dimensionTitle = dim.title;
    }

    await updateQuestion(Number(id), text, dimensionId ? Number(dimensionId) : undefined, dimensionTitle);

    return NextResponse.json({
      success: true,
      message: "แก้ไขข้อคำถามเรียบร้อยแล้ว",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    await deleteQuestion(Number(id));

    return NextResponse.json({
      success: true,
      message: "ลบข้อคำถามเรียบร้อยแล้ว",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
