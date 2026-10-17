# ระบบประเมินโครงการฝึกอบรมและแดชบอร์ดสรุปผล (GovPulse Analytics)

เว็บแอปพลิเคชัน Full-Stack พัฒนาด้วย **Next.js (App Router)** สำหรับจัดการและประเมินผลโครงการฝึกอบรมของภาครัฐและองค์กร เชื่อมต่อฐานข้อมูล **Neon Serverless PostgreSQL** และจัดเก็บเอกสาร/รูปภาพบน **Cloudflare R2** โดยออกแบบตามมาตรฐานการประเมินโครงการ 5 ด้านของสำนักงาน ก.พ.ร.

---

## 🌟 คุณสมบัติเด่นของระบบ (Core Features)

1. **แบบประเมินความพึงพอใจ 20 ข้อ (Evaluation Form):**
   - คำถามครอบคลุม 5 มิติหลักตามระเบียบแบบแผนราชการ
   - ระบบสเกลลิเคิร์ต 5 ระดับ (Likert 1–5 Scale) พร้อมเกณฑ์แปลผลชัดเจน
   - แถบแสดงความคืบหน้าแบบ Real-time (`0 / 20 ข้อ (0%)`)
   - รองรับการบันทึกแบบร่าง (Draft Saving) และส่งข้อมูลแบบเป็นทางการ
   - รองรับการแนบไฟล์เอกสารและรูปภาพประกอบไปยัง Cloudflare R2

2. **แดชบอร์ดสรุปผลสถิติผู้บริหาร (Executive Analytics Dashboard):**
   - คำนวณค่าสถิติเชิงลึกอัตโนมัติ: ค่าเฉลี่ยเลขคณิต (\(\bar{x}\)), ส่วนเบี่ยงเบนมาตรฐาน (S.D.), ร้อยละ (%)
   - 4 KPI Metric Cards: จำนวนผู้ตอบแบบประเมิน (Response Rate), คะแนนเฉลี่ยรวม, ดัชนี ROI ผลสัมฤทธิ์นำไปใช้งาน, อัตราต้องการให้จัดต่อเนื่อง
   - สรุปเปรียบเทียบคะแนน 5 มิติหลัก พร้อมแถบความก้าวหน้าและการจัดลำดับอันดับที่ 1
   - ตารางแจกแจงสถิติละเอียดครบทั้ง 20 ข้อ พร้อมระบบค้นหาและเรียงลำดับคะแนน
   - สรุปข้อเสนอแนะเชิงคุณภาพ (Qualitative Feedback) ในรูปแบบ Bento Grid 4 ด้าน
   - ปุ่มส่งออกรายงานเป็น **Excel (.xlsx)** และ **PDF ฉบับสมบูรณ์ (Print Ready)**

3. **คลังเอกสารและรูปภาพกิจกรรม (Cloudflare R2 Storage):**
   - จัดเก็บคู่มือการอบรม, แผนหลักสูตร (PDF), ภาพถ่ายวิทยากร และภาพบรรยากาศ Workshop
   - ใช้ AWS S3 SDK ทำงานร่วมกับ Cloudflare R2 ปลอดค่า Egress Bandwidth
   - รองรับการสร้าง Presigned URL เพื่ออัปโหลดไฟล์โดยตรงจาก Browser

---

## 🏗️ โครงสร้างเทคโนโลยี (Tech Stack)

- **Framework:** Next.js 14+ (App Router, Server Actions, Route Handlers)
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Material Symbols
- **Typography:** ฟอนต์ Sarabun และ Be Vietnam Pro (คมชัด รองรับวรรณยุกต์ภาษาไทย)
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Object Storage:** Cloudflare R2 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **Exporting:** SheetJS (`xlsx`) สำหรับการสร้างไฟล์ Excel แบบไดนามิก

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันระบบในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

### 3. สร้าง Production Build
```bash
npm run build
npm start
```

---

## ⚙️ การตั้งค่าการเชื่อมต่อ (Environment Configuration)

คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:
```bash
cp .env.example .env.local
```

### 1. เชื่อมต่อ Neon Database (PostgreSQL)
1. สมัครใช้งานที่ [https://neon.tech](https://neon.tech)
2. สร้าง Project และ Database ใหม่
3. เข้าไปที่เมนู **SQL Editor** บน Neon Console แล้วนำสคริปต์จากไฟล์ `src/lib/db/schema.sql` ไปวางเพื่อสร้างตารางทั้งหมด
4. คัดลอก Connection String มาวางใน `.env.local`:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

> **หมายเหตุ:** หากยังไม่ได้ใส่ `DATABASE_URL` ระบบจะทำงานในโหมดจำลอง (In-Memory Fallback) โดยใช้ชุดข้อมูล 148 ผู้ตอบตามต้นแบบทันที ทำให้สามารถทดสอบและพรีวิวหน้าเว็บได้ทันทีโดยไม่เกิด Error

### 2. เชื่อมต่อ Cloudflare R2
1. เข้าไปที่ Cloudflare Dashboard: [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. ไปที่เมนู **R2 Object Storage** > สร้าง Bucket ชื่อ `training-form-r2`
3. ไปที่ **Manage R2 API Tokens** > สร้าง Token สิทธิ์ `Object Read & Write`
4. นำค่ามากรอกใน `.env.local`:
```env
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="training-form-r2"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxxxx.r2.dev"
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
training_form/
├── src/
│   ├── app/
│   │   ├── page.tsx               # หน้าแรก Portal ทางลัดสู่เมนูต่างๆ
│   │   ├── layout.tsx             # Shell หลัก ฟอนต์ Sarabun + Be Vietnam Pro
│   │   ├── globals.css            # สไตล์ระบบและการปรับแต่งหน้าพิมพ์ PDF
│   │   ├── form/page.tsx          # แบบประเมินความพึงพอใจ 20 ข้อ
│   │   ├── dashboard/page.tsx     # แดชบอร์ดสรุปผลสถิติ 5 มิติ
│   │   ├── documents/page.tsx     # หน้าระบบจัดการคลังเอกสาร & ภาพบน R2
│   │   └── api/
│   │       ├── evaluations/       # API บันทึกและดึงข้อมูลแบบประเมิน
│   │       ├── dashboard/         # API คำนวณสถิติ x̄, S.D., ก.พ.ร.
│   │       ├── export/excel/      # API สร้างไฟล์ Excel .xlsx 2 แผ่นงาน
│   │       └── r2/
│   │           ├── presign/       # API สร้าง Direct Upload URL ไปยัง R2
│   │           ├── upload/        # API อัปโหลดไฟล์ผ่าน Server
│   │           └── files/         # API รายการไฟล์และลบไฟล์บน R2
│   ├── components/
│   │   ├── Navigation.tsx         # แถบเมนูด้านบน
│   │   ├── Footer.tsx             # ส่วนท้ายมาตรฐานราชการ
│   │   └── FileUploader.tsx       # คอมโพเนนต์อัปโหลดไฟล์ขึ้น R2
│   └── lib/
│       ├── constants.ts           # รายการ 20 ข้อคำถาม, 5 มิติ, ข้อมูลโครงการ
│       ├── stats.ts               # ฟังก์ชันคำนวณสถิติ Mean, S.D., ร้อยละ, การแปลผล
│       ├── types.ts               # TypeScript Interfaces
│       ├── db/
│       │   ├── neon.ts            # Client เชื่อมต่อ Neon Database
│       │   ├── schema.sql         # สคริปต์ SQL DDL สร้างตารางใน Neon
│       │   └── mockData.ts        # ข้อมูลจำลอง 148 รายการตรงตามรายงานต้นแบบ
│       └── r2/
│           └── client.ts          # AWS S3 Client สำหรับ Cloudflare R2
├── .env.example                   # ตัวอย่างการตั้งค่า Environment Variables
├── package.json
└── tailwind.config.ts             # Palette สี GovPulse Analytics จาก DESIGN.md
```

---

## 📊 มิติการประเมิน 5 ด้านตามเกณฑ์มาตรฐาน

| ลำดับ | มิติการประเมิน | ช่วงข้อคำถาม | ไอคอน |
| :---: | :--- | :---: | :---: |
| 1 | ด้านเนื้อหาและหลักสูตรการฝึกอบรม | ข้อ 1 – 4 | `menu_book` |
| 2 | ด้านวิทยากร (อันดับที่ 1) | ข้อ 5 – 8 | `record_voice_over` |
| 3 | ด้านการจัดโครงการและการประสานงาน | ข้อ 9 – 12 | `manage_accounts` |
| 4 | ด้านสถานที่และสิ่งอำนวยความสะดวก | ข้อ 13 – 15 | `meeting_room` |
| 5 | ด้านผลสัมฤทธิ์และความคุ้มค่า (ROI) | ข้อ 16 – 20 | `trending_up` |
