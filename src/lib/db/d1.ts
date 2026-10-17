import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

/**
 * ดึง D1 Database instance จาก Cloudflare Workers context
 */
export async function getD1(): Promise<D1Database | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    if (context?.env?.DB) {
      return context.env.DB;
    }
  } catch {
    // ไม่อยู่ใน Cloudflare Worker environment (เช่นรันใน build time หรือ node ธรรมดา)
  }
  return null;
}

/**
 * ส่งคำสั่ง SELECT ไปยัง Cloudflare D1 และคืนค่าแถวผลลัพธ์ทั้งหมด
 */
export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getD1();
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.all<T>();
    return res.results || [];
  } catch (err) {
    console.error("D1 query error:", err);
    return [];
  }
}

/**
 * ส่งคำสั่ง SELECT ไปยัง Cloudflare D1 และคืนค่าแถวแรก
 */
export async function queryD1First<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = await getD1();
  if (!db) return null;
  try {
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    return await bound.first<T>();
  } catch (err) {
    console.error("D1 queryFirst error:", err);
    return null;
  }
}

/**
 * รันคำสั่ง INSERT / UPDATE / DELETE บน Cloudflare D1
 */
export async function executeD1(sql: string, params: any[] = []): Promise<boolean> {
  const db = await getD1();
  if (!db) return false;
  try {
    const stmt = db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const res = await bound.run();
    return res.success;
  } catch (err) {
    console.error("D1 execute error:", err);
    return false;
  }
}
