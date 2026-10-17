import { DEFAULT_PROJECT } from "../constants";
import { Project } from "../types";
import { getD1 } from "./d1";

// In-Memory store fallback
let inMemoryProject: Project = { ...DEFAULT_PROJECT };

/**
 * ดึงข้อมูลโครงการและหลักสูตร จาก Cloudflare D1
 */
export async function getProject(projectId: string = "PRJ-2567-TR048"): Promise<Project> {
  const d1 = await getD1();
  if (d1) {
    try {
      const row: any = await d1.prepare(
        "SELECT id, code, title, course_title, department, venue, instructors, start_date, end_date, target_attendees, status FROM projects WHERE id = ? LIMIT 1"
      ).bind(projectId).first();

      if (row) {
        return {
          id: row.id,
          code: row.code,
          title: row.title,
          courseTitle: row.course_title || inMemoryProject.courseTitle,
          department: row.department,
          venue: row.venue,
          instructors: row.instructors,
          startDate: typeof row.start_date === "string" ? row.start_date : String(row.start_date),
          endDate: typeof row.end_date === "string" ? row.end_date : String(row.end_date),
          targetAttendees: Number(row.target_attendees) || 150,
          status: row.status as any,
        };
      }
    } catch (err) {
      console.warn("D1 query error in getProject, falling back to memory:", err);
    }
  }

  return inMemoryProject;
}

/**
 * อัปเดตข้อมูลโครงการ/หลักสูตร/วิทยากร บน Cloudflare D1
 */
export async function updateProject(
  updatedData: Partial<Project>,
  projectId: string = "PRJ-2567-TR048"
): Promise<Project> {
  inMemoryProject = {
    ...inMemoryProject,
    ...updatedData,
  };

  const d1 = await getD1();
  if (d1) {
    try {
      await d1.prepare(`
        UPDATE projects SET
          title = COALESCE(?, title),
          course_title = COALESCE(?, course_title),
          instructors = COALESCE(?, instructors),
          department = COALESCE(?, department),
          venue = COALESCE(?, venue),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        updatedData.title || null,
        updatedData.courseTitle || null,
        updatedData.instructors || null,
        updatedData.department || null,
        updatedData.venue || null,
        projectId
      ).run();
    } catch (err) {
      console.error("Failed to update project in D1:", err);
    }
  }

  return inMemoryProject;
}
