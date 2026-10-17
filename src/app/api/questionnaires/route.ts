import { NextRequest, NextResponse } from "next/server";
import {
  getAllQuestionnaires,
  getQuestionnaireById,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} from "@/lib/db/questionnaires";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const latest = searchParams.get("latest");

    if (id || latest) {
      const questionnaire = await getQuestionnaireById(id);
      return NextResponse.json({ questionnaire });
    }

    const questionnaires = await getAllQuestionnaires();
    return NextResponse.json({ questionnaires });
  } catch (err) {
    console.error("GET /api/questionnaires error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลแบบสอบถามได้" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const {
      title,
      courseTitle,
      instructors,
      department,
      dateDisplay,
      venue,
      targetAttendees,
      enableSection1,
      section1Title,
      respondentNameLabel,
      respondentNamePlaceholder,
      respondentNameRequired,
      enableGovId,
      govIdLabel,
      govIdPlaceholder,
      govIdRequired,
      demographicCustomFields,
      questions,
      enableSection3,
      section3Title,
      feedbackItems,
      enableSection4,
      section4Title,
      section4Description,
      section4Label,
      section4HelperText,
    } = body;

    if (!title || !courseTitle) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อโครงการและหลักสูตร/วิชา" },
        { status: 400 }
      );
    }

    const newQnr = await createQuestionnaire({
      title,
      courseTitle,
      instructors: instructors || "-",
      department: department || "-",
      dateDisplay: dateDisplay || "-",
      venue: venue || "-",
      targetAttendees: targetAttendees ? Number(targetAttendees) : 150,
      enableSection1,
      section1Title,
      respondentNameLabel,
      respondentNamePlaceholder,
      respondentNameRequired,
      enableGovId,
      govIdLabel,
      govIdPlaceholder,
      govIdRequired,
      demographicCustomFields,
      questions: Array.isArray(questions) ? questions : [],
      enableSection3,
      section3Title,
      feedbackItems,
      enableSection4,
      section4Title,
      section4Description,
      section4Label,
      section4HelperText,
    });

    return NextResponse.json({ questionnaire: newQnr }, { status: 201 });
  } catch (err) {
    console.error("POST /api/questionnaires error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างแบบสอบถามได้" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const {
      id,
      title,
      courseTitle,
      instructors,
      department,
      dateDisplay,
      venue,
      targetAttendees,
      enableSection1,
      section1Title,
      respondentNameLabel,
      respondentNamePlaceholder,
      respondentNameRequired,
      enableGovId,
      govIdLabel,
      govIdPlaceholder,
      govIdRequired,
      demographicCustomFields,
      questions,
      enableSection3,
      section3Title,
      feedbackItems,
      enableSection4,
      section4Title,
      section4Description,
      section4Label,
      section4HelperText,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบรหัสแบบสอบถาม (id)" },
        { status: 400 }
      );
    }

    const updated = await updateQuestionnaire(id, {
      title,
      courseTitle,
      instructors,
      department,
      dateDisplay,
      venue,
      targetAttendees: targetAttendees !== undefined ? Number(targetAttendees) : undefined,
      enableSection1,
      section1Title,
      respondentNameLabel,
      respondentNamePlaceholder,
      respondentNameRequired,
      enableGovId,
      govIdLabel,
      govIdPlaceholder,
      govIdRequired,
      demographicCustomFields,
      questions,
      enableSection3,
      section3Title,
      feedbackItems,
      enableSection4,
      section4Title,
      section4Description,
      section4Label,
      section4HelperText,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "ไม่พบแบบสอบถามที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json({ questionnaire: updated });
  } catch (err) {
    console.error("PUT /api/questionnaires error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถอัปเดตแบบสอบถามได้" },
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
        { error: "ไม่พบรหัสแบบสอบถามที่ต้องการลบ" },
        { status: 400 }
      );
    }

    await deleteQuestionnaire(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/questionnaires error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถลบแบบสอบถามได้" },
      { status: 500 }
    );
  }
}
