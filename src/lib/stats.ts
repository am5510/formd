import { DIMENSIONS, EVALUATION_QUESTIONS } from "./constants";
import { DimensionStat, QuestionStat, EvaluationResponseRecord, QuestionItem } from "./types";

/**
 * คำนวณค่าเฉลี่ยเลขคณิต (Mean)
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(2));
}

/**
 * คำนวณค่าส่วนเบี่ยงเบนมาตรฐานของกลุ่มตัวอย่าง (Sample Standard Deviation - S.D.)
 */
export function calculateSD(values: number[], mean?: number): number {
  if (values.length <= 1) return 0;
  const m = mean ?? calculateMean(values);
  const variance =
    values.reduce((acc, curr) => acc + Math.pow(curr - m, 2), 0) /
    (values.length - 1);
  return Number(Math.sqrt(variance).toFixed(2));
}

/**
 * แปลงคะแนนเฉลี่ยเต็ม 5 เป็นร้อยละ (Percentage)
 */
export function calculatePercentage(mean: number): number {
  return Number(((mean / 5) * 100).toFixed(1));
}

/**
 * เกณฑ์การแปลความหมายระดับคุณภาพความพึงพอใจ (Likert Scale 5 ระดับ)
 * อ้างอิงตามเกณฑ์มาตรฐานการประเมินโครงการภาครัฐของ ก.พ.ร.
 */
export function interpretQuality(mean: number): string {
  if (mean >= 4.51) return "พึงพอใจมากที่สุด";
  if (mean >= 3.51) return "พึงพอใจมาก";
  if (mean >= 2.51) return "พึงพอใจปานกลาง";
  if (mean >= 1.51) return "พึงพอใจน้อย";
  return "พึงพอใจน้อยที่สุด";
}

/**
 * สรุปผลสถิติสำหรับทั้ง 20 ข้อ และ 5 มิติจากรายการบันทึกผลการประเมิน
 */
export function computeEvaluationStats(
  responses: EvaluationResponseRecord[],
  customQuestions?: QuestionItem[]
): {
  compositeMean: number;
  compositeSd: number;
  compositePercentage: number;
  compositeQuality: string;
  dimensions: DimensionStat[];
  questions: QuestionStat[];
} {
  const activeQuestions =
    Array.isArray(customQuestions) && customQuestions.length > 0
      ? customQuestions
      : EVALUATION_QUESTIONS;

  const defaultIcons = [
    "menu_book",
    "co_present",
    "settings",
    "meeting_room",
    "trending_up",
    "verified",
    "star",
    "psychology",
  ];

  const getCleanDimTitle = (rawTitle: string | undefined, dimId: number, fallback: string) => {
    if (rawTitle && rawTitle.trim()) {
      const cleaned = rawTitle.replace(/^(\d+(\.\d+)?|มิติที่\s*\d+|ด้านที่\s*\d+)\s*[:.-]?\s*/i, "").trim();
      return cleaned || rawTitle.trim();
    }
    return fallback || `หัวข้อที่ ${dimId}`;
  };

  const getQuestionsRange = (dimQuestions: QuestionItem[] | QuestionStat[], fallbackId: number) => {
    if (dimQuestions.length === 0) return `ข้อ ${fallbackId}`;
    const minQ = Math.min(...dimQuestions.map((q) => q.id));
    const maxQ = Math.max(...dimQuestions.map((q) => q.id));
    return dimQuestions.length > 1 ? `ข้อ ${minQ}-${maxQ}` : `ข้อ ${minQ}`;
  };

  // ดึงรายการ Dimension ID ทั้งหมดที่มีในแบบสอบถามชุดนี้ (เรียงตามลำดับคำถามจริง)
  const uniqueDimensionIds: number[] = [];
  activeQuestions.forEach((q) => {
    if (!uniqueDimensionIds.includes(q.dimensionId)) {
      uniqueDimensionIds.push(q.dimensionId);
    }
  });

  if (responses.length === 0) {
    const emptyQuestions: QuestionStat[] = activeQuestions.map((q) => {
      const stdDim = DIMENSIONS.find((d) => d.id === q.dimensionId);
      return {
        id: q.id,
        dimensionId: q.dimensionId,
        dimensionTitle: q.dimensionTitle || stdDim?.title || `หัวข้อที่ ${q.dimensionId}`,
        text: q.text,
        mean: 0,
        sd: 0,
        percentage: 0,
        qualityLevel: "รอข้อมูลประเมิน",
      };
    });

    const emptyDimensions: DimensionStat[] = uniqueDimensionIds.map((dimId, idx) => {
      const stdDim = DIMENSIONS.find((d) => d.id === dimId);
      const dimQuestions = activeQuestions.filter((q) => q.dimensionId === dimId);
      const title = getCleanDimTitle(dimQuestions[0]?.dimensionTitle, dimId, stdDim?.shortTitle || `หัวข้อที่ ${dimId}`);
      const range = getQuestionsRange(dimQuestions, dimId);
      const icon = stdDim?.icon || defaultIcons[idx % defaultIcons.length] || "fact_check";

      return {
        dimensionId: dimId,
        dimensionTitle: title,
        questionsRange: range,
        icon,
        mean: 0,
        percentage: 0,
        sd: 0,
        qualityLevel: "รอข้อมูลประเมิน",
        isTopRanked: idx === 0,
      };
    });

    return {
      compositeMean: 0,
      compositeSd: 0,
      compositePercentage: 0,
      compositeQuality: "รอข้อมูลประเมิน",
      dimensions: emptyDimensions,
      questions: emptyQuestions,
    };
  }

  // 1. คำนวณสถิติรายข้อ
  const questions: QuestionStat[] = activeQuestions.map((q) => {
    const key = `q${q.id}`;
    const scores = responses
      .map((r) => r.scores ? (r.scores[key] ?? r.scores[q.id] ?? r.scores[String(q.id)]) : undefined)
      .filter((s): s is number => typeof s === "number" && s >= 1 && s <= 5);

    const mean = calculateMean(scores);
    const sd = calculateSD(scores, mean);
    const percentage = calculatePercentage(mean);
    const qualityLevel = interpretQuality(mean);

    const stdDim = DIMENSIONS.find((d) => d.id === q.dimensionId);

    return {
      id: q.id,
      dimensionId: q.dimensionId,
      dimensionTitle: q.dimensionTitle || stdDim?.title || `หัวข้อที่ ${q.dimensionId}`,
      text: q.text,
      mean,
      sd,
      percentage,
      qualityLevel,
    };
  });

  // 2. คำนวณสถิติรายมิติ/หัวข้อหลัก (Dynamically derived from activeQuestions)
  const dimensions: DimensionStat[] = uniqueDimensionIds.map((dimId, idx) => {
    const stdDim = DIMENSIONS.find((d) => d.id === dimId);
    const dimQuestions = questions.filter((q) => q.dimensionId === dimId);
    const dimMeans = dimQuestions.map((q) => q.mean);
    const mean = calculateMean(dimMeans);
    const sd = calculateSD(dimMeans, mean);
    const percentage = calculatePercentage(mean);
    const qualityLevel = interpretQuality(mean);

    const title = getCleanDimTitle(dimQuestions[0]?.dimensionTitle, dimId, stdDim?.shortTitle || `หัวข้อที่ ${dimId}`);
    const range = getQuestionsRange(dimQuestions, dimId);
    const icon = stdDim?.icon || defaultIcons[idx % defaultIcons.length] || "fact_check";

    return {
      dimensionId: dimId,
      dimensionTitle: title,
      questionsRange: range,
      icon,
      mean,
      percentage,
      sd,
      qualityLevel,
    };
  });

  // ทำเครื่องหมายมิติที่ได้คะแนนสูงสุด (Rank #1)
  let maxMean = -1;
  let topDimIndex = -1;
  dimensions.forEach((d, idx) => {
    if (d.mean > maxMean) {
      maxMean = d.mean;
      topDimIndex = idx;
    }
  });
  if (topDimIndex >= 0) {
    dimensions[topDimIndex].isTopRanked = true;
  }

  // 3. คำนวณคะแนนเฉลี่ยรวมทุกด้าน (Composite Total Mean)
  const allMeans = questions.map((q) => q.mean);
  const compositeMean = calculateMean(allMeans);
  const compositeSd = calculateSD(allMeans, compositeMean);
  const compositePercentage = calculatePercentage(compositeMean);
  const compositeQuality = interpretQuality(compositeMean);

  return {
    compositeMean,
    compositeSd,
    compositePercentage,
    compositeQuality,
    dimensions,
    questions,
  };
}
