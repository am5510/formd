import { Project, Cohort, QuestionItem, FeedbackFieldItem } from "./types";

export const DEFAULT_PROJECT: Project = {
  id: "PRJ-2567-TR048",
  code: "PRJ-2567-TR048",
  title: "โครงการพัฒนาทักษะดิจิทัลและการบริหารจัดการภาครัฐสู่ยุคปัญญาประดิษฐ์ (AI for Public Sector)",
  courseTitle: "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)",
  department: "กองยุทธศาสตร์และพัฒนาทรัพยากรบุคคล",
  venue: "ห้องประชุมจิตรลดา โรงแรมเซ็นทารา แกรนด์ฯ",
  instructors: "ดร.ธีรพงศ์ อนันตโภคิน และคณะ",
  startDate: "2024-05-15",
  endDate: "2024-05-17",
  targetAttendees: 150,
  status: "completed",
};

export const DEFAULT_COHORTS: Cohort[] = [
  {
    id: "cohort-1",
    projectId: "PRJ-2567-TR048",
    cohortNumber: 1,
    title: "รุ่นที่ 1 (15-17 พ.ค. 2567)",
    startDate: "2024-05-15",
    endDate: "2024-05-17",
  },
  {
    id: "cohort-2",
    projectId: "PRJ-2567-TR048",
    cohortNumber: 2,
    title: "รุ่นที่ 2 (22-24 พ.ค. 2567)",
    startDate: "2024-05-22",
    endDate: "2024-05-24",
  },
];

export const DIMENSIONS = [
  {
    id: 1,
    title: "2.1 ด้านเนื้อหาและหลักสูตรการฝึกอบรม",
    shortTitle: "ด้านเนื้อหาและหลักสูตร",
    range: "ข้อ 1-4",
    icon: "menu_book",
  },
  {
    id: 2,
    title: "2.2 ด้านวิทยากร",
    shortTitle: "ด้านวิทยากร",
    range: "ข้อ 5-8",
    icon: "record_voice_over",
  },
  {
    id: 3,
    title: "2.3 ด้านการจัดโครงการและการประสานงาน",
    shortTitle: "ด้านการจัดโครงการ",
    range: "ข้อ 9-12",
    icon: "manage_accounts",
  },
  {
    id: 4,
    title: "2.4 ด้านสถานที่และสิ่งอำนวยความสะดวก",
    shortTitle: "ด้านสถานที่และบริการ",
    range: "ข้อ 13-15",
    icon: "meeting_room",
  },
  {
    id: 5,
    title: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    shortTitle: "ด้านผลสัมฤทธิ์และความคุ้มค่า",
    range: "ข้อ 16-20",
    icon: "trending_up",
  },
];

export const EVALUATION_QUESTIONS: QuestionItem[] = [
  // ด้านที่ 1 (1-4)
  {
    id: 1,
    dimensionId: 1,
    dimensionTitle: "2.1 ด้านเนื้อหาและหลักสูตรการฝึกอบรม",
    text: "เนื้อหาวิชาตรงตามวัตถุประสงค์และเป้าหมายของโครงการ",
  },
  {
    id: 2,
    dimensionId: 1,
    dimensionTitle: "2.1 ด้านเนื้อหาและหลักสูตรการฝึกอบรม",
    text: "เนื้อหามีความทันสมัย สอดคล้องกับบริบทเทคโนโลยีและปัญญาประดิษฐ์",
  },
  {
    id: 3,
    dimensionId: 1,
    dimensionTitle: "2.1 ด้านเนื้อหาและหลักสูตรการฝึกอบรม",
    text: "เนื้อหาสามารถนำไปประยุกต์ใช้ในการปฏิบัติงานราชการได้จริง",
  },
  {
    id: 4,
    dimensionId: 1,
    dimensionTitle: "2.1 ด้านเนื้อหาและหลักสูตรการฝึกอบรม",
    text: "การจัดสรรระยะเวลาในการอบรมแต่ละหัวข้อมีความเหมาะสม",
  },
  // ด้านที่ 2 (5-8)
  {
    id: 5,
    dimensionId: 2,
    dimensionTitle: "2.2 ด้านวิทยากร",
    text: "วิทยากรมีความรู้ความเชี่ยวชาญและความน่าเชื่อถือในหัวข้อที่บรรยาย",
  },
  {
    id: 6,
    dimensionId: 2,
    dimensionTitle: "2.2 ด้านวิทยากร",
    text: "ความสามารถและเทคนิคการถ่ายทอดให้เข้าใจง่าย ชัดเจน น่าติดตาม",
  },
  {
    id: 7,
    dimensionId: 2,
    dimensionTitle: "2.2 ด้านวิทยากร",
    text: "การเปิดโอกาสให้ซักถาม แลกเปลี่ยนความคิดเห็น และให้คำแนะนำ",
  },
  {
    id: 8,
    dimensionId: 2,
    dimensionTitle: "2.2 ด้านวิทยากร",
    text: "การใช้สื่อ นวัตกรรมตัวอย่าง และเทคนิคการสอนเชิงปฏิบัติการ (Workshop)",
  },
  // ด้านที่ 3 (9-12)
  {
    id: 9,
    dimensionId: 3,
    dimensionTitle: "2.3 ด้านการจัดโครงการและการประสานงาน",
    text: "การประชาสัมพันธ์และการแจ้งข้อมูลข่าวสารโครงการล่วงหน้าอย่างชัดเจน",
  },
  {
    id: 10,
    dimensionId: 3,
    dimensionTitle: "2.3 ด้านการจัดโครงการและการประสานงาน",
    text: "ขั้นตอนการลงทะเบียนและการอำนวยความสะดวกของเจ้าหน้าที่ผู้จัด",
  },
  {
    id: 11,
    dimensionId: 3,
    dimensionTitle: "2.3 ด้านการจัดโครงการและการประสานงาน",
    text: "การดำเนินโครงการเป็นไปตามลำดับขั้นตอนและเวลาที่กำหนดอย่างเป็นระบบ",
  },
  {
    id: 12,
    dimensionId: 3,
    dimensionTitle: "2.3 ด้านการจัดโครงการและการประสานงาน",
    text: "เอกสารประกอบการฝึกอบรม (ทั้งไฟล์ดิจิทัลและคู่มือ) มีประโยชน์ครบถ้วน",
  },
  // ด้านที่ 4 (13-15)
  {
    id: 13,
    dimensionId: 4,
    dimensionTitle: "2.4 ด้านสถานที่และสิ่งอำนวยความสะดวก",
    text: "ความเหมาะสมของห้องอบรม ขนาดพื้นที่ บรรยากาศ แสงสว่าง และการเดินทาง",
  },
  {
    id: 14,
    dimensionId: 4,
    dimensionTitle: "2.4 ด้านสถานที่และสิ่งอำนวยความสะดวก",
    text: "ความพร้อมของอุปกรณ์โสตทัศนูปกรณ์ สัญญาณอินเทอร์เน็ตความเร็วสูง และปลั๊กไฟ",
  },
  {
    id: 15,
    dimensionId: 4,
    dimensionTitle: "2.4 ด้านสถานที่และสิ่งอำนวยความสะดวก",
    text: "คุณภาพอาหาร อาหารว่าง เครื่องดื่ม และความสะอาดของจุดบริการ",
  },
  // ด้านที่ 5 (16-20)
  {
    id: 16,
    dimensionId: 5,
    dimensionTitle: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    text: "ได้รับความรู้ความเข้าใจและทักษะดิจิทัลเพิ่มขึ้นจากเดิมอย่างชัดเจน",
  },
  {
    id: 17,
    dimensionId: 5,
    dimensionTitle: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    text: "มีความมั่นใจในการนำเครื่องมือและปัญญาประดิษฐ์ไปปรับปรุงงานในหน่วยงาน",
  },
  {
    id: 18,
    dimensionId: 5,
    dimensionTitle: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    text: "การอบรมครั้งนี้บรรลุตามวัตถุประสงค์และตัวชี้วัดที่กำหนดไว้ในโครงการ",
  },
  {
    id: 19,
    dimensionId: 5,
    dimensionTitle: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    text: "ระดับความพึงพอใจในภาพรวมต่อการเข้าร่วมโครงการฝึกอบรมครั้งนี้",
  },
  {
    id: 20,
    dimensionId: 5,
    dimensionTitle: "2.5 ด้านผลสัมฤทธิ์และความคุ้มค่า",
    text: "โครงการนี้มีประโยชน์ต่อการพัฒนาองค์กรและเห็นควรให้จัดต่อเนื่องในรุ่นต่อไป",
  },
];

export const POSITION_OPTIONS = [
  { value: "1", label: "ประเภทวิชาการ (ปฏิบัติการ / ชำนาญการ / ชำนาญการพิเศษ)" },
  { value: "2", label: "ประเภททั่วไป (ปฏิบัติงาน / ชำนาญงาน / อาวุโส)" },
  { value: "3", label: "ประเภทอำนวยการ / บริหารระดับต้น-สูง" },
  { value: "4", label: "พนักงานราชการ / เจ้าหน้าที่องค์กรของรัฐ" },
  { value: "5", label: "บุคลากรภาคเอกชน / ผู้สังเกตการณ์อิสระ" },
];

export const DEFAULT_SECTION1_TITLE = "ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบประเมิน";
export const DEFAULT_RESPONDENT_NAME_LABEL = "ชื่อ – นามสกุล";
export const DEFAULT_RESPONDENT_NAME_PLACEHOLDER = "";
export const DEFAULT_GOV_ID_LABEL = "รหัสราชการ (ถ้ามี)";
export const DEFAULT_GOV_ID_PLACEHOLDER = "";

export const DEFAULT_SECTION3_TITLE =
  "ส่วนที่ 3 ข้อเสนอแนะเพิ่มเติม (Qualitative Feedback)";

export const DEFAULT_FEEDBACK_ITEMS: FeedbackFieldItem[] = [
  {
    id: "strength",
    label: "สิ่งที่ท่านประทับใจหรือเห็นว่าเป็นจุดเด่นของโครงการ",
    placeholder: "",
  },
  {
    id: "improve",
    label: "สิ่งที่ควรปรับปรุงในการจัดโครงการครั้งต่อไป",
    placeholder: "",
  },
  {
    id: "topics",
    label: "หัวข้อการฝึกอบรมที่ท่านสนใจในอนาคต",
    placeholder: "",
  },
  {
    id: "others",
    label: "ข้อเสนอแนะอื่น ๆ",
    placeholder: "",
  },
];

export const DEFAULT_SECTION4_TITLE = "ส่วนที่ 4 แนบเอกสารและรูปภาพ";
export const DEFAULT_SECTION4_DESCRIPTION =
  "แนบหลักฐานการเข้าร่วม ใบเสร็จ หรือภาพถ่ายกิจกรรม (เป็นข้อมูลทางเลือก)";
export const DEFAULT_SECTION4_LABEL = "ลิงก์หลักฐานหรือเอกสารเพิ่มเติม";
export const DEFAULT_SECTION4_HELPER_TEXT = "";
