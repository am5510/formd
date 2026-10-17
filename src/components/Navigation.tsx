"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  BarChart3,
  FolderOpen,
  Printer,
  Download,
  Bell,
  HelpCircle,
  Database,
  Cloud,
  Home,
} from "lucide-react";
export default function Navigation() {
  const pathname = usePathname();

  const hideMenus = true;
  const isFormPage = pathname?.startsWith("/form");
  const isDashboardActive = pathname === "/dashboard";
  const isDocumentsActive = pathname === "/documents";

  return (
    <header className="w-full bg-primary text-white sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand Logo & Product Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-white shadow-sm border border-white/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-white block leading-tight tracking-tight">
              ระบบประเมินโครงการฝึกอบรม
            </span>
          </div>
        </div>

        {/* Main Navigation Links - ซ่อนทั้งหมดเมื่ออยู่ในหน้า /form และ /admin */}
        {!hideMenus && (
          <nav className="hidden md:flex items-center gap-6 h-full">
            <Link
              href="/admin"
              className={`py-5 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${
                pathname === "/admin"
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/80 hover:text-white hover:border-white/40"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>จัดการแบบสอบถาม</span>
            </Link>

            <Link
              href="/dashboard"
              className={`py-5 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${
                isDashboardActive
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/80 hover:text-white hover:border-white/40"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>แดชบอร์ดสรุปผลรายงาน</span>
              <span className="ml-1 bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full border border-white/30 font-medium">
                สถิติสด
              </span>
            </Link>

            <Link
              href="/documents"
              className={`py-5 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${
                isDocumentsActive
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/80 hover:text-white hover:border-white/40"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>คลังเอกสาร & รูปภาพ (R2)</span>
            </Link>
          </nav>
        )}

        {/* Right side action buttons */}
        <div className="flex items-center gap-2">
          {!hideMenus && (
            <>
              {/* Quick Print Button */}
              <button
                onClick={() => window.print()}
                className="p-2 text-white/90 hover:bg-white/15 hover:text-white rounded-lg transition-colors border border-white/30 flex items-center gap-1.5 text-xs font-medium"
                title="พิมพ์หน้ารายงานสรุปผล"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">พิมพ์รายงาน</span>
              </button>

              {/* Quick Export Excel */}
              <a
                href="/api/export/excel"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-primary rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก Excel</span>
              </a>

              {/* User Profile */}
              <div className="flex items-center border-l border-white/30 pl-3 ml-1 gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-xs"
                  title="ผู้ดูแลระบบ: สำนักพัฒนาบุคลากร"
                >
                  สก
                </div>
              </div>
            </>
          )}

          {/* Home Icon Link - ซ่อนในหน้าที่ทำแบบประเมิน (/form) เพื่อไม่ให้ผู้ตอบแบบสอบถามกดกลับหน้าโฮม */}
          {!isFormPage && (
            <Link
              href="/"
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20 shadow-sm"
              title="หน้าแรก"
              aria-label="หน้าแรก"
            >
              <Home className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
