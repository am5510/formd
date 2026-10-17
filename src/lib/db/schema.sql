-- ==============================================================================
-- สคริปต์สร้างฐานข้อมูลสำหรับ NEON POSTGRESQL (SCHEMA DDL)
-- โครงการ: ระบบประเมินโครงการฝึกอบรมภาครัฐและแดชบอร์ดสรุปผล (GovPulse Analytics)
-- ==============================================================================

-- ตารางที่ 1: ข้อมูลโครงการฝึกอบรม
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

-- ตารางที่ 2: รุ่นของการฝึกอบรม (Cohorts / Rounds)
CREATE TABLE IF NOT EXISTS cohorts (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    cohort_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    venue VARCHAR(255),
    max_attendees INT DEFAULT 75,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 3: แบบประเมินความพึงพอใจรายบุคคล (20 ข้อ + ข้อมูลทั่วไป + ข้อเสนอแนะ)
CREATE TABLE IF NOT EXISTS evaluation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    cohort_id VARCHAR(64) REFERENCES cohorts(id) ON DELETE SET NULL,
    respondent_name VARCHAR(255) NOT NULL,
    gov_id VARCHAR(64),
    position_level VARCHAR(32),
    department_name VARCHAR(255),
    
    -- คะแนนการประเมิน 20 ข้อ (สเกล 1-5)
    -- มิติที่ 1: ด้านเนื้อหาและหลักสูตร (ข้อ 1-4)
    q1 SMALLINT CHECK (q1 BETWEEN 1 AND 5),
    q2 SMALLINT CHECK (q2 BETWEEN 1 AND 5),
    q3 SMALLINT CHECK (q3 BETWEEN 1 AND 5),
    q4 SMALLINT CHECK (q4 BETWEEN 1 AND 5),
    
    -- มิติที่ 2: ด้านวิทยากร (ข้อ 5-8)
    q5 SMALLINT CHECK (q5 BETWEEN 1 AND 5),
    q6 SMALLINT CHECK (q6 BETWEEN 1 AND 5),
    q7 SMALLINT CHECK (q7 BETWEEN 1 AND 5),
    q8 SMALLINT CHECK (q8 BETWEEN 1 AND 5),
    
    -- มิติที่ 3: ด้านการจัดโครงการ (ข้อ 9-12)
    q9 SMALLINT CHECK (q9 BETWEEN 1 AND 5),
    q10 SMALLINT CHECK (q10 BETWEEN 1 AND 5),
    q11 SMALLINT CHECK (q11 BETWEEN 1 AND 5),
    q12 SMALLINT CHECK (q12 BETWEEN 1 AND 5),
    
    -- มิติที่ 4: ด้านสถานที่และสิ่งอำนวยความสะดวก (ข้อ 13-15)
    q13 SMALLINT CHECK (q13 BETWEEN 1 AND 5),
    q14 SMALLINT CHECK (q14 BETWEEN 1 AND 5),
    q15 SMALLINT CHECK (q15 BETWEEN 1 AND 5),
    
    -- มิติที่ 5: ด้านผลสัมฤทธิ์และความคุ้มค่า (ข้อ 16-20)
    q16 SMALLINT CHECK (q16 BETWEEN 1 AND 5),
    q17 SMALLINT CHECK (q17 BETWEEN 1 AND 5),
    q18 SMALLINT CHECK (q18 BETWEEN 1 AND 5),
    q19 SMALLINT CHECK (q19 BETWEEN 1 AND 5),
    q20 SMALLINT CHECK (q20 BETWEEN 1 AND 5),
    
    -- ค่าสถิติคำนวณเบื้องต้น
    score_mean NUMERIC(4, 2),
    
    -- ข้อเสนอแนะเชิงคุณภาพ 4 ข้อ
    feedback_strength TEXT,
    feedback_improve TEXT,
    feedback_topics TEXT,
    feedback_others TEXT,
    
    is_draft BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ตารางที่ 4: เอกสารและรูปภาพที่จัดเก็บบน Cloudflare R2
CREATE TABLE IF NOT EXISTS media_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    response_id UUID REFERENCES evaluation_responses(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    r2_key VARCHAR(512) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(128),
    file_size BIGINT,
    category VARCHAR(64) DEFAULT 'document', -- 'document', 'speaker', 'gallery', 'certificate', 'report'
    uploaded_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Indexes เพื่อความรวดเร็วในการ Query แดชบอร์ด
CREATE INDEX IF NOT EXISTS idx_responses_project_id ON evaluation_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_responses_cohort_id ON evaluation_responses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_media_project_id ON media_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_attachments(category);

-- ข้อมูลตั้งต้นสำหรับโครงการหลัก
INSERT INTO projects (id, code, title, department, venue, instructors, start_date, end_date, target_attendees, status)
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
) ON CONFLICT (id) DO NOTHING;

INSERT INTO cohorts (id, project_id, cohort_number, title, start_date, end_date, venue, max_attendees)
VALUES 
    ('cohort-1', 'PRJ-2567-TR048', 1, 'รุ่นที่ 1 (15-17 พ.ค. 2567)', '2024-05-15', '2024-05-17', 'ห้องประชุมจิตรลดา', 75),
    ('cohort-2', 'PRJ-2567-TR048', 2, 'รุ่นที่ 2 (22-24 พ.ค. 2567)', '2024-05-22', '2024-05-24', 'ห้องประชุมจิตรลดา', 75)
ON CONFLICT (id) DO NOTHING;
