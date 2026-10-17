import { NextRequest, NextResponse } from "next/server";
import { getEvaluationResponses, insertEvaluationResponse } from "@/lib/db/neon";
import { EvaluationResponseInput } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "PRJ-2567-TR048";
    const cohortId = searchParams.get("cohortId") || undefined;

    const responses = await getEvaluationResponses(projectId, cohortId);

    return NextResponse.json({
      success: true,
      count: responses.length,
      data: responses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: EvaluationResponseInput = await req.json();

    if (!body.respondentName || !body.scores) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const record = await insertEvaluationResponse(body, false);

    return NextResponse.json({
      success: true,
      message: "บันทึกแบบประเมินเรียบร้อยแล้ว",
      data: record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save evaluation" },
      { status: 500 }
    );
  }
}
