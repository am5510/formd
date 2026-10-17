import { DEFAULT_PROJECT } from "../constants";
import { Project } from "../types";
import { getNeonSql } from "./neon";

// In-Memory store fallback
let inMemoryProject: Project = { ...DEFAULT_PROJECT };

/**
 * ดึงข้อมูลโครงการและหลักสูตร
 */
export async function getProject(projectId: string = "PRJ-2567-TR048"): Promise<Project> {
  const sql = getNeonSql();

  if (!sql) {
    return inMemoryProject;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        course_title VARCHAR(255),
        department VARCHAR(255) NOT NULL,
        venue VARCHAR(255),
        instructors VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        target_attendees INT DEFAULT 150,
        status VARCHAR(32) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure course_title column exists if table was created previously without it
    await sql`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS course_title VARCHAR(255);
    `;

    const rows = await sql`
      SELECT id, code, title, course_title, department, venue, instructors, 
             start_date, end_date, target_attendees, status
      FROM projects
      WHERE id = ${projectId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Seed default project into DB
      await sql`
        INSERT INTO projects (
          id, code, title, course_title, department, venue, instructors, 
          start_date, end_date, target_attendees, status
        ) VALUES (
          ${DEFAULT_PROJECT.id}, ${DEFAULT_PROJECT.code}, ${DEFAULT_PROJECT.title}, 
          ${DEFAULT_PROJECT.courseTitle || ''}, ${DEFAULT_PROJECT.department}, 
          ${DEFAULT_PROJECT.venue}, ${DEFAULT_PROJECT.instructors}, 
          ${DEFAULT_PROJECT.startDate}, ${DEFAULT_PROJECT.endDate}, 
          ${DEFAULT_PROJECT.targetAttendees}, ${DEFAULT_PROJECT.status}
        ) ON CONFLICT (id) DO NOTHING;
      `;
      return inMemoryProject;
    }

    const r = rows[0] as any;
    return {
      id: r.id,
      code: r.code,
      title: r.title,
      courseTitle: r.course_title || inMemoryProject.courseTitle,
      department: r.department,
      venue: r.venue,
      instructors: r.instructors,
      startDate: typeof r.start_date === "string" ? r.start_date : r.start_date.toISOString().slice(0, 10),
      endDate: typeof r.end_date === "string" ? r.end_date : r.end_date.toISOString().slice(0, 10),
      targetAttendees: Number(r.target_attendees),
      status: r.status as any,
    };
  } catch (err) {
    console.warn("Failed to query projects from Neon, using memory:", err);
    return inMemoryProject;
  }
}

/**
 * อัปเดตข้อมูลโครงการ/หลักสูตร/วิทยากร
 */
export async function updateProject(
  updatedData: Partial<Project>,
  projectId: string = "PRJ-2567-TR048"
): Promise<Project> {
  inMemoryProject = {
    ...inMemoryProject,
    ...updatedData,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        UPDATE projects SET
          title = COALESCE(${updatedData.title}, title),
          course_title = COALESCE(${updatedData.courseTitle}, course_title),
          instructors = COALESCE(${updatedData.instructors}, instructors),
          department = COALESCE(${updatedData.department}, department),
          venue = COALESCE(${updatedData.venue}, venue),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${projectId};
      `;
    } catch (err) {
      console.error("Failed to update project in Neon:", err);
    }
  }

  return inMemoryProject;
}
