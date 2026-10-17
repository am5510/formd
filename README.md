# ระบบประเมินโครงการฝึกอบรมและแดชบอร์ดสรุปผล (GovPulse Analytics)

เว็บแอปพลิเคชัน Full-Stack พัฒนาด้วย **Next.js (App Router)** สำหรับจัดการและประเมินผลโครงการฝึกอบรมของภาครัฐและองค์กร เชื่อมต่อฐานข้อมูล **Cloudflare D1 (Serverless SQLite)** และจัดเก็บเอกสาร/รูปภาพบน **Cloudflare R2** โดยออกแบบตามมาตรฐานการประเมินโครงการ 5 ด้านของสำนักงาน ก.พ.ร.

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
- **Database:** Cloudflare D1 Serverless SQLite (Binding: `env.DB`)
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

### 3. รัน Simulation Cloudflare Workers ในเครื่อง
```bash
npm run preview:cloudflare
```

---

## ⚙️ การตั้งค่าการเชื่อมต่อ (Environment Configuration)

### 1. เชื่อมต่อ Cloudflare D1
ตั้งค่าผูก Binding `DB` ใน `wrangler.jsonc` (Database ID: `0e4e03a8-9cb7-4f96-9db5-86702ec91206`)
รันสร้างตารางหรือ migrate:
```bash
npm run d1:migrate:remote
```

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
│       │   ├── d1.ts              # Client เชื่อมต่อ Cloudflare D1 Database
│       │   ├── schema.sql         # สคริปต์ SQL DDL สร้างตารางใน Cloudflare D1
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

---

## 🚀 การ Deploy ไปยัง Vercel (Deployment Guide)

โครงการนี้สร้างด้วย Next.js 14 App Router สามารถ Deploy ขึ้น **Vercel** ได้ทันทีโดยไม่ต้องตั้งค่า Build ซับซ้อน

### วิธีที่ 1: Deploy ผ่าน GitHub (แนะนำที่สุด)
1. Push โค้ดขึ้น GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```
2. เข้าไปที่ [Vercel Dashboard](https://vercel.com/new)
3. เลือก **Import** Repository `formd` (หรือ GitHub repo ของคุณ)
4. ตั้งค่า **Framework Preset:** `Next.js` (Vercel จะตรวจจับให้อัตโนมัติ)
5. ในส่วน **Environment Variables** ให้เพิ่มตัวแปรต่อไปนี้:
   - `DATABASE_URL`: Connection string จาก Neon PostgreSQL (ขึ้นต้นด้วย `postgresql://...`)
   - `CLOUDFLARE_R2_ACCOUNT_ID`: Cloudflare Account ID
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`: Cloudflare R2 Access Key
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Cloudflare R2 Secret Access Key
   - `CLOUDFLARE_R2_BUCKET_NAME`: เช่น `training-form-r2`
   - `CLOUDFLARE_R2_PUBLIC_URL`: URL สาธารณะของ R2 เช่น `https://pub-xxx.r2.dev`
6. กดปุ่ม **Deploy** แล้วรอประมาณ 1 นาที ระบบจะสร้าง Production URL พร้อมใช้งานทันที

### วิธีที่ 2: Deploy ผ่าน Vercel CLI
```bash
# ติดตั้ง Vercel CLI และ Deploy
npx vercel
# เมื่อพร้อมขึ้น Production
npx vercel --prod
```

---

## ☁️ การ Deploy ไปยัง Cloudflare (Workers/Pages + D1 Database)

โครงการนี้รองรับการ Deploy บน Cloudflare แบบ Full-Stack ร่วมกับ **Cloudflare D1** (Database ID: `0e4e03a8-9cb7-4f96-9db5-86702ec91206`) และ **Cloudflare R2**

### 1. รันสร้างตารางใน Cloudflare D1 (Database ID: `0e4e03a8-9cb7-4f96-9db5-86702ec91206`)
สามารถรันผ่าน Wrangler CLI (หรือนำ SQL ใน `src/lib/db/schema.d1.sql` ไปรันในหน้า Cloudflare Console):
```bash
# ล็อกอิน Wrangler ก่อนในเครื่อง
npx wrangler login

# รันสร้างตารางไปยัง Remote D1 Database
npm run d1:migrate:remote
```

### 2. ทดสอบรัน Local Dev บน Cloudflare Simulation
```bash
npm run preview:cloudflare
```

### 3. สั่ง Deploy ขึ้น Cloudflare Workers
```bash
npm run deploy:cloudflare
```


