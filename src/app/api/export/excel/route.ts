import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getEvaluationResponses } from "@/lib/db/neon";
import { getQuestionnaireById } from "@/lib/db/questionnaires";
import { computeEvaluationStats } from "@/lib/stats";
import { DEFAULT_PROJECT, DEFAULT_FEEDBACK_ITEMS, POSITION_OPTIONS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qId = searchParams.get("id") || searchParams.get("projectId") || null;
    const cohortId = searchParams.get("cohortId") || "all";

    const qnr = await getQuestionnaireById(qId);
    const isDefaultProject = qnr.id === DEFAULT_PROJECT.id;

    // ดึงบันทึกผลการประเมินของแบบสอบถามชุดนี้ (ถ้ายังไม่มีผู้ตอบ จะได้ 0 คน ไม่ดึงโครงการอื่นมาแทน)
    const responses = await getEvaluationResponses(qnr.id, cohortId);

    const stats = computeEvaluationStats(responses, qnr.questions);
    const targetAttendees = qnr.targetAttendees || (isDefaultProject ? (DEFAULT_PROJECT.targetAttendees || 150) : 0);
    const responseRate = targetAttendees > 0 ? Number(((responses.length / targetAttendees) * 100).toFixed(1)) : 0;

    // Helper: ถอดรหัสประเภทตำแหน่ง (เฉพาะโครงการตั้งต้น)
    const getPositionLabel = (val?: string) => {
      if (!val) return "-";
      const found = POSITION_OPTIONS.find((p) => p.value === val);
      return found ? found.label : `ระดับ ${val}`;
    };

    // Helper: รายการหัวข้อข้อเสนอแนะใน Section 3
    const feedbackItems = Array.isArray(qnr.feedbackItems) && qnr.feedbackItems.length > 0
      ? qnr.feedbackItems
      : (isDefaultProject ? DEFAULT_FEEDBACK_ITEMS : []);

    // ชื่อคอลัมน์ตามการตั้งค่าของแบบสอบถาม
    const nameCol = qnr.respondentNameLabel || "ชื่อ-นามสกุล";
    const govIdCol = qnr.govIdLabel || "รหัสราชการ/เลขประจำตัว";

    // =========================================================================
    // SHEET 1: สรุปผลการประเมินภาพรวม (Summary)
    // =========================================================================
    const summaryData: any[] = [
      { "หัวข้อ": "ข้อมูลโครงการฝึกอบรม", "รายละเอียด": "" },
      { "หัวข้อ": "รหัสแบบสอบถาม", "รายละเอียด": qnr.id },
      { "หัวข้อ": "ชื่อโครงการ", "รายละเอียด": qnr.title || "-" },
      { "หัวข้อ": "หลักสูตร / วิชา", "รายละเอียด": qnr.courseTitle || "-" },
      { "หัวข้อ": "หน่วยงาน / สังกัด", "รายละเอียด": qnr.department || "-" },
      { "หัวข้อ": "วิทยากร", "รายละเอียด": qnr.instructors || "-" },
      { "หัวข้อ": "สถานที่จัด", "รายละเอียด": qnr.venue || "-" },
      { "หัวข้อ": "วันที่จัดอบรม", "รายละเอียด": qnr.dateDisplay || "-" },
      { "หัวข้อ": "จำนวนเป้าหมาย", "รายละเอียด": targetAttendees > 0 ? `${targetAttendees} คน` : "-" },
      { "หัวข้อ": "จำนวนผู้ตอบจริง (N)", "รายละเอียด": `${responses.length} คน` },
      { "หัวข้อ": "อัตราการตอบกลับ (Response Rate)", "รายละเอียด": targetAttendees > 0 ? `${responseRate}%` : "-" },
      { "หัวข้อ": "คะแนนเฉลี่ยรวมทุกด้าน (Composite Mean)", "รายละเอียด": `${stats.compositeMean.toFixed(2)} / 5.00` },
      { "หัวข้อ": "ส่วนเบี่ยงเบนมาตรฐาน (S.D.)", "รายละเอียด": stats.compositeSd.toFixed(2) },
      { "หัวข้อ": "ร้อยละความพึงพอใจรวม", "รายละเอียด": `${stats.compositePercentage}%` },
      { "หัวข้อ": "ระดับคุณภาพโดยรวม", "รายละเอียด": stats.compositeQuality },
      { "หัวข้อ": "", "รายละเอียด": "" },
      { "หัวข้อ": "--- สรุปคะแนนจำแนกตามหัวข้อหลัก ---", "รายละเอียด": "" },
    ];

    stats.dimensions.forEach((dim, idx) => {
      summaryData.push({
        "หัวข้อ": `หัวข้อที่ ${idx + 1}: ${dim.dimensionTitle} (${dim.questionsRange})`,
        "รายละเอียด": `ค่าเฉลี่ย = ${dim.mean.toFixed(2)} | S.D. = ${dim.sd.toFixed(2)} | คิดเป็น ${dim.percentage}% | ระดับ: ${dim.qualityLevel}`,
      });
    });

    summaryData.push({ "หัวข้อ": "", "รายละเอียด": "" });
    summaryData.push({ "หัวข้อ": "--- สถิติแจกแจงรายข้อคำถาม ---", "รายละเอียด": "" });

    stats.questions.forEach((q, idx) => {
      summaryData.push({
        "หัวข้อ": `ข้อ ${idx + 1}. [${q.dimensionTitle}] ${q.text}`,
        "รายละเอียด": `x̄ = ${q.mean.toFixed(2)} | S.D. = ${q.sd.toFixed(2)} | ${q.percentage}% | ${q.qualityLevel}`,
      });
    });

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 55 }, { wch: 60 }];

    // =========================================================================
    // SHEET 2: ข้อมูลดิบรายบุคคลทั้งหมด (Raw Data)
    // =========================================================================
    let rawRows: Record<string, any>[] = responses.map((r, idx) => {
      const row: Record<string, any> = {
        "ลำดับ": idx + 1,
        "วันที่-เวลาบันทึก": r.createdAt ? new Date(r.createdAt).toLocaleString("th-TH") : "-",
        [nameCol]: r.respondentName || "-",
      };

      // รหัสราชการ / เลขประจำตัว (แสดงเมื่อเปิดใช้งาน enableGovId เท่านั้น)
      if (qnr.enableGovId !== false) {
        row[govIdCol] = r.govId || "-";
      }

      // ประเภทตำแหน่ง และ รุ่น (แสดงเฉพาะในโครงการเดโมดั้งเดิม)
      if (isDefaultProject) {
        row["ประเภทตำแหน่ง"] = getPositionLabel(r.positionLevel);
        row["รุ่นที่"] = r.cohortId === "cohort-1" ? "รุ่นที่ 1" : (r.cohortId || "รวมทุกรุ่น");
      }

      // คำถามข้อมูลทั่วไปที่กำหนดเองใน Section 1
      if (Array.isArray(qnr.demographicCustomFields)) {
        qnr.demographicCustomFields.forEach((field) => {
          row[field.label] = r.demographicValues?.[field.id] || r.feedbackValues?.[field.id] || "-";
        });
      }

      // คะแนนรายข้อตามข้อคำถามจริงของแบบสอบถามชุดนี้
      qnr.questions.forEach((q, qIdx) => {
        const truncated = q.text.length > 25 ? q.text.substring(0, 25) + "..." : q.text;
        const qColName = `ข้อ ${qIdx + 1} (${truncated})`;
        const score = r.scores ? (r.scores[`q${q.id}`] ?? r.scores[q.id] ?? r.scores[String(q.id)] ?? "-") : "-";
        row[qColName] = score;
      });

      row["คะแนนเฉลี่ยส่วนบุคคล (x̄)"] = typeof r.scoreMean === "number" ? r.scoreMean.toFixed(2) : (r.scoreMean || "-");

      // ข้อคิดเห็นใน Section 3 ตามหัวข้อที่ตั้งไว้ในแบบสอบถามชุดนี้จริง
      if (qnr.enableSection3 !== false && feedbackItems.length > 0) {
        feedbackItems.forEach((fItem, fIdx) => {
          let commentVal = "";
          if (r.feedbackValues && r.feedbackValues[fItem.id]) {
            commentVal = r.feedbackValues[fItem.id];
          } else if (fItem.id === "strength" && r.feedbackStrength) {
            commentVal = r.feedbackStrength;
          } else if (fItem.id === "improve" && r.feedbackImprove) {
            commentVal = r.feedbackImprove;
          } else if (fItem.id === "topics" && r.feedbackTopics) {
            commentVal = r.feedbackTopics;
          } else if (fItem.id === "others" && r.feedbackOthers) {
            commentVal = r.feedbackOthers;
          }
          row[`ข้อเสนอแนะ ${fIdx + 1}: ${fItem.label}`] = commentVal || "-";
        });
      }

      return row;
    });

    // กรณีที่ยังไม่มีผู้ตอบแบบประเมิน ให้สร้างแถวโครงสร้างหัวตารางที่ถูกต้อง
    if (rawRows.length === 0) {
      const emptyRow: Record<string, any> = {
        "ลำดับ": "-",
        "วันที่-เวลาบันทึก": "-",
        [nameCol]: "(ยังไม่มีผู้ตอบแบบประเมิน)",
      };

      if (qnr.enableGovId !== false) {
        emptyRow[govIdCol] = "-";
      }

      if (isDefaultProject) {
        emptyRow["ประเภทตำแหน่ง"] = "-";
        emptyRow["รุ่นที่"] = "-";
      }

      if (Array.isArray(qnr.demographicCustomFields)) {
        qnr.demographicCustomFields.forEach((field) => {
          emptyRow[field.label] = "-";
        });
      }

      qnr.questions.forEach((q, qIdx) => {
        const truncated = q.text.length > 25 ? q.text.substring(0, 25) + "..." : q.text;
        emptyRow[`ข้อ ${qIdx + 1} (${truncated})`] = "-";
      });

      emptyRow["คะแนนเฉลี่ยส่วนบุคคล (x̄)"] = "-";

      if (qnr.enableSection3 !== false && feedbackItems.length > 0) {
        feedbackItems.forEach((fItem, fIdx) => {
          emptyRow[`ข้อเสนอแนะ ${fIdx + 1}: ${fItem.label}`] = "-";
        });
      }

      rawRows.push(emptyRow);
    }

    const rawSheet = XLSX.utils.json_to_sheet(rawRows);
    if (rawRows.length > 0) {
      const colWidths = Object.keys(rawRows[0]).map((key) => ({
        wch: Math.min(Math.max(key.length * 2, 16), 55),
      }));
      rawSheet["!cols"] = colWidths;
    }

    // =========================================================================
    // SHEET 3: ข้อเสนอแนะเชิงคุณภาพแยกรายข้อ (Qualitative Feedback)
    // =========================================================================
    const qualitativeRows: any[] = [];
    if (qnr.enableSection3 !== false && feedbackItems.length > 0) {
      feedbackItems.forEach((fItem, fIdx) => {
        let count = 0;
        responses.forEach((r) => {
          let commentVal = "";
          if (r.feedbackValues && r.feedbackValues[fItem.id]) {
            commentVal = r.feedbackValues[fItem.id];
          } else if (fItem.id === "strength" && r.feedbackStrength) {
            commentVal = r.feedbackStrength;
          } else if (fItem.id === "improve" && r.feedbackImprove) {
            commentVal = r.feedbackImprove;
          } else if (fItem.id === "topics" && r.feedbackTopics) {
            commentVal = r.feedbackTopics;
          } else if (fItem.id === "others" && r.feedbackOthers) {
            commentVal = r.feedbackOthers;
          }

          if (commentVal && commentVal.trim()) {
            count++;
            const rowItem: Record<string, any> = {
              "หัวข้อข้อเสนอแนะ": `${fIdx + 1}. ${fItem.label}`,
              "ลำดับที่": count,
              "ข้อความความคิดเห็น": commentVal.trim(),
              "ผู้ให้ความคิดเห็น": r.respondentName || "ไม่ระบุชื่อ",
            };
            if (isDefaultProject) {
              rowItem["ประเภทตำแหน่ง"] = getPositionLabel(r.positionLevel);
            }
            rowItem["วันที่ส่ง"] = r.createdAt ? new Date(r.createdAt).toLocaleString("th-TH") : "-";
            qualitativeRows.push(rowItem);
          }
        });

        if (count === 0) {
          const emptyFeedbackRow: Record<string, any> = {
            "หัวข้อข้อเสนอแนะ": `${fIdx + 1}. ${fItem.label}`,
            "ลำดับที่": "-",
            "ข้อความความคิดเห็น": "(ยังไม่มีผู้ตอบแบบประเมินในหัวข้อนี้)",
            "ผู้ให้ความคิดเห็น": "-",
          };
          if (isDefaultProject) {
            emptyFeedbackRow["ประเภทตำแหน่ง"] = "-";
          }
          emptyFeedbackRow["วันที่ส่ง"] = "-";
          qualitativeRows.push(emptyFeedbackRow);
        }
      });
    }

    const qualitativeSheet = XLSX.utils.json_to_sheet(qualitativeRows);
    if (isDefaultProject) {
      qualitativeSheet["!cols"] = [
        { wch: 35 },
        { wch: 10 },
        { wch: 60 },
        { wch: 25 },
        { wch: 25 },
        { wch: 20 },
      ];
    } else {
      qualitativeSheet["!cols"] = [
        { wch: 35 },
        { wch: 10 },
        { wch: 60 },
        { wch: 25 },
        { wch: 20 },
      ];
    }

    // สร้าง Workbook และรวมทุก Sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "สรุปผลการประเมิน");
    XLSX.utils.book_append_sheet(workbook, rawSheet, "ข้อมูลดิบรายบุคคลทั้งหมด");
    if (qnr.enableSection3 !== false && qualitativeRows.length > 0) {
      XLSX.utils.book_append_sheet(workbook, qualitativeSheet, "ข้อเสนอแนะเชิงคุณภาพ");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const safeTitle = (qnr.title || "evaluation_report").replace(/[\/\\?%*:|"<>]/g, "_").substring(0, 30);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}_${qnr.id}.xlsx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate Excel" },
      { status: 500 }
    );
  }
}
