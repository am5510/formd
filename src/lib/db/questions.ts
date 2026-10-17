import { EVALUATION_QUESTIONS } from "../constants";
import { QuestionItem } from "../types";
import { getD1 } from "./d1";

// In-Memory store เริ่มต้นด้วยข้อคำถามมาตรฐาน 20 ข้อ
let inMemoryQuestions: QuestionItem[] = [...EVALUATION_QUESTIONS];

/**
 * ดึงรายการข้อคำถามทั้งหมด จาก Cloudflare D1
 */
export async function getActiveQuestions(
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem[]> {
  const d1 = await getD1();
  if (d1) {
    try {
      const res = await d1.prepare(
        "SELECT id, dimension_id, dimension_title, text FROM evaluation_questions WHERE project_id = ? ORDER BY dimension_id ASC, id ASC"
      ).bind(projectId).all();
      const rows = res.results || [];
      if (rows.length > 0) {
        return rows.map((r: any) => ({
          id: Number(r.id),
          dimensionId: Number(r.dimension_id),
          dimensionTitle: r.dimension_title,
          text: r.text,
        }));
      }
    } catch (err) {
      console.warn("D1 query error in getActiveQuestions:", err);
    }
  }

  return inMemoryQuestions;
}

/**
 * เพิ่มข้อคำถามใหม่จากหน้าแอดมิน ลงใน Cloudflare D1
 */
export async function createQuestion(
  dimensionId: number,
  dimensionTitle: string,
  text: string,
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem> {
  const newId = inMemoryQuestions.length > 0 
    ? Math.max(...inMemoryQuestions.map((q) => q.id)) + 1 
    : 1;

  const newQuestion: QuestionItem = {
    id: newId,
    dimensionId,
    dimensionTitle,
    text,
  };

  inMemoryQuestions.push(newQuestion);

  const d1 = await getD1();
  if (d1) {
    try {
      const res = await d1.prepare(
        "INSERT INTO evaluation_questions (project_id, dimension_id, dimension_title, text) VALUES (?, ?, ?, ?) RETURNING id"
      ).bind(projectId, dimensionId, dimensionTitle, text).first<{ id: number }>();
      if (res?.id) {
        newQuestion.id = Number(res.id);
      }
    } catch (err) {
      console.error("Failed to insert question into D1:", err);
    }
  }

  return newQuestion;
}

/**
 * แก้ไขข้อคำถาม บน Cloudflare D1
 */
export async function updateQuestion(
  id: number,
  text: string,
  dimensionId?: number,
  dimensionTitle?: string
): Promise<boolean> {
  const index = inMemoryQuestions.findIndex((q) => q.id === id);
  if (index !== -1) {
    inMemoryQuestions[index].text = text;
    if (dimensionId) inMemoryQuestions[index].dimensionId = dimensionId;
    if (dimensionTitle) inMemoryQuestions[index].dimensionTitle = dimensionTitle;
  }

  const d1 = await getD1();
  if (d1) {
    try {
      if (dimensionId && dimensionTitle) {
        await d1.prepare(
          "UPDATE evaluation_questions SET text = ?, dimension_id = ?, dimension_title = ? WHERE id = ?"
        ).bind(text, dimensionId, dimensionTitle, id).run();
      } else {
        await d1.prepare(
          "UPDATE evaluation_questions SET text = ? WHERE id = ?"
        ).bind(text, id).run();
      }
    } catch (err) {
      console.error("Failed to update question in D1:", err);
    }
  }

  return true;
}

/**
 * ลบข้อคำถาม จาก Cloudflare D1
 */
export async function deleteQuestion(id: number): Promise<boolean> {
  inMemoryQuestions = inMemoryQuestions.filter((q) => q.id !== id);

  const d1 = await getD1();
  if (d1) {
    try {
      await d1.prepare("DELETE FROM evaluation_questions WHERE id = ?").bind(id).run();
    } catch (err) {
      console.error("Failed to delete question from D1:", err);
    }
  }

  return true;
}

/**
 * คืนค่าข้อคำถามตั้งต้น 20 ข้อ บน Cloudflare D1
 */
export async function resetToDefaultQuestions(
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem[]> {
  inMemoryQuestions = [...EVALUATION_QUESTIONS];

  const d1 = await getD1();
  if (d1) {
    try {
      await d1.prepare("DELETE FROM evaluation_questions WHERE project_id = ?").bind(projectId).run();
      for (const q of EVALUATION_QUESTIONS) {
        await d1.prepare(
          "INSERT INTO evaluation_questions (project_id, dimension_id, dimension_title, text) VALUES (?, ?, ?, ?)"
        ).bind(projectId, q.dimensionId, q.dimensionTitle, q.text).run();
      }
    } catch (err) {
      console.error("Failed to reset questions in D1:", err);
    }
  }

  return inMemoryQuestions;
}
