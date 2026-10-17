import { EvaluationResponseRecord } from "../types";

/**
 * ฟังก์ชันสร้างข้อมูลจำลอง 148 รายการที่ตรงกับค่าเฉลี่ยสถิติในรายงาน _1/code.html
 * (คะแนนเฉลี่ยรวม 4.68, ส่วนเบี่ยงเบนมาตรฐาน 0.42)
 */
export function generateMockResponses(): EvaluationResponseRecord[] {
  const responses: EvaluationResponseRecord[] = [];
  const total = 148;

  // เป้าหมายคะแนนเฉลี่ยแต่ละข้อตามที่ปรากฏใน HTML ของ _1/code.html
  const targetMeans: Record<string, number> = {
    q1: 4.68,
    q2: 4.71,
    q3: 4.59,
    q4: 4.50,
    q5: 4.88,
    q6: 4.82,
    q7: 4.76,
    q8: 4.78,
    q9: 4.60,
    q10: 4.64,
    q11: 4.52,
    q12: 4.56,
    q13: 4.62,
    q14: 4.67,
    q15: 4.66,
    q16: 4.75,
    q17: 4.72,
    q18: 4.76,
    q19: 4.78,
    q20: 4.70,
  };

  const sampleNames = [
    "นายสมศักดิ์ ภักดีชน",
    "นางสาวนภาพร สุขสมบูรณ์",
    "นายเกียรติศักดิ์ อุดมผล",
    "นางสาววรรณภา มงคลกุล",
    "นายธีระเดช พัฒนศิลป์",
    "นางกาญจนา จิตจำนงค์",
    "นายพิชิตชัย วงศ์สุวรรณ",
    "นางสาวศิริพร บุญเจริญ",
    "นายณัฐวุฒิ สิทธิชัย",
    "นางสาวพิมลวรรณ เจริญสุข",
    "นายอัครเดช รัตนพาณิชย์",
    "นางสาวศุภวรรณ วิเชียรศรี",
  ];

  const positions = ["1", "2", "3", "4", "5"];

  for (let i = 0; i < total; i++) {
    const scores: Record<string, number> = {};
    let scoreSum = 0;

    for (let q = 1; q <= 20; q++) {
      const key = `q${q}`;
      const target = targetMeans[key] || 4.7;
      // สุ่มโดยถ่วงน้ำหนักตาม targetMean
      const prob5 = (target - 4.0) * 0.9;
      const rand = Math.random();
      let val = 5;
      if (rand < 1 - prob5) {
        val = Math.random() < 0.85 ? 4 : 3;
      }
      scores[key] = val;
      scoreSum += val;
    }

    const cohortId = i < 74 ? "cohort-1" : "cohort-2";
    const name = sampleNames[i % sampleNames.length] + ` (ลำดับที่ ${i + 1})`;

    responses.push({
      id: `resp-${i + 1}`,
      projectId: "PRJ-2567-TR048",
      cohortId,
      respondentName: name,
      govId: `9-1002-${String(i + 1).padStart(5, "0")}-01-2`,
      positionLevel: positions[i % positions.length],
      scores,
      scoreMean: Number((scoreSum / 20).toFixed(2)),
      feedbackStrength:
        i % 4 === 0
          ? "วิทยากรถ่ายทอดได้เข้าใจง่าย มีตัวอย่างการประยุกต์ใช้ AI ในงานสารบรรณภาครัฐที่ชัดเจนมาก"
          : i % 4 === 1
          ? "Workshop ปฏิบัติการเข้มข้น ได้ลองสั่งการ prompt ด้วยตนเองจริง"
          : undefined,
      feedbackImprove:
        i % 5 === 0
          ? "อยากให้ขยายเวลาในการฝึกปฏิบัติเพิ่มเติม หรือแบ่งหลักสูตรออกเป็นระดับเบื้องต้นและระดับสูง"
          : undefined,
      feedbackTopics:
        i % 3 === 0
          ? "Advanced Data Analytics สำหรับนักบริหาร และ Generative AI ในงานกฎหมายภาครัฐ"
          : undefined,
      feedbackOthers:
        i % 6 === 0
          ? "สถานที่อบรมและอาหารว่างจัดเตรียมได้ดีเยี่ยม ขอขอบคุณทีมงานผู้จัดทุกท่าน"
          : undefined,
      isDraft: false,
      createdAt: new Date(Date.now() - (total - i) * 3600 * 1000).toISOString(),
    });
  }

  return responses;
}

export const INITIAL_MOCK_RESPONSES = generateMockResponses();
