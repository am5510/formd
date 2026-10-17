-- ==============================================================================
-- สคริปต์สร้างฐานข้อมูลสำหรับ CLOUDFLARE D1 (SQLITE SCHEMA DDL)
-- โครงการ: ระบบประเมินโครงการฝึกอบรมภาครัฐและแดชบอร์ดสรุปผล (GovPulse Analytics)
-- ==============================================================================

-- ตารางที่ 1: ข้อมูลโครงการฝึกอบรม
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    course_title TEXT,
    department TEXT NOT NULL,
    venue TEXT,
    instructors TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    target_attendees INTEGER DEFAULT 150,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 2: รุ่นของการฝึกอบรม (Cohorts / Rounds)
CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    cohort_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    venue TEXT,
    max_attendees INTEGER DEFAULT 75,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 3: แบบสอบถาม/เทมเพลตแบบประเมิน (Questionnaires)
CREATE TABLE IF NOT EXISTS questionnaires (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course_title TEXT NOT NULL,
    instructors TEXT NOT NULL,
    department TEXT NOT NULL,
    date_display TEXT NOT NULL,
    venue TEXT NOT NULL,
    questions TEXT NOT NULL,           -- เก็บ JSON เป็น String
    extra_config TEXT DEFAULT '{}',    -- เก็บ JSON เป็น String
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 4: ข้อคำถามแบบประเมิน
CREATE TABLE IF NOT EXISTS evaluation_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT DEFAULT 'PRJ-2567-TR048',
    dimension_id INTEGER NOT NULL,
    dimension_title TEXT NOT NULL,
    text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 5: แบบประเมินความพึงพอใจรายบุคคล (20 ข้อ + ข้อมูลทั่วไป + ข้อเสนอแนะ)
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    cohort_id TEXT,
    respondent_name TEXT NOT NULL,
    gov_id TEXT,
    position_level TEXT,
    department_name TEXT,
    
    -- คะแนนการประเมิน 20 ข้อ (สเกล 1-5)
    q1 INTEGER CHECK (q1 BETWEEN 1 AND 5),
    q2 INTEGER CHECK (q2 BETWEEN 1 AND 5),
    q3 INTEGER CHECK (q3 BETWEEN 1 AND 5),
    q4 INTEGER CHECK (q4 BETWEEN 1 AND 5),
    q5 INTEGER CHECK (q5 BETWEEN 1 AND 5),
    q6 INTEGER CHECK (q6 BETWEEN 1 AND 5),
    q7 INTEGER CHECK (q7 BETWEEN 1 AND 5),
    q8 INTEGER CHECK (q8 BETWEEN 1 AND 5),
    q9 INTEGER CHECK (q9 BETWEEN 1 AND 5),
    q10 INTEGER CHECK (q10 BETWEEN 1 AND 5),
    q11 INTEGER CHECK (q11 BETWEEN 1 AND 5),
    q12 INTEGER CHECK (q12 BETWEEN 1 AND 5),
    q13 INTEGER CHECK (q13 BETWEEN 1 AND 5),
    q14 INTEGER CHECK (q14 BETWEEN 1 AND 5),
    q15 INTEGER CHECK (q15 BETWEEN 1 AND 5),
    q16 INTEGER CHECK (q16 BETWEEN 1 AND 5),
    q17 INTEGER CHECK (q17 BETWEEN 1 AND 5),
    q18 INTEGER CHECK (q18 BETWEEN 1 AND 5),
    q19 INTEGER CHECK (q19 BETWEEN 1 AND 5),
    q20 INTEGER CHECK (q20 BETWEEN 1 AND 5),
    
    score_mean REAL,
    feedback_strength TEXT,
    feedback_improve TEXT,
    feedback_topics TEXT,
    feedback_others TEXT,
    feedback_data TEXT,                -- เก็บ JSON demographic & dynamic answers
    is_draft INTEGER DEFAULT 0,        -- 0 = false, 1 = true ใน SQLite
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 6: ข้อมูลไฟล์แนบ (Cloudflare R2 Metadata)
CREATE TABLE IF NOT EXISTS media_attachments (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    response_id TEXT,
    file_name TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT DEFAULT 'document',
    uploaded_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ดัชนีเพื่อเพิ่มประสิทธิภาพการค้นหา (Indexes)
CREATE INDEX IF NOT EXISTS idx_responses_project_id ON evaluation_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_responses_cohort_id ON evaluation_responses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_media_project_id ON media_attachments(project_id);

-- ข้อมูลตั้งต้นสำหรับโครงการหลัก
INSERT OR IGNORE INTO projects (id, code, title, department, venue, instructors, start_date, end_date, target_attendees, status)
VALUES (
    'PRJ-2567-TR048',
    'PRJ-2567-TR048',
    'โครงการพัฒนาทักษะดิจิทัลและการบริหารจัดการภาครัฐสู่ยุคปัญญาประดิษฐ์ (AI for Public Sector)',
    'กองยุทธศาสตร์และพัฒนาทรัพยากรบุคคล',
    'ห้องประชุมจิตรลดา โรงแรมเซ็นทารา แกรนด์ กรุงเทพฯ',
    'ดร.ธีรพงศ์ อนันตโภคิน และคณะ',
    '2024-05-15',
    '2024-05-17',
    150,
    'completed'
);

INSERT OR IGNORE INTO cohorts (id, project_id, cohort_number, title, start_date, end_date, venue, max_attendees)
VALUES 
    ('cohort-1', 'PRJ-2567-TR048', 1, 'รุ่นที่ 1 (15-17 พ.ค. 2567)', '2024-05-15', '2024-05-17', 'ห้องประชุมจิตรลดา', 75),
    ('cohort-2', 'PRJ-2567-TR048', 2, 'รุ่นที่ 2 (22-24 พ.ค. 2567)', '2024-05-22', '2024-05-24', 'ห้องประชุมจิตรลดา', 75);
