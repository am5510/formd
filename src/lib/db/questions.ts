import { EVALUATION_QUESTIONS, DIMENSIONS } from "../constants";
import { QuestionItem } from "../types";
import { getNeonSql, isNeonConfigured } from "./neon";

// In-Memory store เริ่มต้นด้วยข้อคำถามมาตรฐาน 20 ข้อ
let inMemoryQuestions: QuestionItem[] = [...EVALUATION_QUESTIONS];

/**
 * ดึงรายการข้อคำถามทั้งหมด
 */
export async function getActiveQuestions(
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem[]> {
  const sql = getNeonSql();

  if (!sql) {
    return inMemoryQuestions;
  }

  try {
    // สร้างตาราง evaluation_questions หากยังไม่มี
    await sql`
      CREATE TABLE IF NOT EXISTS evaluation_questions (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(64) DEFAULT 'PRJ-2567-TR048',
        dimension_id INT NOT NULL,
        dimension_title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        order_num INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const rows = await sql`
      SELECT id, dimension_id, dimension_title, text 
      FROM evaluation_questions 
      WHERE project_id = ${projectId}
      ORDER BY dimension_id ASC, id ASC;
    `;

    if (rows.length === 0) {
      // Seed default questions into DB on first run
      for (const q of EVALUATION_QUESTIONS) {
        await sql`
          INSERT INTO evaluation_questions (project_id, dimension_id, dimension_title, text)
          VALUES (${projectId}, ${q.dimensionId}, ${q.dimensionTitle}, ${q.text});
        `;
      }
      return inMemoryQuestions;
    }

    return rows.map((r: any) => ({
      id: Number(r.id),
      dimensionId: Number(r.dimension_id),
      dimensionTitle: r.dimension_title,
      text: r.text,
    }));
  } catch (err) {
    console.warn("Failed to query evaluation_questions from Neon, using memory:", err);
    return inMemoryQuestions;
  }
}

/**
 * เพิ่มข้อคำถามใหม่จากหน้าแอดมิน
 */
export async function createQuestion(
  dimensionId: number,
  dimensionTitle: string,
  text: string,
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem> {
  const sql = getNeonSql();

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

  if (sql) {
    try {
      const res = await sql`
        INSERT INTO evaluation_questions (project_id, dimension_id, dimension_title, text)
        VALUES (${projectId}, ${dimensionId}, ${dimensionTitle}, ${text})
        RETURNING id;
      `;
      if (res && res.length > 0) {
        newQuestion.id = Number(res[0].id);
      }
    } catch (err) {
      console.error("Failed to insert question to Neon:", err);
    }
  }

  return newQuestion;
}

/**
 * แก้ไขข้อคำถาม
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

  const sql = getNeonSql();
  if (sql) {
    try {
      if (dimensionId && dimensionTitle) {
        await sql`
          UPDATE evaluation_questions 
          SET text = ${text}, dimension_id = ${dimensionId}, dimension_title = ${dimensionTitle}
          WHERE id = ${id};
        `;
      } else {
        await sql`
          UPDATE evaluation_questions 
          SET text = ${text}
          WHERE id = ${id};
        `;
      }
    } catch (err) {
      console.error("Failed to update question in Neon:", err);
    }
  }

  return true;
}

/**
 * ลบข้อคำถาม
 */
export async function deleteQuestion(id: number): Promise<boolean> {
  inMemoryQuestions = inMemoryQuestions.filter((q) => q.id !== id);

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        DELETE FROM evaluation_questions WHERE id = ${id};
      `;
    } catch (err) {
      console.error("Failed to delete question from Neon:", err);
    }
  }

  return true;
}

/**
 * คืนค่าข้อคำถามตั้งต้น 20 ข้อ
 */
export async function resetToDefaultQuestions(
  projectId: string = "PRJ-2567-TR048"
): Promise<QuestionItem[]> {
  inMemoryQuestions = [...EVALUATION_QUESTIONS];

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`DELETE FROM evaluation_questions WHERE project_id = ${projectId};`;
      for (const q of EVALUATION_QUESTIONS) {
        await sql`
          INSERT INTO evaluation_questions (project_id, dimension_id, dimension_title, text)
          VALUES (${projectId}, ${q.dimensionId}, ${q.dimensionTitle}, ${q.text});
        `;
      }
    } catch (err) {
      console.error("Failed to reset questions in Neon:", err);
    }
  }

  return inMemoryQuestions;
}
