import { NextRequest, NextResponse } from "next/server";
import {
  getEvaluationResponses,
  getCachedDashboardSummary,
  setCachedDashboardSummary,
} from "@/lib/db/neon";
import { getQuestionnaireById } from "@/lib/db/questionnaires";
import { computeEvaluationStats } from "@/lib/stats";
import {
  DEFAULT_PROJECT,
  DEFAULT_COHORTS,
  DEFAULT_FEEDBACK_ITEMS,
  DEFAULT_SECTION3_TITLE,
  DEFAULT_SECTION1_TITLE,
  DEFAULT_RESPONDENT_NAME_LABEL,
  DEFAULT_GOV_ID_LABEL,
  POSITION_OPTIONS,
} from "@/lib/constants";
import { DashboardSummary, FeedbackCardStat, RawRespondentItem } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qId = searchParams.get("id") || searchParams.get("projectId") || null;
    const cohortId = searchParams.get("cohortId") || "all";

    // ตรวจสอบ Server Cache ก่อน
    const cacheKey = `${qId || "default"}_${cohortId}`;
    const cachedSummary = getCachedDashboardSummary(cacheKey);
    if (cachedSummary) {
      return NextResponse.json(cachedSummary);
    }

    // ดึงข้อมูลแบบสอบถามตาม ID ที่ระบุ หรือแบบสอบถามล่าสุด
    const qnr = await getQuestionnaireById(qId);

    // ดึงบันทึกผลการประเมินของแบบสอบถามชุดนี้ (ถ้ายังไม่มีผู้ตอบ จะได้ 0 คน ไม่ดึงโครงการอื่นมาแทน)
    const responses = await getEvaluationResponses(qnr.id, cohortId);

    const stats = computeEvaluationStats(responses, qnr.questions);

    const totalRespondents = responses.length;
    const targetAttendees = qnr.targetAttendees || DEFAULT_PROJECT.targetAttendees || 150;
    const responseRate = targetAttendees > 0
      ? Number(((totalRespondents / targetAttendees) * 100).toFixed(2))
      : 0;

    // คำนวณ ROI Index
    const roiScores = responses.map(
      (r) => ((r.scores.q16 || 5) + (r.scores.q17 || 5)) / 2
    );
    const roiPassed = roiScores.filter((s) => s >= 4.0).length;
    const roiIndex = totalRespondents > 0
      ? Number(((roiPassed / totalRespondents) * 100).toFixed(1))
      : 0;

    // คำนวณอัตราความต้องการให้จัดต่อเนื่อง
    const contScores = responses.map((r) => r.scores.q20 || 5);
    const contCount = contScores.filter((s) => s >= 4).length;
    const continuationRate = totalRespondents > 0
      ? Number(((contCount / totalRespondents) * 100).toFixed(1))
      : 0;

    // 1. ดึงรายการหัวข้อข้อเสนอแนะที่ตั้งค่าไว้ในแบบสอบถามชุดนี้
    const activeFeedbackItems =
      Array.isArray(qnr.feedbackItems) && qnr.feedbackItems.length > 0
        ? qnr.feedbackItems
        : DEFAULT_FEEDBACK_ITEMS;

    // 2. คำนวณผู้ตอบที่เขียนข้อเสนอแนะอย่างน้อย 1 ช่อง
    let totalWithAnyFeedback = 0;
    responses.forEach((r) => {
      let hasAny = false;
      activeFeedbackItems.forEach((item) => {
        const val =
          (r.feedbackValues && r.feedbackValues[item.id]) ||
          (item.id === "strength" && r.feedbackStrength) ||
          (item.id === "improve" && r.feedbackImprove) ||
          (item.id === "topics" && r.feedbackTopics) ||
          (item.id === "others" && r.feedbackOthers);
        if (val && val.trim()) hasAny = true;
      });
      if (hasAny) totalWithAnyFeedback++;
    });

    // 3. สกัดข้อเสนอแนะจริงสำหรับแต่ละการ์ดหัวข้อ (ไม่มีการ mock ข้อมูลหลอกเมื่อ N = 0)
    const feedbackCards = activeFeedbackItems.map((item, idx) => {
      const comments: { text: string }[] = [];
      responses.forEach((r) => {
        let val = "";
        if (r.feedbackValues && r.feedbackValues[item.id]) {
          val = r.feedbackValues[item.id];
        } else if (item.id === "strength" && r.feedbackStrength) {
          val = r.feedbackStrength;
        } else if (item.id === "improve" && r.feedbackImprove) {
          val = r.feedbackImprove;
        } else if (item.id === "topics" && r.feedbackTopics) {
          val = r.feedbackTopics;
        } else if (item.id === "others" && r.feedbackOthers) {
          val = r.feedbackOthers;
        }

        if (val && val.trim()) {
          comments.push({ text: val.trim() });
        }
      });

      return {
        id: item.id,
        index: idx + 1,
        label: item.label,
        comments,
        count: comments.length,
      };
    });

    const feedbackRate =
      totalRespondents > 0
        ? Math.round((totalWithAnyFeedback / totalRespondents) * 100)
        : 0;

    const getPositionLabel = (val: string) => {
      const found = POSITION_OPTIONS.find((p) => p.value === val);
      return found ? found.label : `ระดับ ${val}`;
    };

    const getCohortTitle = (cId?: string) => {
      if (qnr.id === DEFAULT_PROJECT.id) {
        const found = DEFAULT_COHORTS.find((c) => c.id === cId);
        if (found) return found.title;
      }
      if (!cId || cId === "all") return "-";
      if (cId === "cohort-1") return "รุ่นที่ 1";
      if (cId === "cohort-2") return "รุ่นที่ 2";
      if (cId === "cohort-3") return "รุ่นที่ 3";
      return cId;
    };

    const rawResponses: RawRespondentItem[] = responses.map((r, idx) => {
      const feedbackMap: Record<string, string> = {
        ...(r.feedbackValues || {}),
      };
      if (r.feedbackStrength) feedbackMap.strength = r.feedbackStrength;
      if (r.feedbackImprove) feedbackMap.improve = r.feedbackImprove;
      if (r.feedbackTopics) feedbackMap.topics = r.feedbackTopics;
      if (r.feedbackOthers) feedbackMap.others = r.feedbackOthers;

      return {
        id: r.id,
        index: idx + 1,
        respondentName: r.respondentName,
        govId: r.govId || "-",
        positionLevel: r.positionLevel,
        positionLabel: getPositionLabel(r.positionLevel),
        cohortId: r.cohortId,
        cohortTitle: getCohortTitle(r.cohortId),
        scores: r.scores,
        scoreMean: r.scoreMean,
        feedbackValues: feedbackMap,
        demographicValues: r.demographicValues || feedbackMap,
        createdAt: r.createdAt,
      };
    });

    const summary: DashboardSummary = {
      project: {
        id: qnr.id,
        code: qnr.id,
        title: qnr.title,
        courseTitle: qnr.courseTitle,
        department: qnr.department,
        venue: qnr.venue,
        instructors: qnr.instructors,
        startDate: qnr.dateDisplay,
        endDate: qnr.dateDisplay,
        targetAttendees,
        status: "active",
      },
      cohorts: qnr.id === DEFAULT_PROJECT.id ? DEFAULT_COHORTS : [{ id: "all", projectId: qnr.id, cohortNumber: 0, title: "ทั้งหมด", startDate: "", endDate: "" }],
      activeCohortId: cohortId,
      totalRespondents,
      targetAttendees,
      responseRate,
      compositeMean: stats.compositeMean,
      compositeSd: stats.compositeSd,
      compositePercentage: stats.compositePercentage,
      compositeQuality: stats.compositeQuality,
      roiIndex,
      continuationRate,
      dimensions: stats.dimensions,
      questions: stats.questions,
      enableSection1: qnr.enableSection1 ?? true,
      section1Title: qnr.section1Title || DEFAULT_SECTION1_TITLE,
      respondentNameLabel: qnr.respondentNameLabel || DEFAULT_RESPONDENT_NAME_LABEL,
      enableGovId: qnr.enableGovId ?? true,
      govIdLabel: qnr.govIdLabel || DEFAULT_GOV_ID_LABEL,
      demographicCustomFields: qnr.demographicCustomFields || [],
      enableSection3: qnr.enableSection3 ?? true,
      section3Title: qnr.section3Title || DEFAULT_SECTION3_TITLE,
      rawResponses,
      qualitative: {
        strengths: feedbackCards[0]?.comments || [],
        improvements: feedbackCards[1]?.comments || [],
        futureTopics: (feedbackCards[2]?.comments || []).map((c) => ({
          topic: c.text,
          votes: 1,
        })),
        generalComments: feedbackCards[3]?.comments || [],
        feedbackCards,
        npsScore: 84,
        feedbackRate,
      },
    };

    setCachedDashboardSummary(cacheKey, summary);
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
