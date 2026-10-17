"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Share2,
  BarChart3,
  X,
  ExternalLink,
  Search,
  FolderOpen,
  GraduationCap,
  BookOpen,
  Mic,
  Building2,
  Calendar,
  Users,
  User,
  CreditCard,
  Send,
  Link as LinkIcon,
  PlusCircle,
  Edit3,
  Check,
  Layers,
  MapPin,
} from "lucide-react";
import {
  DEFAULT_PROJECT,
  DEFAULT_COHORTS,
  DIMENSIONS,
  EVALUATION_QUESTIONS,
  POSITION_OPTIONS,
  DEFAULT_SECTION1_TITLE,
  DEFAULT_RESPONDENT_NAME_LABEL,
  DEFAULT_RESPONDENT_NAME_PLACEHOLDER,
  DEFAULT_GOV_ID_LABEL,
  DEFAULT_GOV_ID_PLACEHOLDER,
  DEFAULT_SECTION3_TITLE,
  DEFAULT_FEEDBACK_ITEMS,
  DEFAULT_SECTION4_TITLE,
  DEFAULT_SECTION4_DESCRIPTION,
  DEFAULT_SECTION4_LABEL,
  DEFAULT_SECTION4_HELPER_TEXT,
} from "@/lib/constants";
import {
  QuestionItem,
  Questionnaire,
  FeedbackFieldItem,
  DemographicFieldItem,
} from "@/lib/types";
import FileUploader, { UploadedFileItem } from "@/components/FileUploader";
import { useEvaluationProgress } from "@/context/ProgressContext";

export default function FormPage() {
  const router = useRouter();
  const { updateProgress } = useEvaluationProgress();

  // Mode: "list" = หน้ารวมแบบสอบถามทั้งหมด, "form" = หน้าทำแบบประเมินรายชุด
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [allQuestionnaires, setAllQuestionnaires] = useState<Questionnaire[]>(() => {
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
  const [loadingList, setLoadingList] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("govpulse_questionnaires_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });
  const [shareModalQnr, setShareModalQnr] = useState<Questionnaire | null>(null);
  const [copiedListId, setCopiedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Questions & Project from Questionnaire Builder
  const [questions, setQuestions] = useState<QuestionItem[]>(EVALUATION_QUESTIONS);
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [questionnaireId, setQuestionnaireId] = useState<string>("");
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Dynamic Section 1 (Demographics) config
  const [enableSection1, setEnableSection1] = useState(true);
  const [section1Title, setSection1Title] = useState(DEFAULT_SECTION1_TITLE);
  const [respondentNameLabel, setRespondentNameLabel] = useState(
    DEFAULT_RESPONDENT_NAME_LABEL
  );
  const [respondentNamePlaceholder, setRespondentNamePlaceholder] = useState(
    DEFAULT_RESPONDENT_NAME_PLACEHOLDER
  );
  const [respondentNameRequired, setRespondentNameRequired] = useState(true);
  const [enableGovId, setEnableGovId] = useState(true);
  const [govIdLabel, setGovIdLabel] = useState(DEFAULT_GOV_ID_LABEL);
  const [govIdPlaceholder, setGovIdPlaceholder] = useState(
    DEFAULT_GOV_ID_PLACEHOLDER
  );
  const [govIdRequired, setGovIdRequired] = useState(false);
  const [demographicCustomFields, setDemographicCustomFields] = useState<
    DemographicFieldItem[]
  >([]);
  const [demographicValues, setDemographicValues] = useState<
    Record<string, string>
  >({});

  // Dynamic Section 3 & Section 4 config
  const [enableSection3, setEnableSection3] = useState(true);
  const [section3Title, setSection3Title] = useState(DEFAULT_SECTION3_TITLE);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackFieldItem[]>(
    DEFAULT_FEEDBACK_ITEMS
  );
  const [feedbackValues, setFeedbackValues] = useState<Record<string, string>>({});

  const [enableSection4, setEnableSection4] = useState(true);
  const [section4Title, setSection4Title] = useState(DEFAULT_SECTION4_TITLE);
  const [section4Description, setSection4Description] = useState(
    DEFAULT_SECTION4_DESCRIPTION
  );
  const [section4Label, setSection4Label] = useState(DEFAULT_SECTION4_LABEL);
  const [section4HelperText, setSection4HelperText] = useState(
    DEFAULT_SECTION4_HELPER_TEXT
  );

  // Form states
  const [cohortId, setCohortId] = useState("cohort-1");
  const [respondentName, setRespondentName] = useState("");
  const [govId, setGovId] = useState("");
  const [positionLevel, setPositionLevel] = useState("1");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbackStrength, setFeedbackStrength] = useState("");
  const [feedbackImprove, setFeedbackImprove] = useState("");
  const [feedbackTopics, setFeedbackTopics] = useState("");
  const [feedbackOthers, setFeedbackOthers] = useState("");
  const [attachments, setAttachments] = useState<UploadedFileItem[]>([]);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const applyQuestionnaire = (qnr: Questionnaire) => {
    setQuestionnaireId(qnr.id);
    setScores({});
    setFeedbackValues({});
    setDemographicValues({});
    setRespondentName("");
    setGovId("");
    setPositionLevel("1");
    setFeedbackStrength("");
    setFeedbackImprove("");
    setFeedbackTopics("");
    setFeedbackOthers("");
    setSubmitSuccess(false);
    setProject({
      ...DEFAULT_PROJECT,
      id: qnr.id,
      title: qnr.title,
      courseTitle: qnr.courseTitle,
      instructors: qnr.instructors,
      department: qnr.department,
      dateDisplay: qnr.dateDisplay,
      venue: qnr.venue,
      targetAttendees: qnr.targetAttendees || DEFAULT_PROJECT.targetAttendees || 150,
    });
    if (Array.isArray(qnr.questions) && qnr.questions.length > 0) {
      setQuestions(qnr.questions);
    }
    setEnableSection1(qnr.enableSection1 ?? true);
    setSection1Title(qnr.section1Title || DEFAULT_SECTION1_TITLE);
    setRespondentNameLabel(
      qnr.respondentNameLabel || DEFAULT_RESPONDENT_NAME_LABEL
    );
    setRespondentNamePlaceholder(
      qnr.respondentNamePlaceholder || DEFAULT_RESPONDENT_NAME_PLACEHOLDER
    );
    setRespondentNameRequired(qnr.respondentNameRequired ?? true);
    setEnableGovId(qnr.enableGovId ?? true);
    setGovIdLabel(qnr.govIdLabel || DEFAULT_GOV_ID_LABEL);
    setGovIdPlaceholder(qnr.govIdPlaceholder || DEFAULT_GOV_ID_PLACEHOLDER);
    setGovIdRequired(qnr.govIdRequired ?? false);
    setDemographicCustomFields(
      Array.isArray(qnr.demographicCustomFields)
        ? qnr.demographicCustomFields
        : []
    );

    setEnableSection3(qnr.enableSection3 ?? true);
    setSection3Title(qnr.section3Title || DEFAULT_SECTION3_TITLE);
    setFeedbackItems(
      Array.isArray(qnr.feedbackItems) && qnr.feedbackItems.length > 0
        ? qnr.feedbackItems
        : DEFAULT_FEEDBACK_ITEMS
    );
    setEnableSection4(qnr.enableSection4 ?? true);
    setSection4Title(qnr.section4Title || DEFAULT_SECTION4_TITLE);
    setSection4Description(
      qnr.section4Description || DEFAULT_SECTION4_DESCRIPTION
    );
    setSection4Label(qnr.section4Label || DEFAULT_SECTION4_LABEL);
    setSection4HelperText(
      qnr.section4HelperText || DEFAULT_SECTION4_HELPER_TEXT
    );
  };

  const handleSelectQuestionnaire = (qnr: Questionnaire) => {
    applyQuestionnaire(qnr);
    setScores({});
    setSubmitSuccess(false);
    setViewMode("form");
    window.history.pushState({}, "", `/form?id=${encodeURIComponent(qnr.id)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch all questionnaires + check if ?id= is specified
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get("id");
      const adminParam = params.get("admin");
      setIsAdminPreview(adminParam === "1");

      if (qId) {
        setViewMode("form");
        fetch(`/api/questionnaires?id=${encodeURIComponent(qId)}`)
          .then((res) => res.json() as any)
          .then((data: any) => {
            if (data.questionnaire) {
              applyQuestionnaire(data.questionnaire);
            }
          })
          .catch((e) => console.warn("Failed to fetch questionnaire:", e));
      } else {
        setViewMode("list");
      }
    };

    syncFromUrl();

    fetch("/api/questionnaires")
      .then((res) => res.json() as any)
      .then((data: any) => {
        if (Array.isArray(data.questionnaires)) {
          setAllQuestionnaires(data.questionnaires);
          try {
            localStorage.setItem(
              "govpulse_questionnaires_cache",
              JSON.stringify(data.questionnaires)
            );
          } catch {}
        }
      })
      .catch((e) => console.warn("Failed to fetch questionnaires list:", e))
      .finally(() => setLoadingList(false));

    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // คำนวณความคืบหน้า (Progress) ตามจำนวนข้อคำถามจริงที่แอดมินสร้าง
  const totalQuestions = questions.length || 20;
  const answeredCount = Object.keys(scores).filter((k) => scores[k] > 0).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // ส่งข้อมูลความคืบหน้าขึ้นไปแสดงที่แถบ Header ด้านบน
  useEffect(() => {
    updateProgress(answeredCount, totalQuestions);
  }, [answeredCount, totalQuestions, updateProgress]);

  // เคลียร์แบบร่างเก่าใน localStorage เพื่อให้แบบสอบถามเริ่มต้นว่างเปล่าเสมอ
  useEffect(() => {
    try {
      localStorage.removeItem("govpulse_eval_draft");
    } catch (e) {
      // Ignore in private browsing
    }
  }, []);

  const handleScoreChange = (questionId: number, value: number) => {
    setScores((prev) => ({
      ...prev,
      [`q${questionId}`]: value,
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getDimensionIcon = (id: number) => {
    switch (id) {
      case 1:
        return <BookOpen className="w-4 h-4 text-primary shrink-0" />;
      case 2:
        return <Mic className="w-4 h-4 text-primary shrink-0" />;
      case 3:
        return <Layers className="w-4 h-4 text-primary shrink-0" />;
      case 4:
        return <MapPin className="w-4 h-4 text-primary shrink-0" />;
      case 5:
        return <GraduationCap className="w-4 h-4 text-primary shrink-0" />;
      default:
        return <BookOpen className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enableSection1 && respondentNameRequired && !respondentName.trim()) {
      alert(`กรุณาระบุ ${respondentNameLabel || "ชื่อ - นามสกุล"} ของท่าน`);
      return;
    }

    if (enableSection1 && enableGovId && govIdRequired && !govId.trim()) {
      alert(`กรุณาระบุ ${govIdLabel || "รหัสราชการ"} ของท่าน`);
      return;
    }

    if (enableSection1 && Array.isArray(demographicCustomFields)) {
      for (const field of demographicCustomFields) {
        if (field.required && !demographicValues[field.id]?.trim()) {
          alert(`กรุณาระบุ "${field.label || "ข้อมูลส่วนที่ 1"}" ของท่าน`);
          return;
        }
      }
    }

    if (answeredCount < totalQuestions) {
      const missing = totalQuestions - answeredCount;
      alert(
        `ท่านตอบแบบประเมินไปแล้ว ${answeredCount} จาก ${totalQuestions} ข้อ (ยังคงเหลืออีก ${missing} ข้อ)\nโปรดตรวจสอบและตอบให้ครบทุกข้อก่อนทำการส่งข้อมูลอย่างเป็นทางการ`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackMap: Record<string, string> = { ...feedbackValues };
      if (feedbackStrength) feedbackMap["strength"] = feedbackStrength;
      if (feedbackImprove) feedbackMap["improve"] = feedbackImprove;
      if (feedbackTopics) feedbackMap["topics"] = feedbackTopics;
      if (feedbackOthers) feedbackMap["others"] = feedbackOthers;

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: questionnaireId || project.id || DEFAULT_PROJECT.id,
          cohortId,
          respondentName,
          govId,
          positionLevel,
          scores,
          feedbackStrength,
          feedbackImprove,
          feedbackTopics,
          feedbackOthers,
          feedbackValues: feedbackMap,
          demographicValues,
          attachments,
        }),
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถบันทึกแบบประเมินลงในฐานข้อมูล Cloudflare D1 ได้");
      }

      // ลบแบบร่าง
      localStorage.removeItem("govpulse_eval_draft");
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTab = () => {
    // 1. พยายามปิดแท็บ/หน้าต่างเบราว์เซอร์ทันที
    try {
      window.opener = null;
      window.open("", "_self");
      window.close();
    } catch (e) {
      // ignore
    }

    try {
      window.close();
    } catch (e) {
      // ignore
    }

    // 2. สำหรับ in-app browser เช่น LINE, WeChat
    try {
      // @ts-expect-error WeixinJSBridge
      if (typeof window !== "undefined" && window.WeixinJSBridge) {
        // @ts-expect-error WeixinJSBridge
        window.WeixinJSBridge.call("closeWindow");
      }
    } catch (e) {
      // ignore
    }

    // 3. หากเบราว์เซอร์บล็อกการปิดแท็บด้วยสคริปต์ (เช่น เปิดแท็บมาตรงๆ)
    // ให้นำผู้ใช้กลับสู่หน้าหลัก แทนการเปิดหน้าว่าง about:blank
    setTimeout(() => {
      try {
        if (!window.closed) {
          window.location.href = "/";
        }
      } catch (e) {
        window.location.href = "/";
      }
    }, 200);
  };

  // สร้างรายการหมวดหมู่ตามข้อคำถามจริงของแบบสอบถามชุดนี้ (รองรับการปรับแต่งอิสระ)
  const activeDimensions = Array.from(
    new Map(
      questions.map((q) => {
        const stdDim = DIMENSIONS.find((d) => d.id === q.dimensionId);
        return [
          q.dimensionId,
          {
            id: q.dimensionId,
            title: q.dimensionTitle || stdDim?.title || `หมวดหมู่ที่ ${q.dimensionId}`,
            icon: stdDim?.icon || "fact_check",
          },
        ];
      })
    ).values()
  );

  const getShareUrl = (id?: string) => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/form`;
    const targetId = id || questionnaireId;
    return targetId ? `${base}?id=${encodeURIComponent(targetId)}` : base;
  };

  const handleCopyShareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    showToast("คัดลอกลิงก์สำหรับแชร์แบบสอบถามเรียบร้อยแล้ว!");
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  const handleCopyListLink = (id: string) => {
    const url = getShareUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedListId(id);
    setTimeout(() => setCopiedListId(null), 2500);
  };

  if (viewMode === "list") {
    const filteredList = allQuestionnaires.filter((qnr) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (qnr.title && qnr.title.toLowerCase().includes(q)) ||
        (qnr.courseTitle && qnr.courseTitle.toLowerCase().includes(q)) ||
        (qnr.instructors && qnr.instructors.toLowerCase().includes(q)) ||
        (qnr.department && qnr.department.toLowerCase().includes(q)) ||
        (qnr.id && qnr.id.toLowerCase().includes(q)) ||
        (qnr.venue && qnr.venue.toLowerCase().includes(q))
      );
    });

    return (
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-primary">
                แบบสอบถามประเมินความพึงพอใจทั้งหมด ({allQuestionnaires.length} ชุด)
                {searchQuery.trim() && (
                  <span className="text-xs font-normal text-on-surface-variant ml-2">
                    (พบ {filteredList.length} ชุด)
                  </span>
                )}
              </h1>
              <p className="text-xs text-on-surface-variant">
                เลือกโครงการฝึกอบรมหรือหลักสูตรที่ต้องการทำแบบประเมิน
              </p>
            </div>
          </div>
        </div>

        {/* กล่องค้นหาแบบสอบถาม */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาแบบสอบถาม (ชื่อโครงการ, ชื่อหลักสูตร, วิทยากร, หน่วยงาน, รหัสแบบสอบถาม)..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="ล้างคำค้นหา"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loadingList ? (
          <div className="bg-white border border-outline-variant rounded-xl p-10 text-center text-sm text-on-surface-variant">
            กำลังโหลดรายการแบบสอบถาม...
          </div>
        ) : allQuestionnaires.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-xl p-10 text-center text-sm text-on-surface-variant">
            ยังไม่มีแบบสอบถามในระบบ
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-xl p-10 text-center space-y-3">
            <Search className="w-10 h-10 text-outline mx-auto" />
            <p className="text-sm font-medium text-on-surface">
              ไม่พบแบบสอบถามที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              ล้างคำค้นหา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredList.map((qnr) => (
              <div
                key={qnr.id}
                onClick={() => handleSelectQuestionnaire(qnr)}
                className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20">
                        {qnr.questions.length} ข้อคำถาม
                      </span>
                      <span className="text-[11px] font-semibold bg-surface-container text-on-surface px-2.5 py-0.5 rounded-md border border-outline-variant">
                        ผู้เข้าอบรม: {qnr.targetAttendees || 150} คน
                      </span>
                      <span className="text-xs text-outline">
                        รหัส: {qnr.id}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-primary group-hover:underline leading-snug">
                      {qnr.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-on-surface">
                      หลักสูตร/วิชา: {qnr.courseTitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant pt-1">
                      <span>วิทยากร: {qnr.instructors}</span>
                      <span>•</span>
                      <span>หน่วยงาน: {qnr.department}</span>
                      <span>•</span>
                      <span>
                        วันที่: {qnr.dateDisplay} ({qnr.venue})
                      </span>
                    </div>
                  </div>

                  {/* กล่อง แชร์ และ ดู Dashboard */}
                  <div
                    className="flex flex-wrap items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShareModalQnr(qnr)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>แชร์</span>
                    </button>

                    <Link
                      href={`/dashboard?id=${encodeURIComponent(qnr.id)}`}
                      className="px-4 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>ดู Dashboard</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal แชร์แบบสอบถาม */}
        {shareModalQnr && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-outline-variant shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>แชร์หน้าแบบสอบถาม</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShareModalQnr(null)}
                  className="p-1.5 text-outline hover:text-on-surface rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-primary">
                  {shareModalQnr.title}
                </div>
                <div className="text-xs text-on-surface-variant">
                  วิชา: {shareModalQnr.courseTitle}
                </div>
              </div>

              <div className="bg-surface-container-low/50 border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    getShareUrl(shareModalQnr.id)
                  )}`}
                  alt="QR Code สำหรับแชร์แบบสอบถาม"
                  className="w-40 h-40 rounded-lg border border-outline-variant bg-white p-2"
                />
                <span className="text-[11px] text-outline">
                  สแกน QR Code เพื่อเข้าสู่หน้าแบบสอบถามนี้โดยตรง
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  ลิงก์สำหรับแชร์:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl(shareModalQnr.id)}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-outline-variant rounded-lg bg-surface-container-low/40 text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyListLink(shareModalQnr.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {copiedListId === shareModalQnr.id ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = shareModalQnr;
                    setShareModalQnr(null);
                    handleSelectQuestionnaire(target);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดดูหน้าแบบสอบถาม</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareModalQnr(null)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* แถบเครื่องมือแชร์และจัดการแบบสอบถาม (แสดงเมื่อสร้างเสร็จหรือเปิดจากหน้า Admin) */}
      {isAdminPreview && (
        <div className="bg-white border-2 border-primary/30 rounded-xl p-5 shadow-sm space-y-4 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">
                  หน้าแบบสอบถามพร้อมใช้งานและแชร์ได้ทันที!
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  คัดลอกลิงก์ด้านล่างเพื่อส่งต่อให้ผู้เข้าอบรมทำแบบประเมิน หรือกดปรับแต่งและสร้างแบบสอบถามอันใหม่ได้ตลอดเวลา
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin?edit=${encodeURIComponent(questionnaireId)}`}
                className="px-3.5 py-2 border border-outline-variant hover:border-primary text-primary bg-white hover:bg-red-50/40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>ปรับแต่งแบบสอบถามนี้</span>
              </Link>
              <Link
                href="/admin?mode=create"
                className="px-3.5 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ สร้างแบบสอบถามอันใหม่</span>
              </Link>
              <Link
                href="/admin"
                className="px-3.5 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-low rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4" />
                <span>หน้ารวมแบบสอบถาม</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-outline-variant/60">
            <div className="flex-1 bg-surface-container-low/50 border border-outline-variant rounded-lg px-3.5 py-2 text-xs font-mono text-on-surface truncate flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{getShareUrl()}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedShareLink ? (
                <Check className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>{copiedShareLink ? "คัดลอกลิงก์แล้ว!" : "คัดลอกลิงก์แชร์แบบสอบถาม"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-8 border border-outline-variant shadow-2xl text-center space-y-5 relative">
            <button
              type="button"
              onClick={handleCloseTab}
              className="absolute top-4 right-4 p-1.5 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
              title="ปิดแท็บนี้"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">
                บันทึกแบบประเมินสำเร็จ
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                ระบบได้รับข้อมูลแบบประเมินความพึงพอใจเรียบร้อยแล้ว ขอขอบพระคุณสำหรับความร่วมมือในการพัฒนาองค์กร
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCloseTab}
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-[#991b1b] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>ปิดหน้านี้ / ออกจากระบบ</span>
              </button>
              <p className="text-[11px] text-outline">
                กดปุ่มเพื่อปิดแท็บนี้และออกจากหน้าแบบประเมินทันที
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. PROJECT HEADER DETAILS CARD - กล่องสีขาว ตัวหนังสือสีแดงเข้มและเทาเข้ม สะอาดตา */}
        <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-primary">
                ข้อมูลโครงการฝึกอบรมที่รับการประเมิน
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-lg border border-outline-variant hover:border-primary text-primary hover:bg-red-50/40 text-xs font-semibold flex items-center gap-1.5 transition-colors no-print cursor-pointer"
              title="คัดลอกลิงก์เพื่อแชร์หน้าแบบสอบถามนี้"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShareLink ? "คัดลอกลิงก์แล้ว" : "แชร์แบบสอบถาม"}</span>
            </button>
          </div>

          {/* แถวที่ 1: โครงการฝึกอบรม & หลักสูตร/วิชา */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                โครงการฝึกอบรม
              </span>
              <div className="text-sm sm:text-base font-bold text-primary leading-snug">
                {project.title}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                หลักสูตร / วิชา
              </span>
              <div className="text-sm sm:text-base font-bold text-primary leading-snug">
                {project.courseTitle || "การประยุกต์ใช้เทคโนโลยีปัญญาประดิษฐ์ในงานภาครัฐ (Generative AI in Practice)"}
              </div>
            </div>
          </div>

          {/* แถวที่ 2: วิทยากร, หน่วยงานผู้จัด, วันที่และสถานที่จัด, จำนวนผู้เข้าอบรม */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-primary shrink-0" />
                วิทยากร
              </span>
              <div className="text-sm font-bold text-on-surface">
                {project.instructors || "ดร.ธีรพงศ์ อนันตโภคิน และคณะ"}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                หน่วยงานผู้จัด
              </span>
              <div className="text-sm font-semibold text-on-surface">
                {project.department}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                วันที่และสถานที่จัด
              </span>
              <div className="text-sm font-semibold text-on-surface">
                {project.dateDisplay || "15 - 17 พฤษภาคม 2567"}
              </div>
              <div className="text-xs text-on-surface-variant truncate mt-0.5">
                {project.venue || "ห้องประชุมจิตรลดา โรงแรมเซ็นทารา แกรนด์ฯ"}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-outline mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary shrink-0" />
                จำนวนผู้เข้าอบรม
              </span>
              <div className="text-sm font-bold text-primary">
                {project.targetAttendees || 150} คน
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION 1: RESPONDENT DEMOGRAPHICS */}
        {enableSection1 && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-base font-bold text-primary">
                {section1Title || "ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบประเมิน"}
              </h2>
            </div>

            <div
              className={`grid grid-cols-1 ${
                enableGovId ? "md:grid-cols-2" : ""
              } gap-4`}
            >
              {/* Full Name */}
              <div>
                <label
                  className="block text-xs font-semibold text-on-surface mb-1"
                  htmlFor="resp_fullname"
                >
                  {respondentNameLabel || "ชื่อ – นามสกุล"}
                  {respondentNameRequired && (
                    <span className="text-error"> *</span>
                  )}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-outline pointer-events-none" />
                  <input
                    id="resp_fullname"
                    type="text"
                    required={respondentNameRequired}
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder={respondentNamePlaceholder || ""}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-hidden focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Government ID */}
              {enableGovId && (
                <div>
                  <label
                    className="block text-xs font-semibold text-on-surface mb-1"
                    htmlFor="resp_gov_id"
                  >
                    {govIdLabel || "รหัสราชการ (ถ้ามี)"}
                    {govIdRequired && <span className="text-error"> *</span>}
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-outline pointer-events-none" />
                    <input
                      id="resp_gov_id"
                      type="text"
                      required={govIdRequired}
                      value={govId}
                      onChange={(e) => setGovId(e.target.value)}
                      placeholder={govIdPlaceholder || ""}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-hidden focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                </div>
              )}

              {/* Custom Demographic Fields */}
              {demographicCustomFields.map((field) => (
                <div key={field.id}>
                  <label
                    className="block text-xs font-semibold text-on-surface mb-1"
                    htmlFor={`resp_${field.id}`}
                  >
                    {field.label}
                    {field.required && <span className="text-error"> *</span>}
                  </label>
                  <div className="relative">
                    <input
                      id={`resp_${field.id}`}
                      type="text"
                      required={field.required}
                      value={demographicValues[field.id] || ""}
                      onChange={(e) =>
                        setDemographicValues((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder || ""}
                      className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-hidden focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. SECTION 2: SATISFACTION EVALUATION MATRIX (20 QUESTIONS) */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-primary">
                ส่วนที่ 2 การประเมินความพึงพอใจต่อโครงการ
              </h2>
              <p className="text-xs text-outline">
                ตารางระดับความพึงพอใจ • โปรดเลือกคะแนนเพียง 1 ระดับในแต่ละข้อ
              </p>
            </div>
          </div>

          {/* 1. DESKTOP VIEW: Table Matrix (แสดงเฉพาะหน้าจอ Tablet & Desktop ≥ 768px) */}
          <div className="hidden md:block overflow-x-auto border border-outline-variant rounded-lg bg-surface-container-lowest shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[760px] table-fixed">
              <colgroup>
                <col className="w-16" />
                <col />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-20" />
                <col className="w-20" />
              </colgroup>
              <thead>
                <tr className="bg-surface-container-low border-b-2 border-outline-variant text-on-surface text-xs font-semibold">
                  <th className="py-3 px-3 text-center">ลำดับ</th>
                  <th className="py-3 px-4">รายการประเมิน</th>
                  {[5, 4, 3, 2, 1].map((val) => (
                    <th
                      key={val}
                      className={`py-3 px-2 text-center text-xs ${
                        val === 5 ? "bg-surface-container" : ""
                      }`}
                    >
                      <span className="block text-primary font-bold text-sm">
                        {val}
                      </span>
                      <span className="text-[10px] text-outline font-normal">
                        {val === 5
                          ? "มากที่สุด"
                          : val === 4
                          ? "มาก"
                          : val === 3
                          ? "ปานกลาง"
                          : val === 2
                          ? "น้อย"
                          : "น้อยที่สุด"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60 text-xs">
                {activeDimensions.map((dim) => {
                  const dimQuestions = questions.filter(
                    (q) => q.dimensionId === dim.id
                  );
                  if (dimQuestions.length === 0) return null;
                  return (
                    <Fragment key={dim.id}>
                      {/* Dimension Group Header */}
                      <tr className="bg-surface-container-high/70 text-primary font-bold text-xs">
                        <td colSpan={7} className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {getDimensionIcon(dim.id)}
                            <span>{dim.title}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Question Rows */}
                      {dimQuestions.map((q) => {
                        const currentVal = scores[`q${q.id}`];
                        return (
                          <tr
                            key={q.id}
                            className="hover:bg-surface-container-low transition-colors"
                          >
                            <td className="py-3 px-3 text-center text-outline font-medium tabular-nums">
                              {q.id}
                            </td>
                            <td className="py-3 px-4 text-on-surface leading-relaxed">
                              {q.text}
                            </td>
                            {[5, 4, 3, 2, 1].map((score) => (
                              <td
                                key={score}
                                className={`py-3 px-2 text-center cursor-pointer transition-colors ${
                                  score === 5 ? "bg-surface-container/30" : ""
                                } hover:bg-surface-container`}
                                onClick={() => handleScoreChange(q.id, score)}
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={`q${q.id}`}
                                    value={score}
                                    checked={currentVal === score}
                                    onChange={() => handleScoreChange(q.id, score)}
                                    className="w-5 h-5 text-primary border-outline focus:ring-secondary cursor-pointer"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW: Touch-Friendly Segmented Cards (แสดงเฉพาะมือถือ < 768px ไม่ต้องเลื่อนแนวนอน) */}
          <div className="block md:hidden space-y-5">
            {activeDimensions.map((dim) => {
              const dimQuestions = questions.filter(
                (q) => q.dimensionId === dim.id
              );
              if (dimQuestions.length === 0) return null;
              return (
                <div key={dim.id} className="space-y-3">
                  {/* Dimension Section Header for Mobile */}
                  <div className="bg-surface-container-high/90 text-primary p-3 rounded-lg flex items-center gap-2 font-bold text-xs border border-outline-variant">
                    {getDimensionIcon(dim.id)}
                    <span>{dim.title}</span>
                  </div>

                  {/* Question Cards Stream */}
                  <div className="space-y-3">
                    {dimQuestions.map((q) => {
                      const currentVal = scores[`q${q.id}`];
                      return (
                        <div
                          key={q.id}
                          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs space-y-3"
                        >
                          {/* Question Number & Text */}
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-primary-container text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {q.id}
                            </span>
                            <p className="text-xs font-semibold text-on-surface leading-relaxed">
                              {q.text}
                            </p>
                          </div>

                          {/* 5 Segmented Buttons (Touch-Friendly Chips) */}
                          <div className="grid grid-cols-5 gap-1.5 pt-1">
                            {[
                              { score: 5, label: "มากที่สุด" },
                              { score: 4, label: "มาก" },
                              { score: 3, label: "ปานกลาง" },
                              { score: 2, label: "น้อย" },
                              { score: 1, label: "น้อยที่สุด" },
                            ].map(({ score, label }) => {
                              const isSelected = currentVal === score;
                              return (
                                <button
                                  key={score}
                                  type="button"
                                  onClick={() => handleScoreChange(q.id, score)}
                                  className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                                    isSelected
                                      ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20 scale-[1.03]"
                                      : "bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container-low"
                                  }`}
                                >
                                  <span
                                    className={`text-base font-bold ${
                                      isSelected ? "text-white" : "text-primary"
                                    }`}
                                  >
                                    {score}
                                  </span>
                                  <span
                                    className={`text-[9px] leading-tight ${
                                      isSelected ? "text-red-100" : "text-outline"
                                    }`}
                                  >
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. SECTION 3: QUALITATIVE RECOMMENDATIONS (รองรับการปรับแต่งจากหน้า Admin) */}
        {enableSection3 && feedbackItems.length > 0 && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h2 className="text-base font-bold text-primary">
                {section3Title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackItems.map((item, idx) => {
                const val =
                  item.id === "strength"
                    ? feedbackStrength
                    : item.id === "improve"
                    ? feedbackImprove
                    : item.id === "topics"
                    ? feedbackTopics
                    : item.id === "others"
                    ? feedbackOthers
                    : feedbackValues[item.id] || "";

                const handleChange = (newVal: string) => {
                  if (item.id === "strength") setFeedbackStrength(newVal);
                  else if (item.id === "improve") setFeedbackImprove(newVal);
                  else if (item.id === "topics") setFeedbackTopics(newVal);
                  else if (item.id === "others") setFeedbackOthers(newVal);
                  setFeedbackValues((prev) => ({ ...prev, [item.id]: newVal }));
                };

                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg border border-outline-variant"
                  >
                    <label
                      className="block text-xs font-semibold text-on-surface mb-2 flex items-center gap-1.5"
                      htmlFor={`feedback_${item.id}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span>
                        {idx + 1}. {item.label}
                      </span>
                    </label>
                    <textarea
                      id={`feedback_${item.id}`}
                      rows={3}
                      value={val}
                      onChange={(e) => handleChange(e.target.value)}
                      maxLength={500}
                      placeholder={item.placeholder}
                      className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-hidden focus:border-secondary focus:ring-1 focus:ring-secondary resize-none"
                    />
                    <div className="text-right text-[11px] text-outline mt-1">
                      {val.length}/500 ตัวอักษร
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. SECTION 4: LINK / FILE ATTACHMENTS (รองรับลิงก์จากหน้า Admin) */}
        {enableSection4 && (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <div>
                <h2 className="text-base font-bold text-primary">
                  {section4Title}
                </h2>
                <p className="text-xs text-outline">{section4Description}</p>
              </div>
            </div>

            {section4Label && (
              <div className="text-xs font-semibold text-on-surface">
                {section4Label}
              </div>
            )}

            {section4HelperText &&
            section4HelperText !==
              "ไฟล์จะถูกจัดเก็บอย่างปลอดภัย พร้อมระบบการเข้ารหัส" ? (
              <a
                href={
                  section4HelperText.startsWith("http")
                    ? section4HelperText
                    : `https://${section4HelperText}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block border-2 border-dashed border-primary/40 hover:border-primary rounded-xl p-6 text-center bg-surface-container-low/20 hover:bg-red-50/30 transition-all space-y-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary group-hover:underline">
                  คลิกเพื่อเปิดลิงก์เอกสารและรูปภาพ
                </div>
                <div className="text-xs text-on-surface-variant font-mono break-all">
                  {section4HelperText}
                </div>
              </a>
            ) : (
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface-container-low/20 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary">
                  แนบลิงก์เอกสารและรูปภาพ (Link URL)
                </div>
                <div className="max-w-lg mx-auto">
                  <input
                    type="url"
                    value={feedbackValues["attachment_link"] || ""}
                    onChange={(e) => {
                      const linkVal = e.target.value;
                      setFeedbackValues((prev) => ({
                        ...prev,
                        attachment_link: linkVal,
                      }));
                      setAttachments(
                        linkVal.trim()
                          ? [
                              {
                                fileName: linkVal.trim(),
                                r2Key: linkVal.trim(),
                                fileUrl: linkVal.trim(),
                                fileType: "link",
                                fileSize: 0,
                                category: "certificate",
                              },
                            ]
                          : []
                      );
                    }}
                    placeholder="วางลิงก์ (URL) ที่นี่ เช่น https://drive.google.com/..."
                    className="w-full px-3.5 py-2 text-xs text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* 7. ACTION BUTTONS BAR - กล่องส่งแบบประเมิน สีขาว */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center gap-3.5 shadow-xs">
          {/* สถานะความพร้อมในการส่งแบบประเมิน */}
          <div className="flex items-center gap-2 text-xs">
            {answeredCount === totalQuestions && respondentName.trim() ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                ตอบครบถ้วนทุกข้อแล้ว ({answeredCount}/{totalQuestions} ข้อ) พร้อมส่งแบบประเมิน
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <span>ตอบไปแล้ว {answeredCount}/{totalQuestions} ข้อ</span>
                {totalQuestions - answeredCount > 0 && (
                  <span className="font-semibold text-amber-900">
                    (ยังเหลืออีก {totalQuestions - answeredCount} ข้อ)
                  </span>
                )}
                {!respondentName.trim() && (
                  <span className="text-red-700 font-semibold">• ยังไม่ได้ระบุชื่อผู้ประเมิน</span>
                )}
              </span>
            )}
          </div>

          {/* ปุ่มส่งแบบประเมิน */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="w-full sm:w-auto px-10 py-3 rounded-lg bg-primary hover:bg-[#991b1b] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting ? "กำลังบันทึกข้อมูลลงฐานข้อมูล..." : "ส่งแบบประเมินความพึงพอใจ"}
            </span>
          </button>

          {/* ข้อความยืนยันการบันทึกครั้งเดียว */}
          <p className="text-[11px] text-on-surface-variant text-center max-w-md leading-relaxed">
            ระบบจะทำการบันทึกข้อมูลทั้งหมดลงฐานข้อมูล Cloudflare D1 ในคราวเดียวเมื่อกดปุ่มนี้เท่านั้น (ระหว่างทำแบบประเมินจะไม่มีการส่งข้อมูลใด ๆ)
          </p>
        </div>
      </form>
    </div>
  );
}
