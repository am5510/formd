import { neon } from "@neondatabase/serverless";
import { EvaluationResponseInput, EvaluationResponseRecord, DashboardSummary } from "../types";
import { INITIAL_MOCK_RESPONSES } from "./mockData";

const databaseUrl = process.env.DATABASE_URL;

// In-memory store fallback สำหรับการทดสอบเมื่อยังไม่ได้ใส่ DATABASE_URL
let inMemoryResponses: EvaluationResponseRecord[] = [...INITIAL_MOCK_RESPONSES];

interface ResponsesCacheEntry {
  data: EvaluationResponseRecord[];
  time: number;
}
const responsesCache = new Map<string, ResponsesCacheEntry>();
const RESPONSES_CACHE_TTL_MS = 20000; // 20 seconds TTL

const dashboardSummaryCache = new Map<string, { data: DashboardSummary; time: number }>();
const DASHBOARD_CACHE_TTL_MS = 15000; // 15 seconds TTL

export function invalidateResponsesCache() {
  responsesCache.clear();
}

export function getCachedDashboardSummary(key: string): DashboardSummary | null {
  const item = dashboardSummaryCache.get(key);
  if (item && Date.now() - item.time < DASHBOARD_CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

export function setCachedDashboardSummary(key: string, data: DashboardSummary) {
  dashboardSummaryCache.set(key, { data, time: Date.now() });
}

export function invalidateDashboardCache() {
  dashboardSummaryCache.clear();
}

/**
 * ตรวจสอบว่าระบบเชื่อมต่อ Neon Database ได้หรือไม่
 */
export function isNeonConfigured(): boolean {
  return Boolean(databaseUrl && databaseUrl.trim().length > 0 && databaseUrl.startsWith("postgres"));
}

/**
 * สร้าง Client สำหรับส่งคำสั่งไปยัง Neon PostgreSQL
 */
export function getNeonSql() {
  if (!isNeonConfigured()) {
    return null;
  }
  return neon(databaseUrl!);
}

/**
 * ดึงรายการบันทึกแบบประเมินทั้งหมด (พร้อมตัวกรองโครงการ และรุ่น)
 */
export async function getEvaluationResponses(
  projectId: string = "PRJ-2567-TR048",
  cohortId?: string
): Promise<EvaluationResponseRecord[]> {
  const cacheKey = `${projectId}_${cohortId || "all"}`;
  const cached = responsesCache.get(cacheKey);
  if (cached && Date.now() - cached.time < RESPONSES_CACHE_TTL_MS) {
    return cached.data;
  }

  const sql = getNeonSql();

  if (!sql) {
    // Fallback: ใช้ In-Memory Mock Data
    const fallbackData = inMemoryResponses.filter((r) => {
      const matchProject = r.projectId === projectId;
      const matchCohort = !cohortId || cohortId === "all" || r.cohortId === cohortId;
      return matchProject && matchCohort;
    });
    responsesCache.set(cacheKey, { data: fallbackData, time: Date.now() });
    return fallbackData;
  }

  try {
    let rows;
    if (!cohortId || cohortId === "all") {
      rows = await sql`
        SELECT * FROM evaluation_responses 
        WHERE project_id = ${projectId} 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM evaluation_responses 
        WHERE project_id = ${projectId} AND cohort_id = ${cohortId}
        ORDER BY created_at DESC
      `;
    }

    const result = rows.map((row: any) => {
      const scores: Record<string, number> = {};
      for (let i = 1; i <= 20; i++) {
        const val = Number(row[`q${i}`]);
        scores[`q${i}`] = val;
        scores[i] = val;
        scores[String(i)] = val;
      }
      let feedbackData: Record<string, string> = {};
      let demographicData: Record<string, string> = {};
      if (row.feedback_data) {
        try {
          const parsed = typeof row.feedback_data === "string" ? JSON.parse(row.feedback_data) : row.feedback_data;
          if (parsed && typeof parsed === "object") {
            feedbackData = parsed;
            if (parsed._demographicValues) {
              demographicData = parsed._demographicValues;
            } else {
              demographicData = parsed;
            }
          }
        } catch (_) {}
      }
      return {
        id: row.id,
        projectId: row.project_id,
        cohortId: row.cohort_id,
        respondentName: row.respondent_name,
        govId: row.gov_id,
        positionLevel: row.position_level,
        scores,
        scoreMean: Number(row.score_mean),
        feedbackStrength: row.feedback_strength,
        feedbackImprove: row.feedback_improve,
        feedbackTopics: row.feedback_topics,
        feedbackOthers: row.feedback_others,
        feedbackValues: feedbackData,
        demographicValues: demographicData,
        isDraft: Boolean(row.is_draft),
        createdAt: row.created_at,
      };
    });

    responsesCache.set(cacheKey, { data: result, time: Date.now() });
    return result;
  } catch (err) {
    console.warn("Neon DB query error, falling back to mock data:", err);
    return inMemoryResponses;
  }
}

/**
 * บันทึกแบบประเมินความพึงพอใจใหม่ลงใน Neon Database
 */
export async function insertEvaluationResponse(
  input: EvaluationResponseInput,
  isDraft: boolean = false
): Promise<EvaluationResponseRecord> {
  const scoreKeys = Object.keys(input.scores);
  const scoreValues = Object.values(input.scores);
  const sum = scoreValues.reduce((a, b) => a + b, 0);
  const scoreMean = scoreValues.length > 0 ? Number((sum / scoreValues.length).toFixed(2)) : 0;

  const feedbackMap: Record<string, string> = {
    ...(input.feedbackValues || {}),
  };
  if (input.feedbackStrength) feedbackMap.strength = input.feedbackStrength;
  if (input.feedbackImprove) feedbackMap.improve = input.feedbackImprove;
  if (input.feedbackTopics) feedbackMap.topics = input.feedbackTopics;
  if (input.feedbackOthers) feedbackMap.others = input.feedbackOthers;
  if (input.demographicValues) {
    Object.assign(feedbackMap, input.demographicValues);
  }

  const newRecord: EvaluationResponseRecord = {
    id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    projectId: input.projectId,
    cohortId: input.cohortId,
    respondentName: input.respondentName,
    govId: input.govId,
    positionLevel: input.positionLevel,
    scores: input.scores,
    scoreMean,
    feedbackStrength: input.feedbackStrength,
    feedbackImprove: input.feedbackImprove,
    feedbackTopics: input.feedbackTopics,
    feedbackOthers: input.feedbackOthers,
    feedbackValues: feedbackMap,
    demographicValues: input.demographicValues,
    attachments: input.attachments,
    isDraft,
    createdAt: new Date().toISOString(),
  };

  const sql = getNeonSql();

  if (!sql) {
    inMemoryResponses.unshift(newRecord);
    return newRecord;
  }

  try {
    const q = input.scores;
    const inserted = await sql`
      INSERT INTO evaluation_responses (
        project_id, cohort_id, respondent_name, gov_id, position_level,
        q1, q2, q3, q4, q5, q6, q7, q8, q9, q10,
        q11, q12, q13, q14, q15, q16, q17, q18, q19, q20,
        score_mean, feedback_strength, feedback_improve, feedback_topics, feedback_others, feedback_data, is_draft
      ) VALUES (
        ${input.projectId}, ${input.cohortId || null}, ${input.respondentName}, ${input.govId || null}, ${input.positionLevel},
        ${q.q1 || 5}, ${q.q2 || 5}, ${q.q3 || 5}, ${q.q4 || 5}, ${q.q5 || 5},
        ${q.q6 || 5}, ${q.q7 || 5}, ${q.q8 || 5}, ${q.q9 || 5}, ${q.q10 || 5},
        ${q.q11 || 5}, ${q.q12 || 5}, ${q.q13 || 5}, ${q.q14 || 5}, ${q.q15 || 5},
        ${q.q16 || 5}, ${q.q17 || 5}, ${q.q18 || 5}, ${q.q19 || 5}, ${q.q20 || 5},
        ${scoreMean}, ${input.feedbackStrength || null}, ${input.feedbackImprove || null},
        ${input.feedbackTopics || null}, ${input.feedbackOthers || null}, ${JSON.stringify(feedbackMap)}, ${isDraft}
      )
      RETURNING id, created_at;
    `;

    if (inserted && inserted.length > 0) {
      newRecord.id = inserted[0].id;
      newRecord.createdAt = inserted[0].created_at;
    }
  } catch (err) {
    console.error("Failed to insert into Neon DB, kept in memory:", err);
    inMemoryResponses.unshift(newRecord);
  }

  // เคลียร์ in-memory cache ทันทีเมื่อมีผู้ส่งแบบประเมินใหม่
  invalidateResponsesCache();
  invalidateDashboardCache();

  return newRecord;
}
