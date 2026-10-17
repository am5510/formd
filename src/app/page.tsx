import Link from "next/link";
import { FileText, ArrowRight, FileEdit } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 2 Main Portal Navigation Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1: Form (คลิกเพื่อเปิดหน้ารวมแบบสอบถามทั้งหมด) */}
        <Link
          href="/form"
          className="bg-surface-container-lowest border border-outline-variant hover:border-secondary rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase block w-fit mb-2">
              สำหรับผู้เข้าอบรม
            </span>
            <h2 className="text-lg font-bold text-primary mb-1.5">
              แบบประเมินความพึงพอใจ
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              หน้ารวมแบบสอบถามออนไลน์ทั้งหมดสำหรับผู้เข้าอบรมเลือกทำแบบประเมิน
            </p>
          </div>

          <div className="w-full py-2.5 px-4 rounded-xl bg-primary group-hover:bg-[#991b1b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs">
            <span>เปิดหน้าแบบประเมิน</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 2: Admin Builder */}
        <div className="bg-surface-container-lowest border-2 border-secondary/40 hover:border-secondary rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative">
          <span className="absolute -top-3 right-4 bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            แอดมินสร้างเอง
          </span>

          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-white flex items-center justify-center mb-4">
              <FileEdit className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-secondary bg-red-50 px-2.5 py-0.5 rounded border border-red-200 uppercase block w-fit mb-2">
              Admin Portal
            </span>
            <h2 className="text-lg font-bold text-primary mb-1.5">
              สร้าง & จัดการแบบสอบถาม
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              แอดมินสามารถสร้าง เพิ่ม แก้ไข ลบข้อคำถาม และกำหนด 5 มิติการประเมินได้เอง
            </p>
          </div>

          <Link
            href="/admin"
            className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-primary text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <span>สร้างแบบสอบถาม</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
