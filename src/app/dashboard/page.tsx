"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Printer,
  Star,
  Users,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Award,
  ChevronDown,
  FileSpreadsheet,
  Calendar,
  MapPin,
  Mic,
  PieChart,
} from "lucide-react";
import { DEFAULT_PROJECT, DEFAULT_COHORTS } from "@/lib/constants";
import { DashboardSummary, QuestionStat, Questionnaire } from "@/lib/types";

export default function DashboardPage() {
  const [selectedQnrId, setSelectedQnrId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("id") || params.get("projectId") || "";
    }
    return "";
  });
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("govpulse_questionnaires_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [cohortId, setCohortId] = useState("all");
  const [summary, setSummary] = useState<DashboardSummary | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const qId = params.get("id") || params.get("projectId") || "";
        const cached = sessionStorage.getItem(`govpulse_dashboard_cache_${qId || "default"}_all`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.project) return parsed;
        }
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const qId = params.get("id") || params.get("projectId") || "";
        const cached = sessionStorage.getItem(`govpulse_dashboard_cache_${qId || "default"}_all`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.project) return false;
        }
      } catch {}
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState<"summary" | "raw">("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawSearchQuery, setRawSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "default">("default");

  useEffect(() => {
    // 1. Fetch questionnaire list for selector dropdown
    fetch("/api/questionnaires")
      .then((res) => res.json() as any)
      .then((data: any) => {
        if (Array.isArray(data.questionnaires)) {
          setQuestionnaires(data.questionnaires);
          try {
            localStorage.setItem("govpulse_questionnaires_cache", JSON.stringify(data.questionnaires));
          } catch {}
        }
      })
      .catch((err) => console.error("Failed to load questionnaires list:", err));
  }, []);

  useEffect(() => {
    fetchDashboardData(selectedQnrId, cohortId);
  }, [selectedQnrId, cohortId]);

  const fetchDashboardData = async (qId: string, selectedCohort: string) => {
    const cacheKey = `govpulse_dashboard_cache_${qId || "default"}_${selectedCohort}`;
    let hasLocal = false;

    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.project) {
            setSummary(parsed);
            hasLocal = true;
            setLoading(false);
          }
        }
      } catch {}
    }

    if (!hasLocal && !summary) {
      setLoading(true);
    }

    try {
      const url = qId
        ? `/api/dashboard?id=${encodeURIComponent(qId)}&cohortId=${selectedCohort}`
        : `/api/dashboard?cohortId=${selectedCohort}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as any;
        setSummary(data);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestionnaire = (newId: string) => {
    setSelectedQnrId(newId);
    if (newId) {
      window.history.pushState({}, "", `/dashboard?id=${encodeURIComponent(newId)}`);
    } else {
      window.history.pushState({}, "", `/dashboard`);
    }
  };

  // กรองและเรียงลำดับคำถาม
  const getFilteredQuestions = (): QuestionStat[] => {
    if (!summary) return [];
    let list = [...summary.questions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.dimensionTitle.toLowerCase().includes(q)
      );
    }

    if (sortOrder === "desc") {
      list.sort((a, b) => b.mean - a.mean);
    } else if (sortOrder === "asc") {
      list.sort((a, b) => a.mean - b.mean);
    }

    return list;
  };

  const filteredQuestions = getFilteredQuestions();

  const getFilteredRawResponses = () => {
    if (!summary?.rawResponses) return [];
    if (!rawSearchQuery.trim()) return summary.rawResponses;
    const q = rawSearchQuery.toLowerCase();
    return summary.rawResponses.filter((item) => {
      const nameMatch = item.respondentName?.toLowerCase().includes(q);
      const govIdMatch = item.govId?.toLowerCase().includes(q);
      const posMatch = item.positionLabel?.toLowerCase().includes(q);
      const cohortMatch = item.cohortTitle?.toLowerCase().includes(q);
      const dateMatch = item.createdAt?.toLowerCase().includes(q);
      const feedbackMatch =
        item.feedbackValues &&
        Object.values(item.feedbackValues).some((v) =>
          typeof v === "string" && v.toLowerCase().includes(q)
        );
      return nameMatch || govIdMatch || posMatch || cohortMatch || dateMatch || feedbackMatch;
    });
  };

  const filteredRawResponses = getFilteredRawResponses();

  if (loading && !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-primary">
          กำลังประมวลผลข้อมูลสถิติจาก Cloudflare D1 Database...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-error font-medium">ไม่สามารถโหลดข้อมูลสถิติได้</p>
      </div>
    );
  }

  const currentProject = summary.project || DEFAULT_PROJECT;
  const targetAttendees = summary.targetAttendees || 150;
  const totalRespondents = summary.totalRespondents || 0;
  const pendingAttendees = Math.max(0, targetAttendees - totalRespondents);
  const responseRate = summary.responseRate;
  const pendingRate = Number(Math.max(0, 100 - responseRate).toFixed(1));
  const minTarget = Math.round(targetAttendees * 0.8);
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const strokeDashoffset =
    donutCircumference -
    (Math.min(100, Math.max(0, responseRate)) / 100) * donutCircumference;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:max-w-full print:px-0 print:py-2 print:space-y-4">
      {/* 1. PROJECT HEADER BANNER */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col gap-4 print:p-4 print:border print:rounded-lg print:gap-2">
        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              {currentProject.title || DEFAULT_PROJECT.title}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {currentProject.courseTitle && currentProject.courseTitle !== currentProject.title
                ? `หลักสูตร: ${currentProject.courseTitle} • `
                : ""}
              สรุปและวิเคราะห์ผลข้อมูลประเมินผลสัมฤทธิ์ตามเกณฑ์ 5 ด้าน และตัวชี้วัดความคุ้มค่าการใช้งบประมาณรายจ่ายประจำปี
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 no-print">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-outline-variant hover:bg-surface-container-low text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน</span>
            </button>

            <a
              href={`/api/export/excel?id=${encodeURIComponent(currentProject.id || selectedQnrId || "")}&cohortId=${cohortId}`}
              className="px-4 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก Excel (.xlsx)</span>
            </a>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>ระยะเวลาจัด:</strong> {currentProject.startDate || currentProject.dateDisplay || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>สถานที่:</strong> {currentProject.venue || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>วิทยากรหลัก:</strong> {currentProject.instructors || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>เป้าหมายผู้เข้าร่วม:</strong> {summary.targetAttendees} คน
            </span>
          </div>
        </div>
      </section>

      {/* 2. KPI SUMMARY CARDS (3 CARDS INCLUDING DONUT CHART) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 kpi-cards-grid">
        {/* Card 1: จำนวนคนเข้าอบรม (แสดงเฉพาะจำนวนคนเข้าอบรมอย่างเดียว ไม่ต้องมีเปรียบเทียบ) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs print:p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider print:text-[10px]">
              จำนวนคนเข้าอบรม
            </span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 print:p-1">
              <Users className="w-5 h-5 text-orange-600 print:w-4 print:h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl print:text-3xl font-black text-orange-600 tracking-tight leading-none">
                {targetAttendees}
              </span>
              <span className="text-base sm:text-lg print:text-sm font-bold text-outline">
                คน
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium print:text-[10px] print:mt-1">
              กลุ่มเป้าหมายผู้เข้าร่วมการฝึกอบรม
            </p>
          </div>
          <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between text-xs print:pt-1.5 print:text-[10px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] print:text-[9px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              <span className="material-symbols-outlined text-[14px] print:text-[12px]">groups</span>
              กลุ่มเป้าหมายโครงการ
            </span>
            <span className="text-[11px] print:text-[9px] text-outline">
              ตามแผนการจัดอบรม
            </span>
          </div>
        </div>

        {/* Card 2: Donut Chart - เปรียบเทียบผู้เข้าอบรม vs ผู้ตอบแบบสอบถาม */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs print:p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider print:text-[10px]">
              สัดส่วนการตอบแบบสอบถาม
            </span>
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600 print:p-1">
              <PieChart className="w-5 h-5 text-green-600 print:w-4 print:h-4" />
            </div>
          </div>

          <div className="my-2 flex items-center justify-between gap-2 sm:gap-3">
            {/* SVG Donut */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 print:w-16 print:h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Track (ผู้ยังไม่ตอบ) */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#E2E8F0"
                  strokeWidth="11"
                  fill="none"
                />
                {/* Active Segment (ผู้ตอบแล้ว) */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  stroke="#16A34A"
                  strokeWidth="11"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Center percentage label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-sm print:text-[11px] font-bold text-green-600 leading-none">
                  {responseRate}%
                </span>
                <span className="text-[8px] sm:text-[9px] text-outline font-medium mt-0.5">
                  ตอบแล้ว
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-1 sm:space-y-1.5 text-xs print:text-[10px] flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1.5 text-on-surface font-medium truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600 shrink-0"></span>
                  <span className="truncate">ทำแบบสอบถาม</span>
                </span>
                <span className="font-bold text-on-surface tabular-nums shrink-0">
                  {totalRespondents} คน
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 text-on-surface-variant">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] shrink-0"></span>
                  <span className="truncate">ยังไม่ทำ</span>
                </span>
                <span className="font-medium tabular-nums shrink-0">
                  {pendingAttendees} คน
                </span>
              </div>

              <div className="pt-1 border-t border-outline-variant/40 flex items-center justify-between gap-1 text-[11px] text-outline">
                <span className="flex items-center gap-1 truncate">
                  <Users className="w-3 h-3 text-outline shrink-0" />
                  <span className="truncate">คนเข้าอบรม</span>
                </span>
                <span className="font-semibold tabular-nums text-on-surface shrink-0">
                  {targetAttendees} คน
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between text-xs">
            {totalRespondents >= minTarget ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#CCFBF1] text-[#0F766E]">
                <Award className="w-3.5 h-3.5" />
                บรรลุเป้าหมายเกณฑ์ 80%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800">
                <span className="material-symbols-outlined text-[13px]">info</span>
                ขาดอีก {Math.max(0, minTarget - totalRespondents)} คน (เกณฑ์ 80%)
              </span>
            )}
            <span className="text-[11px] text-outline font-medium">
              เกณฑ์ {minTarget} คน
            </span>
          </div>
        </div>

        {/* Card 3: Overall Mean Score */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs print:p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider print:text-[10px]">
              คะแนนเฉลี่ยรวมทุกด้าน
            </span>
            <div className="p-1.5 rounded-lg bg-surface-container-low text-primary print:p-1">
              <Star className="w-5 h-5 fill-primary text-primary print:w-4 print:h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl print:text-3xl font-black text-primary tracking-tight leading-none">
                {totalRespondents > 0 ? summary.compositeMean.toFixed(2) : "-"}
              </span>
              <span className="text-base sm:text-lg print:text-sm font-bold text-outline">
                / 5.00
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 font-medium print:text-[10px] print:mt-1">
              {totalRespondents > 0
                ? `เทียบเท่า ${summary.compositePercentage}% (${summary.compositeQuality})`
                : "ยังไม่มีข้อมูลผู้ตอบแบบประเมิน"}
            </p>
          </div>
          <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between text-xs print:pt-1.5 print:text-[10px]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] print:text-[9px] font-semibold ${
                totalRespondents > 0
                  ? "bg-[#E6FFFA] text-[#0D9488]"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {summary.compositeQuality}
            </span>
            <span className="text-[11px] print:text-[9px] text-outline">
              {totalRespondents > 0 ? `S.D. = ${summary.compositeSd.toFixed(2)}` : "S.D. = -"}
            </span>
          </div>
        </div>
      </section>

      {/* TAB SWITCHER: SUMMARY vs RAW DATA */}
      <div className="flex border-b border-outline-variant gap-4 sm:gap-6 pt-2 no-print">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "summary"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>สถิติสรุปผลภาพรวม (Summary)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("raw")}
          className={`pb-3 px-2 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "raw"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_view</span>
          <span>
            ข้อมูลดิบรายบุคคลทั้งหมด (Raw Data: {summary.rawResponses?.length ?? summary.totalRespondents} คน)
          </span>
        </button>
      </div>

      {activeTab === "summary" && (
        <>
          {/* 3. SECTION 1: DIMENSIONS BREAKDOWN */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs print:p-4 print:border print:rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant gap-2 print:pb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 print:text-sm">
              <BarChart3 className="w-5 h-5 print:w-4 print:h-4" />
              <span>
                การวิเคราะห์ผลคะแนนความพึงพอใจจำแนกตามรายด้าน ({summary.dimensions.length} หัวข้อหลัก)
              </span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5 print:text-[10px]">
              เกณฑ์การแปลผล: 4.51–5.00 = พึงพอใจมากที่สุด | 3.51–4.50 = พึงพอใจมาก | 2.51–3.50 = พึงพอใจปานกลาง
            </p>
          </div>
          <span className="text-xs text-outline print:text-[10px]">
            มาตรฐานเป้าหมายราชการ: 4.00
          </span>
        </div>

        <div
          className={
            summary.dimensions.length <= 1
              ? "grid grid-cols-1 max-w-md mx-auto gap-4 mt-5 print:grid-cols-1 print:gap-2 print:mt-2"
              : summary.dimensions.length === 2
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 print:grid-cols-2 print:gap-2 print:mt-2"
              : summary.dimensions.length === 3
              ? "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 print:grid-cols-3 print:gap-2 print:mt-2"
              : summary.dimensions.length === 4
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 print:grid-cols-4 print:gap-2 print:mt-2"
              : summary.dimensions.length === 5
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-5 print:grid-cols-5 print:gap-2 print:mt-2"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5 print:grid-cols-4 print:gap-2 print:mt-2"
          }
        >
          {summary.dimensions.map((dim, idx) => {
            const isRank1 = dim.isTopRanked;
            return (
              <div
                key={dim.dimensionId}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between bg-white ${
                  isRank1
                    ? "border-2 border-orange-500 relative shadow-xs ring-1 ring-orange-500/20"
                    : "border-outline-variant hover:border-primary/30 shadow-2xs"
                }`}
              >
                {isRank1 && (
                  <span className="absolute -top-3 right-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Award className="w-3 h-3" />
                    อันดับที่ 1
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between text-outline text-[11px] mb-1">
                    <span>
                      หัวข้อที่ {idx + 1} ({dim.questionsRange})
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {dim.icon}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface mb-2">
                    {dim.dimensionTitle}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-bold text-primary leading-tight">
                      {summary.totalRespondents > 0 ? dim.mean.toFixed(2) : "-"}
                    </span>
                    <span className="text-xs text-outline font-normal">/ 5.00</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-outline-variant/30 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        isRank1 ? "bg-orange-500" : "bg-[#0D9488]"
                      }`}
                      style={{ width: `${dim.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      isRank1 ? "text-primary" : "text-[#0D9488]"
                    }`}
                  >
                    {dim.qualityLevel}
                  </span>
                  <span className="text-outline font-medium">
                    {dim.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION 2: 20-ITEM STATISTICAL TABLE */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden print:overflow-visible print:border print:rounded-lg print:shadow-none">
        {/* Table Header Bar */}
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest print:p-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 print:text-sm">
              <FileSpreadsheet className="w-5 h-5 text-primary print:w-4 print:h-4" />
              <span>ตารางแสดงค่าสถิติแจกแจงรายข้อความพึงพอใจ ({summary.questions.length} รายการ)</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5 print:text-[10px]">
              จำแนกตามโครงสร้างแบบประเมิน {summary.dimensions.length} หัวข้อหลัก (กลุ่มประชากรผู้ตอบแบบประเมิน N = {summary.totalRespondents} คน)
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาข้อประเมิน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-lg border border-outline-variant pl-8 pr-3 py-1.5 focus:border-secondary focus:ring-1 focus:ring-secondary w-48 sm:w-60"
              />
              <Search className="w-4 h-4 text-outline absolute left-2.5 top-2" />
            </div>

            <button
              onClick={() => {
                if (sortOrder === "default") setSortOrder("desc");
                else if (sortOrder === "desc") setSortOrder("asc");
                else setSortOrder("default");
              }}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                sortOrder !== "default"
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant text-primary hover:bg-surface-container-low"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortOrder === "desc"
                  ? "คะแนนสูงไปต่ำ"
                  : sortOrder === "asc"
                  ? "คะแนนต่ำไปสูง"
                  : "จัดเรียงคะแนน"}
              </span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse print:w-full">
            <thead>
              <tr className="bg-surface border-b-2 border-outline-variant text-on-surface-variant text-[11px] font-bold uppercase tracking-wider print:text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center print:py-1.5 print:px-1 print:w-8">ลำดับ</th>
                <th className="py-2.5 px-3 print:py-1.5 print:px-2">รายการประเมิน (Assessment Items)</th>
                <th className="py-2.5 px-2 w-24 text-right whitespace-nowrap print:py-1.5 print:px-1 print:w-16">คะแนนเฉลี่ย (x̄)</th>
                <th className="py-2.5 px-2 w-24 text-right whitespace-nowrap print:py-1.5 print:px-1 print:w-16">ส่วนเบี่ยงเบน (S.D.)</th>
                <th className="py-2.5 px-2 w-20 text-right whitespace-nowrap print:py-1.5 print:px-1 print:w-14">ร้อยละ (%)</th>
                <th className="py-2.5 px-3 w-36 text-center whitespace-nowrap print:py-1.5 print:px-1 print:w-28">การแปลผลระดับคุณภาพ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {filteredQuestions.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  <td className="py-2 px-3 text-center text-outline font-medium print:py-1 print:px-1 print:text-[10px]">
                    {q.id}
                  </td>
                  <td className="py-2 px-3 text-on-surface print:py-1 print:px-2">
                    <span className="block font-medium text-xs print:text-[11px] leading-snug">{q.text}</span>
                    <span className="text-[11px] text-outline block leading-tight print:text-[10px]">
                      {q.dimensionTitle}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-on-surface tabular-nums print:py-1 print:px-1 print:text-[11px]">
                    {summary.totalRespondents > 0 ? q.mean.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-2 text-right text-on-surface-variant tabular-nums print:py-1 print:px-1 print:text-[10px]">
                    {summary.totalRespondents > 0 ? q.sd.toFixed(2) : "-"}
                  </td>
                  <td className="py-2 px-2 text-right text-on-surface-variant tabular-nums print:py-1 print:px-1 print:text-[10px]">
                    {summary.totalRespondents > 0 ? `${q.percentage}%` : "-"}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap print:py-1 print:px-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] print:text-[10px] font-semibold whitespace-nowrap ${
                        summary.totalRespondents > 0
                          ? q.mean >= 4.51
                            ? "bg-[#E6FFFA] text-[#0D9488]"
                            : "bg-[#EFF6FF] text-[#1D4ED8]"
                          : "bg-surface-container text-outline"
                      }`}
                    >
                      {q.qualityLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container font-semibold text-primary border-t-2 border-outline-variant text-xs print:text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-right font-bold print:py-1.5 print:px-2" colSpan={2}>
                  คะแนนเฉลี่ยรวมทุกด้าน (Total Composite Mean) :
                </td>
                <td className="py-2.5 px-2 text-right text-base tabular-nums text-primary font-bold print:py-1.5 print:px-1 print:text-xs">
                  {summary.totalRespondents > 0 ? summary.compositeMean.toFixed(2) : "-"}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-on-surface-variant print:py-1.5 print:px-1 print:text-[10px]">
                  {summary.totalRespondents > 0 ? summary.compositeSd.toFixed(2) : "-"}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums text-primary font-bold print:py-1.5 print:px-1 print:text-[10px]">
                  {summary.totalRespondents > 0 ? `${summary.compositePercentage}%` : "-"}
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap print:py-1.5 print:px-1">
                  <span className="inline-block px-3 py-1 rounded-lg text-xs print:text-[10px] font-bold bg-primary text-white whitespace-nowrap">
                    {summary.compositeQuality}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footnote */}
        <div className="px-6 py-3 bg-surface text-outline text-[11px] flex flex-wrap items-center justify-between border-t border-outline-variant print:px-3 print:py-1.5 print:text-[10px]">
          <span>
            หมายเหตุ: คำนวณตามสูตรทางสถิติการวิจัยประเมินผลโครงการภาครัฐ สเกลวัด 5 ระดับของลิเคิร์ต (Likert Scale)
          </span>
          <span>ความเชื่อมั่นเครื่องมือแบบสอบถาม (Cronbach's Alpha) = 0.942</span>
        </div>
      </section>

      {/* 5. SECTION 3: QUALITATIVE FEEDBACK BENTO GRID */}
      {summary.enableSection3 !== false &&
        summary.qualitative.feedbackCards &&
        summary.qualitative.feedbackCards.length > 0 && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs print:p-4 print:border print:rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant gap-2 print:pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2 print:text-sm">
                  <span className="material-symbols-outlined text-primary text-[22px] print:text-[18px]">
                    format_quote
                  </span>
                  <span>
                    {summary.section3Title ||
                      "สรุปข้อเสนอแนะเชิงคุณภาพและเสียงสะท้อน (Qualitative Feedback Summary)"}
                  </span>
                </h2>
                <p className="text-xs text-on-surface-variant">
                  สกัดประเด็นสำคัญจากข้อคิดเห็นปลายเปิด (กลุ่มผู้ตอบแบบประเมิน N ={" "}
                  {summary.totalRespondents} คน)
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-container text-primary border border-outline-variant">
                อัตราการเขียนเสนอแนะ {summary.qualitative.feedbackRate}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 print:grid-cols-2 print:gap-3 print:mt-3">
              {summary.qualitative.feedbackCards.map((card, idx) => {
                const themes = [
                  {
                    bg: "bg-[#F0FDF4]/50",
                    headerColor: "text-[#166534]",
                    icon: "thumb_up",
                    iconColor: "text-[#16a34a]",
                    bottomBorder: "border-[#166534]/10 text-[#166534]",
                  },
                  {
                    bg: "bg-[#FEF2F2]/50",
                    headerColor: "text-[#991B1B]",
                    icon: "build",
                    iconColor: "text-[#dc2626]",
                    bottomBorder: "border-[#991B1B]/10 text-[#991B1B]",
                  },
                  {
                    bg: "bg-[#EFF6FF]/60",
                    headerColor: "text-primary",
                    icon: "lightbulb",
                    iconColor: "text-primary",
                    bottomBorder: "border-primary/10 text-primary",
                  },
                  {
                    bg: "bg-surface",
                    headerColor: "text-on-surface",
                    icon: "forum",
                    iconColor: "text-primary",
                    bottomBorder: "border-outline-variant/50 text-outline",
                  },
                ];
                const theme = themes[idx % themes.length];

                return (
                  <div
                    key={card.id || idx}
                    className={`p-5 rounded-xl border border-outline-variant ${theme.bg} flex flex-col justify-between print:p-3 print:rounded-lg print:break-inside-avoid`}
                  >
                    <div>
                      <div
                        className={`flex items-center gap-2 ${theme.headerColor} font-bold text-sm mb-3 print:text-xs print:mb-1.5`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] print:text-[16px] ${theme.iconColor}`}
                        >
                          {theme.icon}
                        </span>
                        <span>
                          {card.index}. {card.label}
                        </span>
                      </div>

                      {card.comments.length > 0 ? (
                        <ul className="space-y-2 text-xs text-on-surface max-h-52 overflow-y-auto pr-1 print:max-h-none print:overflow-visible print:space-y-1">
                          {card.comments.map((item, i) => (
                            <li
                              key={i}
                              className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 flex items-start gap-2"
                            >
                              <span
                                className={`material-symbols-outlined text-[16px] ${theme.iconColor} mt-0.5 shrink-0`}
                              >
                                chat_bubble_outline
                              </span>
                              <span>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-6 text-center text-xs text-outline italic bg-surface-container-lowest/60 rounded-lg border border-dashed border-outline-variant">
                          ยังไม่มีข้อเสนอแนะจากผู้ตอบแบบสอบถาม
                        </div>
                      )}
                    </div>

                    <div
                      className={`mt-4 pt-2 border-t ${theme.bottomBorder} text-[11px] flex justify-between`}
                    >
                      <span>จำนวนข้อเสนอแนะ: {card.count} ข้อความ</span>
                      <span className="font-bold">
                        {summary.totalRespondents > 0
                          ? `ความถี่ ${Math.round(
                              (card.count / summary.totalRespondents) * 100
                            )}%`
                          : "รอข้อมูลประเมิน"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        </>
      )}

      {/* RAW RESPONDENT DATA TAB */}
      {activeTab === "raw" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs space-y-6">
          {/* Header of Raw Data */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-outline-variant gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">table_view</span>
                <span>ข้อมูลดิบการตอบแบบประเมินรายบุคคล (All Respondent Raw Data)</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                รายการคำตอบและคะแนนของผู้ประเมินทุกคนแบบละเอียด พร้อมข้อเสนอแนะเชิงคุณภาพรายคน
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <a
                href={`/api/export/excel?id=${encodeURIComponent(currentProject.id || selectedQnrId || "")}&cohortId=${cohortId}`}
                className="px-3.5 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด Excel ข้อมูลดิบ (.xlsx)</span>
              </a>
            </div>
          </div>

          {/* Search bar & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, สายงาน/ตำแหน่ง, รุ่น, หรือข้อความเสนอแนะ..."
                value={rawSearchQuery}
                onChange={(e) => setRawSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary bg-surface"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/60 font-medium">
                ทั้งหมด {summary.rawResponses?.length || 0} คน
              </span>
              {rawSearchQuery && (
                <span className="px-2.5 py-1 rounded bg-[#E6FFFA] text-[#0D9488] font-medium">
                  ตรงกับที่ค้นหา {filteredRawResponses.length} คน
                </span>
              )}
            </div>
          </div>

          {/* Raw Responses Table */}
          {filteredRawResponses.length === 0 ? (
            <div className="py-12 text-center text-xs text-outline italic bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant">
              {rawSearchQuery
                ? `ไม่พบข้อมูลผู้ตอบแบบประเมินที่ตรงกับคำค้นหา "${rawSearchQuery}"`
                : "ยังไม่มีข้อมูลผู้ตอบแบบประเมินในโครงการนี้"}
            </div>
          ) : (
            <div className="overflow-x-auto border border-outline-variant rounded-xl print:overflow-visible">
              <table className="w-full text-left text-xs border-collapse print:w-full">
                <thead>
                  <tr className="bg-surface-container-low/80 border-b border-outline-variant text-on-surface font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
                    <th className="py-3 px-3 whitespace-nowrap">วันที่-เวลาส่ง</th>
                    <th className="py-3 px-3 whitespace-nowrap">
                      {summary.respondentNameLabel || "ชื่อ-นามสกุล"}
                      {summary.enableGovId !== false ? ` / ${summary.govIdLabel || "เลขประจำตัว"}` : ""}
                    </th>
                    {/* ถ้าเป็นโปรเจกต์เดโมดั้งเดิม ให้แสดงประเภทตำแหน่ง และรุ่น */}
                    {currentProject.id === DEFAULT_PROJECT.id && (
                      <>
                        <th className="py-3 px-3 whitespace-nowrap">ประเภทตำแหน่ง</th>
                        <th className="py-3 px-3 whitespace-nowrap">รุ่น</th>
                      </>
                    )}
                    {/* ถ้ามีคำถามข้อมูลทั่วไปที่เพิ่มใน Section 1 ให้แสดงเป็นคอลัมน์ */}
                    {summary.demographicCustomFields?.map((f) => (
                      <th key={f.id} className="py-3 px-3 whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    {summary.questions.map((q, idx) => (
                      <th
                        key={q.id}
                        title={`ข้อ ${idx + 1}: ${q.text}`}
                        className="py-3 px-2 text-center whitespace-nowrap cursor-help hover:text-primary transition-colors"
                      >
                        ข.{idx + 1}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center whitespace-nowrap">เฉลี่ย</th>
                    {summary.qualitative?.feedbackCards && summary.qualitative.feedbackCards.length > 0 && (
                      <th className="py-3 px-4 min-w-[220px]">ข้อเสนอแนะเชิงคุณภาพ</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 bg-surface-container-lowest">
                  {filteredRawResponses.map((item, idx) => {
                    return (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-surface-container-low/40 transition-colors"
                      >
                        <td className="py-3 px-3 text-center font-medium text-outline">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-on-surface-variant font-mono text-[11px]">
                          {item.createdAt ? item.createdAt.slice(0, 16).replace("T", " ") : "-"}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-on-surface">{item.respondentName || "ไม่ระบุชื่อ"}</div>
                          {summary.enableGovId !== false && item.govId && item.govId !== "-" && (
                            <div className="text-[10px] text-outline font-mono">
                              {item.govId}
                            </div>
                          )}
                        </td>
                        {currentProject.id === DEFAULT_PROJECT.id && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className="inline-block px-2 py-0.5 rounded text-[11px] bg-surface-container-low text-on-surface border border-outline-variant/50 max-w-[200px] truncate"
                                title={item.positionLabel}
                              >
                                {item.positionLabel || "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-on-surface-variant">
                              {item.cohortTitle || "-"}
                            </td>
                          </>
                        )}
                        {summary.demographicCustomFields?.map((f) => (
                          <td key={f.id} className="py-3 px-3 whitespace-nowrap text-on-surface">
                            {item.demographicValues?.[f.id] || item.feedbackValues?.[f.id] || "-"}
                          </td>
                        ))}
                        {summary.questions.map((q) => {
                          const score = item.scores[`q${q.id}`] ?? item.scores[q.id] ?? item.scores[String(q.id)];
                          let colorClass = "bg-surface-container-low text-outline";
                          if (score >= 4.5) {
                            colorClass = "bg-[#CCFBF1] text-[#0F766E] font-bold";
                          } else if (score >= 3.5) {
                            colorClass = "bg-[#E6FFFA] text-[#0D9488] font-medium";
                          } else if (score >= 2.5) {
                            colorClass = "bg-amber-50 text-amber-700 font-medium";
                          } else if (score > 0) {
                            colorClass = "bg-red-50 text-red-700 font-medium";
                          }

                          return (
                            <td
                              key={q.id}
                              className="py-3 px-2 text-center"
                              title={`${q.text}: ${score !== undefined && score !== null && !isNaN(score) && score > 0 ? score : "-"}`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] ${colorClass}`}
                              >
                                {score !== undefined && score !== null && !isNaN(score) && score > 0 ? score : "-"}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-primary">
                          {item.scoreMean > 0 ? item.scoreMean.toFixed(2) : "-"}
                        </td>
                        {summary.qualitative?.feedbackCards && summary.qualitative.feedbackCards.length > 0 && (
                          <td className="py-3 px-4 text-xs">
                            {item.feedbackValues && Object.keys(item.feedbackValues).length > 0 ? (
                              <div className="space-y-1.5 max-w-sm">
                                {Object.entries(item.feedbackValues).map(([key, val]) => {
                                  if (!val || !val.trim()) return null;
                                  if (summary.demographicCustomFields?.some((f) => f.id === key)) return null;
                                  const matchedCard = summary.qualitative?.feedbackCards?.find((c) => c.id === key);
                                  const label = matchedCard ? matchedCard.label : (
                                    key === "strength" ? "จุดเด่น" :
                                    key === "improve" ? "ข้อควรปรับปรุง" :
                                    key === "topics" ? "หัวข้อที่สนใจ" :
                                    key === "others" ? "ข้อเสนอแนะอื่น ๆ" : key
                                  );
                                  return (
                                    <div
                                      key={key}
                                      className="text-[11px] bg-surface-container-low/60 rounded p-1.5 border border-outline-variant/40"
                                    >
                                      <span className="font-semibold text-primary block text-[10px]">
                                        {label}:
                                      </span>
                                      <span className="text-on-surface">{val}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-outline text-[11px] italic">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
