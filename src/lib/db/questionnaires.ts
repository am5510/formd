import {
  DEFAULT_PROJECT,
  EVALUATION_QUESTIONS,
  DEFAULT_SECTION1_TITLE,
  DEFAULT_RESPONDENT_NAME_LABEL,
  DEFAULT_RESPONDENT_NAME_PLACEHOLDER,
  DEFAULT_GOV_ID_LABEL,
  DEFAULT_GOV_ID_PLACEHOLDER,
  DEFAULT_SECTION3_TITLE,
  DEFAULT_FEEDBACK_ITEMS,
  DEFAULT_SECTION4_TITLE,
  DEFAULT_SECTION4_DESCRIPTION,
  DEFAULT_SECTION4_LABEL,
  DEFAULT_SECTION4_HELPER_TEXT,
} from "../constants";
import {
  Questionnaire,
  QuestionItem,
  FeedbackFieldItem,
  DemographicFieldItem,
} from "../types";
import { getNeonSql } from "./neon";

// In-Memory store สำหรับเก็บรายการแบบสอบถามทั้งหมดที่ถูกสร้างขึ้น
let inMemoryQuestionnaires: Questionnaire[] = [];
let tableEnsured = false;
let cachedQuestionnaires: Questionnaire[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 20000; // 20 วินาที cache เพื่อลดเวลาเรียกฐานข้อมูล Neon ซ้ำซ้อน

export function invalidateQuestionnairesCache() {
  cachedQuestionnaires = null;
  lastCacheTime = 0;
}

async function ensureTable(sql: any) {
  if (tableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id VARCHAR(64) PRIMARY KEY,
      title TEXT NOT NULL,
      course_title TEXT NOT NULL,
      instructors TEXT NOT NULL,
      department TEXT NOT NULL,
      date_display TEXT NOT NULL,
      venue TEXT NOT NULL,
      questions JSONB NOT NULL,
      extra_config JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await sql`ALTER TABLE questionnaires ADD COLUMN IF NOT EXISTS extra_config JSONB DEFAULT '{}'::jsonb;`;
  } catch {
    // ignore if already exists
  }
  tableEnsured = true;
}

/**
 * ดึงรายการแบบสอบถามทั้งหมดที่สร้างไว้
 */
export async function getAllQuestionnaires(): Promise<Questionnaire[]> {
  const now = Date.now();
  if (cachedQuestionnaires && cachedQuestionnaires.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedQuestionnaires;
  }

  const sql = getNeonSql();
  if (!sql) {
    return inMemoryQuestionnaires;
  }

  try {
    await ensureTable(sql);
    const rows = await sql`
      SELECT id, title, course_title, instructors, department, date_display, venue, questions, extra_config, created_at, updated_at
      FROM questionnaires
      ORDER BY created_at DESC;
    `;

    const list: Questionnaire[] = rows.map((r: any) => {
      const extra =
        r.extra_config && typeof r.extra_config === "string"
          ? JSON.parse(r.extra_config)
          : r.extra_config || {};
      return {
        id: r.id,
        title: r.title,
        courseTitle: r.course_title,
        instructors: r.instructors,
        department: r.department,
        dateDisplay: r.date_display,
        venue: r.venue,
        targetAttendees: Number(extra.targetAttendees) || 150,
        enableSection1: extra.enableSection1 ?? true,
        section1Title: extra.section1Title || DEFAULT_SECTION1_TITLE,
        respondentNameLabel: extra.respondentNameLabel || DEFAULT_RESPONDENT_NAME_LABEL,
        respondentNamePlaceholder:
          extra.respondentNamePlaceholder !== undefined
            ? extra.respondentNamePlaceholder
            : "",
        respondentNameRequired: extra.respondentNameRequired ?? true,
        enableGovId: extra.enableGovId ?? true,
        govIdLabel: extra.govIdLabel || DEFAULT_GOV_ID_LABEL,
        govIdPlaceholder:
          extra.govIdPlaceholder !== undefined ? extra.govIdPlaceholder : "",
        govIdRequired: extra.govIdRequired ?? false,
        demographicCustomFields: Array.isArray(extra.demographicCustomFields)
          ? extra.demographicCustomFields
          : [],
        questions: typeof r.questions === "string" ? JSON.parse(r.questions) : r.questions,
        enableSection3: extra.enableSection3 ?? true,
        section3Title: extra.section3Title || DEFAULT_SECTION3_TITLE,
        feedbackItems: Array.isArray(extra.feedbackItems)
          ? extra.feedbackItems
          : [...DEFAULT_FEEDBACK_ITEMS],
        enableSection4: extra.enableSection4 ?? true,
        section4Title: extra.section4Title || DEFAULT_SECTION4_TITLE,
        section4Description: extra.section4Description || DEFAULT_SECTION4_DESCRIPTION,
        section4Label: extra.section4Label || DEFAULT_SECTION4_LABEL,
        section4HelperText: extra.section4HelperText || DEFAULT_SECTION4_HELPER_TEXT,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    });

    if (list.length === 0) {
      const defaultQnr = await createQuestionnaire({
        title: DEFAULT_PROJECT.title,
        courseTitle:
          DEFAULT_PROJECT.courseTitle ||
          "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)",
        instructors: DEFAULT_PROJECT.instructors,
        department: DEFAULT_PROJECT.department,
        dateDisplay: "15 - 17 พฤษภาคม 2567",
        venue: DEFAULT_PROJECT.venue,
        targetAttendees: DEFAULT_PROJECT.targetAttendees || 150,
        questions: [...EVALUATION_QUESTIONS],
        enableSection3: true,
        section3Title: DEFAULT_SECTION3_TITLE,
        feedbackItems: [...DEFAULT_FEEDBACK_ITEMS],
        enableSection4: true,
        section4Title: DEFAULT_SECTION4_TITLE,
        section4Description: DEFAULT_SECTION4_DESCRIPTION,
        section4Label: DEFAULT_SECTION4_LABEL,
        section4HelperText: DEFAULT_SECTION4_HELPER_TEXT,
      });
      cachedQuestionnaires = [defaultQnr];
      lastCacheTime = Date.now();
      inMemoryQuestionnaires = [defaultQnr];
      return [defaultQnr];
    }

    cachedQuestionnaires = list;
    lastCacheTime = Date.now();
    inMemoryQuestionnaires = list;
    return list;
  } catch (err) {
    console.warn("Failed to load questionnaires from Neon, using memory:", err);
    if (cachedQuestionnaires && cachedQuestionnaires.length > 0) return cachedQuestionnaires;
    return inMemoryQuestionnaires;
  }
}

/**
 * ดึงแบบสอบถามตาม ID (หากไม่ระบุ ID จะดึงแบบสอบถามล่าสุด หรือค่าเริ่มต้น)
 */
export async function getQuestionnaireById(id?: string | null): Promise<Questionnaire> {
  const all = await getAllQuestionnaires();

  if (id) {
    const found = all.find((q) => q.id === id);
    if (found) return found;
    if (id === DEFAULT_PROJECT.id) {
      return {
        id: DEFAULT_PROJECT.id,
        title: DEFAULT_PROJECT.title,
        courseTitle:
          DEFAULT_PROJECT.courseTitle ||
          "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)",
        instructors: DEFAULT_PROJECT.instructors,
        department: DEFAULT_PROJECT.department,
        dateDisplay: "15 - 17 พฤษภาคม 2567",
        venue: DEFAULT_PROJECT.venue,
        targetAttendees: DEFAULT_PROJECT.targetAttendees || 150,
        enableSection1: true,
        section1Title: DEFAULT_SECTION1_TITLE,
        respondentNameLabel: DEFAULT_RESPONDENT_NAME_LABEL,
        respondentNamePlaceholder: DEFAULT_RESPONDENT_NAME_PLACEHOLDER,
        respondentNameRequired: true,
        enableGovId: true,
        govIdLabel: DEFAULT_GOV_ID_LABEL,
        govIdPlaceholder: DEFAULT_GOV_ID_PLACEHOLDER,
        govIdRequired: false,
        demographicCustomFields: [],
        questions: [...EVALUATION_QUESTIONS],
        enableSection3: true,
        section3Title: DEFAULT_SECTION3_TITLE,
        feedbackItems: [...DEFAULT_FEEDBACK_ITEMS],
        enableSection4: true,
        section4Title: DEFAULT_SECTION4_TITLE,
        section4Description: DEFAULT_SECTION4_DESCRIPTION,
        section4Label: DEFAULT_SECTION4_LABEL,
        section4HelperText: DEFAULT_SECTION4_HELPER_TEXT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (all.length > 0) {
    return all[0];
  }

  // Fallback default questionnaire
  return {
    id: DEFAULT_PROJECT.id,
    title: DEFAULT_PROJECT.title,
    courseTitle:
      DEFAULT_PROJECT.courseTitle ||
      "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)",
    instructors: DEFAULT_PROJECT.instructors,
    department: DEFAULT_PROJECT.department,
    dateDisplay: "15 - 17 พฤษภาคม 2567",
    venue: DEFAULT_PROJECT.venue,
    targetAttendees: DEFAULT_PROJECT.targetAttendees || 150,
    enableSection1: true,
    section1Title: DEFAULT_SECTION1_TITLE,
    respondentNameLabel: DEFAULT_RESPONDENT_NAME_LABEL,
    respondentNamePlaceholder: DEFAULT_RESPONDENT_NAME_PLACEHOLDER,
    respondentNameRequired: true,
    enableGovId: true,
    govIdLabel: DEFAULT_GOV_ID_LABEL,
    govIdPlaceholder: DEFAULT_GOV_ID_PLACEHOLDER,
    govIdRequired: false,
    demographicCustomFields: [],
    questions: [...EVALUATION_QUESTIONS],
    enableSection3: true,
    section3Title: DEFAULT_SECTION3_TITLE,
    feedbackItems: [...DEFAULT_FEEDBACK_ITEMS],
    enableSection4: true,
    section4Title: DEFAULT_SECTION4_TITLE,
    section4Description: DEFAULT_SECTION4_DESCRIPTION,
    section4Label: DEFAULT_SECTION4_LABEL,
    section4HelperText: DEFAULT_SECTION4_HELPER_TEXT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * สร้างแบบสอบถามใหม่
 */
export async function createQuestionnaire(data: {
  title: string;
  courseTitle: string;
  instructors: string;
  department: string;
  dateDisplay: string;
  venue: string;
  targetAttendees?: number;
  enableSection1?: boolean;
  section1Title?: string;
  respondentNameLabel?: string;
  respondentNamePlaceholder?: string;
  respondentNameRequired?: boolean;
  enableGovId?: boolean;
  govIdLabel?: string;
  govIdPlaceholder?: string;
  govIdRequired?: boolean;
  demographicCustomFields?: DemographicFieldItem[];
  questions: QuestionItem[];
  enableSection3?: boolean;
  section3Title?: string;
  feedbackItems?: FeedbackFieldItem[];
  enableSection4?: boolean;
  section4Title?: string;
  section4Description?: string;
  section4Label?: string;
  section4HelperText?: string;
}): Promise<Questionnaire> {
  const id = `FORM-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();

  const newQnr: Questionnaire = {
    id,
    title: data.title.trim(),
    courseTitle: data.courseTitle.trim(),
    instructors: data.instructors.trim(),
    department: data.department.trim(),
    dateDisplay: data.dateDisplay.trim(),
    venue: data.venue.trim(),
    targetAttendees: data.targetAttendees !== undefined ? Number(data.targetAttendees) : 150,
    enableSection1: data.enableSection1 ?? true,
    section1Title: data.section1Title?.trim() || DEFAULT_SECTION1_TITLE,
    respondentNameLabel: data.respondentNameLabel?.trim() || DEFAULT_RESPONDENT_NAME_LABEL,
    respondentNamePlaceholder:
      data.respondentNamePlaceholder !== undefined
        ? data.respondentNamePlaceholder.trim()
        : "",
    respondentNameRequired: data.respondentNameRequired ?? true,
    enableGovId: data.enableGovId ?? true,
    govIdLabel: data.govIdLabel?.trim() || DEFAULT_GOV_ID_LABEL,
    govIdPlaceholder:
      data.govIdPlaceholder !== undefined
        ? data.govIdPlaceholder.trim()
        : "",
    govIdRequired: data.govIdRequired ?? false,
    demographicCustomFields: Array.isArray(data.demographicCustomFields)
      ? data.demographicCustomFields
      : [],
    questions: data.questions.map((q, idx) => ({
      ...q,
      id: idx + 1,
    })),
    enableSection3: data.enableSection3 ?? true,
    section3Title: data.section3Title?.trim() || DEFAULT_SECTION3_TITLE,
    feedbackItems: Array.isArray(data.feedbackItems)
      ? data.feedbackItems
      : [...DEFAULT_FEEDBACK_ITEMS],
    enableSection4: data.enableSection4 ?? true,
    section4Title: data.section4Title?.trim() || DEFAULT_SECTION4_TITLE,
    section4Description: data.section4Description?.trim() || DEFAULT_SECTION4_DESCRIPTION,
    section4Label: data.section4Label?.trim() || DEFAULT_SECTION4_LABEL,
    section4HelperText: data.section4HelperText?.trim() || DEFAULT_SECTION4_HELPER_TEXT,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryQuestionnaires = [newQnr, ...inMemoryQuestionnaires];
  invalidateQuestionnairesCache();

  const extraConfig = {
    targetAttendees: newQnr.targetAttendees,
    enableSection1: newQnr.enableSection1,
    section1Title: newQnr.section1Title,
    respondentNameLabel: newQnr.respondentNameLabel,
    respondentNamePlaceholder: newQnr.respondentNamePlaceholder,
    respondentNameRequired: newQnr.respondentNameRequired,
    enableGovId: newQnr.enableGovId,
    govIdLabel: newQnr.govIdLabel,
    govIdPlaceholder: newQnr.govIdPlaceholder,
    govIdRequired: newQnr.govIdRequired,
    demographicCustomFields: newQnr.demographicCustomFields,
    enableSection3: newQnr.enableSection3,
    section3Title: newQnr.section3Title,
    feedbackItems: newQnr.feedbackItems,
    enableSection4: newQnr.enableSection4,
    section4Title: newQnr.section4Title,
    section4Description: newQnr.section4Description,
    section4Label: newQnr.section4Label,
    section4HelperText: newQnr.section4HelperText,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureTable(sql);
      await sql`
        INSERT INTO questionnaires (
          id, title, course_title, instructors, department, date_display, venue, questions, extra_config, created_at, updated_at
        ) VALUES (
          ${newQnr.id},
          ${newQnr.title},
          ${newQnr.courseTitle},
          ${newQnr.instructors},
          ${newQnr.department},
          ${newQnr.dateDisplay},
          ${newQnr.venue},
          ${JSON.stringify(newQnr.questions)}::jsonb,
          ${JSON.stringify(extraConfig)}::jsonb,
          ${now},
          ${now}
        );
      `;
    } catch (err) {
      console.error("Failed to insert questionnaire into Neon:", err);
    }
  }

  return newQnr;
}

/**
 * แก้ไข/ปรับแต่งแบบสอบถามที่มีอยู่
 */
export async function updateQuestionnaire(
  id: string,
  data: Partial<Omit<Questionnaire, "id" | "createdAt" | "updatedAt">>
): Promise<Questionnaire | null> {
  await getAllQuestionnaires();
  const idx = inMemoryQuestionnaires.findIndex((q) => q.id === id);
  const now = new Date().toISOString();

  if (idx === -1) {
    return null;
  }

  const existing = inMemoryQuestionnaires[idx];
  const updated: Questionnaire = {
    ...existing,
    title: data.title !== undefined ? data.title.trim() : existing.title,
    courseTitle: data.courseTitle !== undefined ? data.courseTitle.trim() : existing.courseTitle,
    instructors: data.instructors !== undefined ? data.instructors.trim() : existing.instructors,
    department: data.department !== undefined ? data.department.trim() : existing.department,
    dateDisplay: data.dateDisplay !== undefined ? data.dateDisplay.trim() : existing.dateDisplay,
    venue: data.venue !== undefined ? data.venue.trim() : existing.venue,
    targetAttendees:
      data.targetAttendees !== undefined
        ? Number(data.targetAttendees)
        : existing.targetAttendees ?? 150,
    enableSection1:
      data.enableSection1 !== undefined ? data.enableSection1 : existing.enableSection1 ?? true,
    section1Title:
      data.section1Title !== undefined ? data.section1Title.trim() : existing.section1Title,
    respondentNameLabel:
      data.respondentNameLabel !== undefined
        ? data.respondentNameLabel.trim()
        : existing.respondentNameLabel,
    respondentNamePlaceholder:
      data.respondentNamePlaceholder !== undefined
        ? data.respondentNamePlaceholder.trim()
        : existing.respondentNamePlaceholder,
    respondentNameRequired:
      data.respondentNameRequired !== undefined
        ? data.respondentNameRequired
        : existing.respondentNameRequired ?? true,
    enableGovId:
      data.enableGovId !== undefined ? data.enableGovId : existing.enableGovId ?? true,
    govIdLabel:
      data.govIdLabel !== undefined ? data.govIdLabel.trim() : existing.govIdLabel,
    govIdPlaceholder:
      data.govIdPlaceholder !== undefined
        ? data.govIdPlaceholder.trim()
        : existing.govIdPlaceholder,
    govIdRequired:
      data.govIdRequired !== undefined
        ? data.govIdRequired
        : existing.govIdRequired ?? false,
    demographicCustomFields:
      data.demographicCustomFields !== undefined
        ? data.demographicCustomFields
        : existing.demographicCustomFields || [],
    questions:
      data.questions !== undefined
        ? data.questions.map((q, i) => ({ ...q, id: i + 1 }))
        : existing.questions,
    enableSection3:
      data.enableSection3 !== undefined ? data.enableSection3 : existing.enableSection3 ?? true,
    section3Title:
      data.section3Title !== undefined ? data.section3Title.trim() : existing.section3Title,
    feedbackItems:
      data.feedbackItems !== undefined ? data.feedbackItems : existing.feedbackItems,
    enableSection4:
      data.enableSection4 !== undefined ? data.enableSection4 : existing.enableSection4 ?? true,
    section4Title:
      data.section4Title !== undefined ? data.section4Title.trim() : existing.section4Title,
    section4Description:
      data.section4Description !== undefined
        ? data.section4Description.trim()
        : existing.section4Description,
    section4Label:
      data.section4Label !== undefined ? data.section4Label.trim() : existing.section4Label,
    section4HelperText:
      data.section4HelperText !== undefined
        ? data.section4HelperText.trim()
        : existing.section4HelperText,
    updatedAt: now,
  };

  inMemoryQuestionnaires[idx] = updated;
  invalidateQuestionnairesCache();

  const extraConfig = {
    targetAttendees: updated.targetAttendees,
    enableSection1: updated.enableSection1,
    section1Title: updated.section1Title,
    respondentNameLabel: updated.respondentNameLabel,
    respondentNamePlaceholder: updated.respondentNamePlaceholder,
    respondentNameRequired: updated.respondentNameRequired,
    enableGovId: updated.enableGovId,
    govIdLabel: updated.govIdLabel,
    govIdPlaceholder: updated.govIdPlaceholder,
    govIdRequired: updated.govIdRequired,
    demographicCustomFields: updated.demographicCustomFields,
    enableSection3: updated.enableSection3,
    section3Title: updated.section3Title,
    feedbackItems: updated.feedbackItems,
    enableSection4: updated.enableSection4,
    section4Title: updated.section4Title,
    section4Description: updated.section4Description,
    section4Label: updated.section4Label,
    section4HelperText: updated.section4HelperText,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureTable(sql);
      await sql`
        UPDATE questionnaires SET
          title = ${updated.title},
          course_title = ${updated.courseTitle},
          instructors = ${updated.instructors},
          department = ${updated.department},
          date_display = ${updated.dateDisplay},
          venue = ${updated.venue},
          questions = ${JSON.stringify(updated.questions)}::jsonb,
          extra_config = ${JSON.stringify(extraConfig)}::jsonb,
          updated_at = ${now}
        WHERE id = ${id};
      `;
    } catch (err) {
      console.error("Failed to update questionnaire in Neon:", err);
    }
  }

  return updated;
}

/**
 * ลบแบบสอบถาม
 */
export async function deleteQuestionnaire(id: string): Promise<boolean> {
  inMemoryQuestionnaires = inMemoryQuestionnaires.filter((q) => q.id !== id);
  invalidateQuestionnairesCache();

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureTable(sql);
      await sql`DELETE FROM questionnaires WHERE id = ${id};`;
    } catch (err) {
      console.error("Failed to delete questionnaire from Neon:", err);
    }
  }

  return true;
}
