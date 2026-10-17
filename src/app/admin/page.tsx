"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Copy,
  Share2,
  FilePlus2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  RotateCcw,
  Search,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  BarChart3,
  Link as LinkIcon,
  User,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  DEFAULT_PROJECT,
  DIMENSIONS,
  EVALUATION_QUESTIONS,
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
  Questionnaire,
  QuestionItem,
  FeedbackFieldItem,
  DemographicFieldItem,
} from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();

  // Mode: "list" (หน้าหลักกล่องสร้างแบบสอบถาม + รายการที่สร้างแล้ว) | "builder" (หน้าใส่รายละเอียดทั้งหมด)
  const [mode, setMode] = useState<"list" | "builder">("list");
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
  const [loading, setLoading] = useState<boolean>(() => {
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
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state (null = สร้างใหม่, string = แก้ไขแบบสอบถามเดิม)
  const [editingQnrId, setEditingQnrId] = useState<string | null>(null);

  // Builder Form States (รายละเอียดทั้งหมดของแบบสอบถาม)
  const [title, setTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState("");
  const [department, setDepartment] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");
  const [venue, setVenue] = useState("");
  const [targetAttendees, setTargetAttendees] = useState("150");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Section 1 (Demographics / General Info) States
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

  const handleAddDemographicField = () => {
    const newId = `field_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .substring(2, 5)}`;
    setDemographicCustomFields((prev) => [
      ...prev,
      {
        id: newId,
        label: "",
        placeholder: "",
        required: false,
      },
    ]);
  };

  const handleUpdateDemographicField = (
    id: string,
    key: "label" | "placeholder" | "required",
    value: any
  ) => {
    setDemographicCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleRemoveDemographicField = (id: string) => {
    setDemographicCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleResetSection1 = () => {
    setEnableSection1(true);
    setSection1Title(DEFAULT_SECTION1_TITLE);
    setRespondentNameLabel(DEFAULT_RESPONDENT_NAME_LABEL);
    setRespondentNamePlaceholder(DEFAULT_RESPONDENT_NAME_PLACEHOLDER);
    setRespondentNameRequired(true);
    setEnableGovId(true);
    setGovIdLabel(DEFAULT_GOV_ID_LABEL);
    setGovIdPlaceholder(DEFAULT_GOV_ID_PLACEHOLDER);
    setGovIdRequired(false);
    setDemographicCustomFields([]);
  };

  // Section 3 (Qualitative Feedback) States
  const [enableSection3, setEnableSection3] = useState(true);
  const [section3Title, setSection3Title] = useState(DEFAULT_SECTION3_TITLE);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackFieldItem[]>(
    DEFAULT_FEEDBACK_ITEMS.map((item) => ({ ...item }))
  );

  // Section 4 (File Attachments) States
  const [enableSection4, setEnableSection4] = useState(true);
  const [section4Title, setSection4Title] = useState(DEFAULT_SECTION4_TITLE);
  const [section4Description, setSection4Description] = useState(
    DEFAULT_SECTION4_DESCRIPTION
  );
  const [section4Label, setSection4Label] = useState(DEFAULT_SECTION4_LABEL);
  const [section4HelperText, setSection4HelperText] = useState(
    DEFAULT_SECTION4_HELPER_TEXT
  );

  // Saving & UI Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalQnr, setShareModalQnr] = useState<Questionnaire | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchQuestionnaires().then((list) => {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      const editId = params.get("edit");

      if (modeParam === "create") {
        startCreateNew();
      } else if (editId) {
        const target = list.find((q) => q.id === editId);
        if (target) {
          startEditQuestionnaire(target);
        } else {
          // ดึงข้อมูลเฉพาะ ID หากเป็นแบบสอบถามเริ่มต้น
          fetch(`/api/questionnaires?id=${encodeURIComponent(editId)}`)
            .then((r) => r.json())
            .then((d: any) => {
              if (d.questionnaire) startEditQuestionnaire(d.questionnaire);
            });
        }
      }
    });
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === "Techno@1711") {
      setIsAuthenticated(true);
      setPasswordError("");
      sessionStorage.setItem("admin_authenticated", "true");
    } else {
      setPasswordError("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setPasswordInput("");
    setPasswordError("");
  };

  const fetchQuestionnaires = async (): Promise<Questionnaire[]> => {
    // Only show blocking loading state if no cached data exists
    setQuestionnaires((prev) => {
      if (prev.length === 0) setLoading(true);
      return prev;
    });
    try {
      const res = await fetch("/api/questionnaires");
      if (res.ok) {
        const data = (await res.json()) as any;
        const list = data.questionnaires || [];
        setQuestionnaires(list);
        try {
          localStorage.setItem("govpulse_questionnaires_cache", JSON.stringify(list));
        } catch {}
        return list;
      }
    } catch (err) {
      console.error("Failed to fetch questionnaires:", err);
    } finally {
      setLoading(false);
    }
    return [];
  };

  // เริ่มสร้างแบบสอบถามใหม่
  const startCreateNew = () => {
    setEditingQnrId(null);
    setTitle(DEFAULT_PROJECT.title);
    setCourseTitle(
      DEFAULT_PROJECT.courseTitle ||
        "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)"
    );
    setInstructors(DEFAULT_PROJECT.instructors);
    setDepartment(DEFAULT_PROJECT.department);
    setDateDisplay("15 - 17 พฤษภาคม 2567");
    setVenue(DEFAULT_PROJECT.venue);
    setTargetAttendees(String(DEFAULT_PROJECT.targetAttendees || 150));
    setEnableSection1(true);
    setSection1Title(DEFAULT_SECTION1_TITLE);
    setRespondentNameLabel(DEFAULT_RESPONDENT_NAME_LABEL);
    setRespondentNamePlaceholder(DEFAULT_RESPONDENT_NAME_PLACEHOLDER);
    setRespondentNameRequired(true);
    setEnableGovId(true);
    setGovIdLabel(DEFAULT_GOV_ID_LABEL);
    setGovIdPlaceholder(DEFAULT_GOV_ID_PLACEHOLDER);
    setGovIdRequired(false);
    setDemographicCustomFields([]);
    setQuestions(EVALUATION_QUESTIONS.map((q) => ({ ...q })));
    setEnableSection3(true);
    setSection3Title(DEFAULT_SECTION3_TITLE);
    setFeedbackItems(DEFAULT_FEEDBACK_ITEMS.map((item) => ({ ...item })));
    setEnableSection4(true);
    setSection4Title(DEFAULT_SECTION4_TITLE);
    setSection4Description(DEFAULT_SECTION4_DESCRIPTION);
    setSection4Label(DEFAULT_SECTION4_LABEL);
    setSection4HelperText(DEFAULT_SECTION4_HELPER_TEXT);
    setMode("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // เริ่มสร้างจากหน้าว่าง (ให้กรอกใหม่เอง)
  const handleClearHeaderFields = () => {
    setTitle("");
    setCourseTitle("");
    setInstructors("");
    setDepartment("");
    setDateDisplay("");
    setVenue("");
    setTargetAttendees("");
  };

  // เติมข้อมูลตัวอย่าง
  const handleFillSampleHeader = () => {
    setTitle(DEFAULT_PROJECT.title);
    setCourseTitle(
      DEFAULT_PROJECT.courseTitle ||
        "เทคโนโลยีปัญญาประดิษฐ์และการประยุกต์ใช้ในงานภาครัฐ (Generative AI in Practice)"
    );
    setInstructors(DEFAULT_PROJECT.instructors);
    setDepartment(DEFAULT_PROJECT.department);
    setDateDisplay("15 - 17 พฤษภาคม 2567");
    setVenue(DEFAULT_PROJECT.venue);
    setTargetAttendees(String(DEFAULT_PROJECT.targetAttendees || 150));
  };

  // เปิดหน้าแก้ไขแบบสอบถามเดิม
  const startEditQuestionnaire = (qnr: Questionnaire) => {
    setEditingQnrId(qnr.id);
    setTitle(qnr.title);
    setCourseTitle(qnr.courseTitle);
    setInstructors(qnr.instructors);
    setDepartment(qnr.department);
    setDateDisplay(qnr.dateDisplay);
    setVenue(qnr.venue);
    setTargetAttendees(String(qnr.targetAttendees || 150));
    setEnableSection1(qnr.enableSection1 ?? true);
    setSection1Title(qnr.section1Title || DEFAULT_SECTION1_TITLE);
    setRespondentNameLabel(
      qnr.respondentNameLabel || DEFAULT_RESPONDENT_NAME_LABEL
    );
    setRespondentNamePlaceholder(qnr.respondentNamePlaceholder ?? "");
    setRespondentNameRequired(qnr.respondentNameRequired ?? true);
    setEnableGovId(qnr.enableGovId ?? true);
    setGovIdLabel(qnr.govIdLabel || DEFAULT_GOV_ID_LABEL);
    setGovIdPlaceholder(qnr.govIdPlaceholder ?? "");
    setGovIdRequired(qnr.govIdRequired ?? false);
    setDemographicCustomFields(
      Array.isArray(qnr.demographicCustomFields)
        ? qnr.demographicCustomFields.map((f) => ({ ...f }))
        : []
    );
    setQuestions(qnr.questions.map((q) => ({ ...q })));
    setEnableSection3(qnr.enableSection3 ?? true);
    setSection3Title(qnr.section3Title || DEFAULT_SECTION3_TITLE);
    setFeedbackItems(
      Array.isArray(qnr.feedbackItems) && qnr.feedbackItems.length > 0
        ? qnr.feedbackItems.map((item) => ({ ...item }))
        : DEFAULT_FEEDBACK_ITEMS.map((item) => ({ ...item }))
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
    setMode("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // คัดลอกแบบสอบถามเดิมเพื่อสร้างเป็นอันใหม่
  const handleDuplicateQuestionnaire = (qnr: Questionnaire) => {
    setEditingQnrId(null);
    setTitle(`${qnr.title} (ชุดใหม่)`);
    setCourseTitle(qnr.courseTitle);
    setInstructors(qnr.instructors);
    setDepartment(qnr.department);
    setDateDisplay(qnr.dateDisplay);
    setVenue(qnr.venue);
    setTargetAttendees(String(qnr.targetAttendees || 150));
    setEnableSection1(qnr.enableSection1 ?? true);
    setSection1Title(qnr.section1Title || DEFAULT_SECTION1_TITLE);
    setRespondentNameLabel(
      qnr.respondentNameLabel || DEFAULT_RESPONDENT_NAME_LABEL
    );
    setRespondentNamePlaceholder(qnr.respondentNamePlaceholder ?? "");
    setRespondentNameRequired(qnr.respondentNameRequired ?? true);
    setEnableGovId(qnr.enableGovId ?? true);
    setGovIdLabel(qnr.govIdLabel || DEFAULT_GOV_ID_LABEL);
    setGovIdPlaceholder(qnr.govIdPlaceholder ?? "");
    setGovIdRequired(qnr.govIdRequired ?? false);
    setDemographicCustomFields(
      Array.isArray(qnr.demographicCustomFields)
        ? qnr.demographicCustomFields.map((f) => ({ ...f }))
        : []
    );
    setQuestions(qnr.questions.map((q) => ({ ...q })));
    setEnableSection3(qnr.enableSection3 ?? true);
    setSection3Title(qnr.section3Title || DEFAULT_SECTION3_TITLE);
    setFeedbackItems(
      Array.isArray(qnr.feedbackItems) && qnr.feedbackItems.length > 0
        ? qnr.feedbackItems.map((item) => ({ ...item }))
        : DEFAULT_FEEDBACK_ITEMS.map((item) => ({ ...item }))
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
    setMode("builder");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ลบแบบสอบถาม
  const handleDeleteQuestionnaire = async (id: string) => {
    if (!confirm("ต้องการลบแบบสอบถามชุดนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/questionnaires?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestionnaires((prev) => {
          const updated = prev.filter((q) => q.id !== id);
          try {
            localStorage.setItem("govpulse_questionnaires_cache", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบแบบสอบถาม");
    }
  };

  // การจัดการหมวดหมู่และข้อคำถามใน Builder
  const builderDimensions = Array.from(
    new Map(
      questions.map((q) => [
        q.dimensionId,
        {
          id: q.dimensionId,
          title: q.dimensionTitle,
        },
      ])
    ).values()
  );

  // แก้ไขชื่อหมวดหมู่
  const handleUpdateDimensionTitle = (dimId: number, newTitle: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.dimensionId === dimId ? { ...q, dimensionTitle: newTitle } : q
      )
    );
  };

  // เพิ่มหมวดหมู่ใหม่
  const handleAddDimension = () => {
    const nextDimId =
      builderDimensions.length > 0
        ? Math.max(...builderDimensions.map((d) => d.id)) + 1
        : 1;
    const nextQId =
      questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;

    const newDimTitle = `2.${nextDimId} หมวดหมู่การประเมินด้านใหม่`;
    setQuestions((prev) => [
      ...prev,
      {
        id: nextQId,
        dimensionId: nextDimId,
        dimensionTitle: newDimTitle,
        text: "ระบุข้อความคำถามประเมินความพึงพอใจ...",
      },
    ]);
  };

  // ลบหมวดหมู่ทั้งหมวด
  const handleDeleteDimension = (dimId: number) => {
    if (builderDimensions.length <= 1) {
      alert("ต้องมีหมวดหมู่คำถามอย่างน้อย 1 หมวดหมู่");
      return;
    }
    if (!confirm("ต้องการลบหมวดหมู่นี้และคำถามทั้งหมดในหมวดนี้ใช่หรือไม่?")) return;
    setQuestions((prev) =>
      prev
        .filter((q) => q.dimensionId !== dimId)
        .map((q, idx) => ({ ...q, id: idx + 1 }))
    );
  };

  // เพิ่มข้อคำถามในหมวดหมู่
  const handleAddQuestionToDimension = (dimId: number, dimTitle: string) => {
    const nextQId =
      questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    setQuestions((prev) => [
      ...prev,
      {
        id: nextQId,
        dimensionId: dimId,
        dimensionTitle: dimTitle,
        text: "",
      },
    ]);
  };

  // แก้ไขข้อความคำถาม
  const handleQuestionTextChange = (qId: number, newText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: newText } : q))
    );
  };

  // ลบข้อคำถาม
  const handleRemoveQuestion = (qId: number) => {
    if (questions.length <= 1) {
      alert("แบบสอบถามต้องมีอย่างน้อย 1 ข้อคำถาม");
      return;
    }
    setQuestions((prev) =>
      prev.filter((q) => q.id !== qId).map((q, idx) => ({ ...q, id: idx + 1 }))
    );
  };

  // คืนค่าคำถามมาตรฐาน 20 ข้อ
  const handleResetStandardQuestions = () => {
    setQuestions(EVALUATION_QUESTIONS.map((q) => ({ ...q })));
  };

  // จัดการหัวข้อข้อเสนอแนะเพิ่มเติม (ส่วนที่ 3)
  const handleAddFeedbackItem = () => {
    const newId = `fb-${Date.now().toString(36)}`;
    setFeedbackItems((prev) => [
      ...prev,
      {
        id: newId,
        label: "หัวข้อข้อเสนอแนะใหม่",
        placeholder: "",
      },
    ]);
  };

  const handleUpdateFeedbackItem = (
    id: string,
    field: "label" | "placeholder",
    value: string
  ) => {
    setFeedbackItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveFeedbackItem = (id: string) => {
    setFeedbackItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetFeedbackItems = () => {
    setEnableSection3(true);
    setSection3Title(DEFAULT_SECTION3_TITLE);
    setFeedbackItems(DEFAULT_FEEDBACK_ITEMS.map((item) => ({ ...item })));
  };

  // เมื่อกดปุ่ม OK เพื่อบันทึกและสร้างหน้าแบบสอบถามใหม่
  const handleSubmitBuilder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !courseTitle.trim()) {
      alert("กรุณากรอก ชื่อโครงการฝึกอบรม และ หลักสูตร / วิชา");
      return;
    }

    const cleanedQuestions = questions
      .map((q) => ({ ...q, text: q.text.trim() }))
      .filter((q) => q.text.length > 0)
      .map((q, idx) => ({ ...q, id: idx + 1 }));

    if (cleanedQuestions.length === 0) {
      alert("กรุณาระบุข้อคำถามอย่างน้อย 1 ข้อ");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editingQnrId || undefined,
        title: title.trim(),
        courseTitle: courseTitle.trim(),
        instructors: instructors.trim() || "-",
        department: department.trim() || "-",
        dateDisplay: dateDisplay.trim() || "-",
        venue: venue.trim() || "-",
        targetAttendees: targetAttendees.trim() ? Number(targetAttendees) : 150,
        enableSection1,
        section1Title: section1Title.trim() || DEFAULT_SECTION1_TITLE,
        respondentNameLabel:
          respondentNameLabel.trim() || DEFAULT_RESPONDENT_NAME_LABEL,
        respondentNamePlaceholder:
          respondentNamePlaceholder.trim() ||
          DEFAULT_RESPONDENT_NAME_PLACEHOLDER,
        respondentNameRequired,
        enableGovId,
        govIdLabel: govIdLabel.trim() || DEFAULT_GOV_ID_LABEL,
        govIdPlaceholder:
          govIdPlaceholder.trim() || DEFAULT_GOV_ID_PLACEHOLDER,
        govIdRequired,
        demographicCustomFields: demographicCustomFields
          .map((f) => ({
            ...f,
            label: f.label.trim(),
            placeholder: (f.placeholder || "").trim(),
          }))
          .filter((f) => f.label.length > 0),
        questions: cleanedQuestions,
        enableSection3,
        section3Title: section3Title.trim() || DEFAULT_SECTION3_TITLE,
        feedbackItems: feedbackItems.filter((f) => f.label.trim().length > 0),
        enableSection4,
        section4Title: section4Title.trim() || DEFAULT_SECTION4_TITLE,
        section4Description:
          section4Description.trim() || DEFAULT_SECTION4_DESCRIPTION,
        section4Label: section4Label.trim() || DEFAULT_SECTION4_LABEL,
        section4HelperText:
          section4HelperText.trim() || DEFAULT_SECTION4_HELPER_TEXT,
      };

      const isUpdatingExisting =
        editingQnrId && questionnaires.some((q) => q.id === editingQnrId);

      const res = await fetch("/api/questionnaires", {
        method: isUpdatingExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถบันทึกแบบสอบถามได้");
      }

      const data = (await res.json()) as any;
      const savedQnr: Questionnaire = data.questionnaire;

      // เมื่อกด OK เสร็จ พาไปหน้าแบบสอบถามที่สร้างขึ้นมาใหม่ทันที พร้อมแถบแชร์ลิงก์!
      router.push(`/form?id=${encodeURIComponent(savedQnr.id)}&admin=1`);
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการสร้างแบบสอบถาม");
    } finally {
      setIsSaving(false);
    }
  };

  const getShareUrl = (id: string) => {
    if (typeof window === "undefined") return `/form?id=${id}`;
    return `${window.location.origin}/form?id=${encodeURIComponent(id)}`;
  };

  const handleCopyLink = (id: string) => {
    const url = getShareUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // ============================================================================
  // AUTHENTICATION VIEW: หากยังไม่ผ่านการตรวจสอบรหัสผ่าน
  // ============================================================================
  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-primary shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              เข้าสู่ระบบผู้ดูแลระบบ
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              หน้านี้จำกัดสิทธิ์เฉพาะผู้ดูแลระบบ กรุณากรอกรหัสผ่านเพื่อเข้าจัดการแบบสอบถาม
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-primary mb-1.5"
              >
                รหัสผ่านแอดมิน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="กรุณากรอกรหัสผ่าน"
                  autoFocus
                  className={`w-full px-4 py-2.5 pr-11 text-sm bg-surface-container-lowest border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? "border-red-500 focus:ring-red-200"
                      : "border-outline-variant focus:border-primary focus:ring-red-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>⚠</span> {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-[#801313] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/"
                className="text-xs text-on-surface-variant hover:text-primary font-medium transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าแรก</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: หน้าใส่รายละเอียดทั้งหมดของแบบสอบถาม (BUILDER MODE)
  // ============================================================================
  if (mode === "builder") {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Bar */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("list")}
              className="w-9 h-9 rounded-lg border border-outline-variant hover:bg-surface-container-low flex items-center justify-center text-primary transition-colors cursor-pointer"
              title="ย้อนกลับ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-primary">
                {editingQnrId
                  ? "ปรับแต่งรายละเอียดแบบสอบถาม"
                  : "ใส่รายละเอียดทั้งหมดของแบบสอบถามใหม่"}
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                กำหนดข้อมูลโครงการ หลักสูตร วิทยากร และปรับแต่งข้อคำถามตามต้องการ เมื่อเสร็จแล้วกดปุ่ม <strong>OK</strong> ด้านล่าง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillSampleHeader}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-primary hover:bg-red-50/40 transition-colors cursor-pointer"
            >
              เติมข้อมูลตัวอย่าง
            </button>
            <button
              type="button"
              onClick={handleClearHeaderFields}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-outline hover:text-error hover:bg-red-50/40 transition-colors cursor-pointer"
            >
              ล้างช่องกรอกข้อมูล
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitBuilder} className="space-y-6">
          {/* ข้อมูลโครงการและหลักสูตร */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4 text-primary" />
              </span>
              <h2 className="text-base font-bold text-primary">
                ข้อมูลโครงการ หลักสูตร และวิทยากร
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  โครงการฝึกอบรม <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ระบุชื่อโครงการฝึกอบรม..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  หลักสูตร / วิชา <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="ระบุชื่อหลักสูตร หรือ วิชา..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  วิทยากร
                </label>
                <input
                  type="text"
                  value={instructors}
                  onChange={(e) => setInstructors(e.target.value)}
                  placeholder="เช่น ดร.ธีรพงศ์ อนันตโภคิน และคณะ"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  หน่วยงานผู้จัด
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น กองยุทธศาสตร์และพัฒนาทรัพยากรบุคคล"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  วันที่จัดอบรม
                </label>
                <input
                  type="text"
                  value={dateDisplay}
                  onChange={(e) => setDateDisplay(e.target.value)}
                  placeholder="เช่น 15 - 17 พฤษภาคม 2567"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  สถานที่จัดอบรม
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="เช่น ห้องประชุมจิตรลดา โรงแรมเซ็นทารา แกรนด์ฯ"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  จำนวนผู้เข้าอบรม (คน)
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetAttendees}
                  onChange={(e) => setTargetAttendees(e.target.value)}
                  placeholder="เช่น 150"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* 1. ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบประเมิน */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <input
                  type="text"
                  value={section1Title}
                  onChange={(e) => setSection1Title(e.target.value)}
                  placeholder="หัวข้อส่วนที่ 1 เช่น ส่วนที่ 1 ข้อมูลทั่วไปของผู้ตอบแบบประเมิน"
                  className="text-base font-bold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-hidden px-1 py-0.5 flex-1 max-w-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={enableSection1}
                    onChange={(e) => setEnableSection1(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>แสดงส่วนที่ 1</span>
                </label>

                <button
                  type="button"
                  onClick={handleResetSection1}
                  className="px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low rounded-lg text-xs font-medium text-on-surface-variant flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="คืนค่าเริ่มต้นสำหรับส่วนที่ 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ค่าเริ่มต้น</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddDemographicField}
                  className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มคำถามข้อมูลทั่วไป</span>
                </button>
              </div>
            </div>

            {enableSection1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field 1: ชื่อ - นามสกุล */}
                  <div className="bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary">
                            ช่องกรอกที่ 1
                          </span>
                          <p className="text-[11px] text-on-surface-variant">
                            ข้อมูลชื่อของผู้ตอบแบบประเมิน
                          </p>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={respondentNameRequired}
                          onChange={(e) =>
                            setRespondentNameRequired(e.target.checked)
                          }
                          className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                        />
                        <span className="font-semibold text-xs">
                          จำเป็นต้องระบุ (*)
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        ป้ายกำกับชื่อช่อง (Label)
                      </label>
                      <input
                        type="text"
                        value={respondentNameLabel}
                        onChange={(e) => setRespondentNameLabel(e.target.value)}
                        placeholder="ชื่อ – นามสกุล"
                        className="w-full px-3 py-2 text-xs font-medium text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-outline mb-1">
                        ข้อความตัวอย่างในช่องกรอก (Placeholder)
                      </label>
                      <input
                        type="text"
                        value={respondentNamePlaceholder}
                        onChange={(e) =>
                          setRespondentNamePlaceholder(e.target.value)
                        }
                        placeholder=""
                        className="w-full px-3 py-2 text-xs text-on-surface-variant border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Field 2: รหัสราชการ (ถ้ามี) */}
                  <div
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      enableGovId
                        ? "bg-surface-container-low/30 border-outline-variant"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary">
                            ช่องกรอกที่ 2
                          </span>
                          <p className="text-[11px] text-on-surface-variant">
                            รหัสราชการ หรือรหัสประจำตัว
                          </p>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableGovId}
                          onChange={(e) => setEnableGovId(e.target.checked)}
                          className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                        />
                        <span className="font-semibold text-xs text-primary">
                          เปิดใช้งานช่องนี้
                        </span>
                      </label>
                    </div>

                    {enableGovId ? (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-on-surface">
                              ป้ายกำกับชื่อช่อง (Label)
                            </label>
                            <label className="inline-flex items-center gap-1 text-[11px] text-outline cursor-pointer">
                              <input
                                type="checkbox"
                                checked={govIdRequired}
                                onChange={(e) =>
                                  setGovIdRequired(e.target.checked)
                                }
                                className="w-3 h-3 accent-primary rounded cursor-pointer"
                              />
                              <span>บังคับกรอก (*)</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={govIdLabel}
                            onChange={(e) => setGovIdLabel(e.target.value)}
                            placeholder="รหัสราชการ (ถ้ามี)"
                            className="w-full px-3 py-2 text-xs font-medium text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-outline mb-1">
                            ข้อความตัวอย่างในช่องกรอก (Placeholder)
                          </label>
                          <input
                            type="text"
                            value={govIdPlaceholder}
                            onChange={(e) => setGovIdPlaceholder(e.target.value)}
                            placeholder=""
                            className="w-full px-3 py-2 text-xs text-on-surface-variant border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="py-5 text-center text-xs text-outline italic">
                        ปิดใช้งานช่องนี้แล้ว (จะไม่แสดงช่องรหัสราชการในหน้าแบบประเมิน)
                      </div>
                    )}
                  </div>

                  {/* Custom Demographic Fields */}
                  {demographicCustomFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {idx + 3}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-primary">
                              ช่องกรอกที่ {idx + 3} (คำถามเพิ่มเติม)
                            </span>
                            <p className="text-[11px] text-on-surface-variant">
                              ข้อมูลทั่วไปที่ต้องการเก็บเพิ่มเติม
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required ?? false}
                              onChange={(e) =>
                                handleUpdateDemographicField(
                                  field.id,
                                  "required",
                                  e.target.checked
                                )
                              }
                              className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                            />
                            <span className="font-semibold text-xs">
                              จำเป็นต้องระบุ (*)
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveDemographicField(field.id)}
                            className="p-1.5 text-outline hover:text-error hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="ลบคำถามนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-on-surface mb-1">
                          ข้อความคำถาม / ป้ายกำกับ (Label) <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            handleUpdateDemographicField(
                              field.id,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="เช่น สังกัด / หน่วยงาน, ตำแหน่งงาน, หรือ เบอร์โทรศัพท์"
                          className="w-full px-3 py-2 text-xs font-medium text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-outline mb-1">
                          ข้อความตัวอย่างในช่องกรอก (Placeholder)
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            handleUpdateDemographicField(
                              field.id,
                              "placeholder",
                              e.target.value
                            )
                          }
                          placeholder=""
                          className="w-full px-3 py-2 text-xs text-on-surface-variant border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {demographicCustomFields.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddDemographicField}
                    className="w-full border-2 border-dashed border-outline-variant hover:border-primary/50 hover:bg-primary/5 rounded-xl p-4 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs text-outline hover:text-primary font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>คลิกเพื่อเพิ่มคำถามหรือช่องข้อมูลทั่วไปเพิ่มเติมในส่วนที่ 1 (เช่น สังกัด, ตำแหน่ง, เบอร์โทร ฯลฯ)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-outline italic py-2">
                ซ่อนส่วนที่ 1 (ข้อมูลทั่วไปของผู้ตอบแบบประเมิน) ออกจากแบบประเมินนี้แล้ว
              </div>
            )}
          </section>

          {/* 2. รายการหัวข้อและข้อคำถามประเมินความพึงพอใจ */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-primary">
                    รายการข้อคำถามประเมินความพึงพอใจ ({questions.length} ข้อ)
                  </h2>
                  <p className="text-xs text-outline">
                    ปรับแต่งแก้ไขข้อความคำถาม เพิ่มข้อใหม่ หรือลบข้อที่ไม่ต้องการได้ตามต้องการ
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetStandardQuestions}
                  className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-outline hover:text-primary hover:bg-surface-container-low flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ใช้ชุดคำถามมาตรฐาน (20 ข้อ)</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddDimension}
                  className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มหมวดหมู่คำถามใหม่</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {builderDimensions.map((dim) => {
                const dimQuestions = questions.filter(
                  (q) => q.dimensionId === dim.id
                );
                return (
                  <div
                    key={dim.id}
                    className="border border-outline-variant rounded-xl overflow-hidden bg-white"
                  >
                    {/* หมวดหมู่ Header */}
                    <div className="bg-surface-container-low px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant">
                      <div className="flex items-center gap-2 flex-1">
                        <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                        <input
                          type="text"
                          value={dim.title}
                          onChange={(e) =>
                            handleUpdateDimensionTitle(dim.id, e.target.value)
                          }
                          className="w-full sm:max-w-md px-2.5 py-1 text-xs sm:text-sm font-bold text-primary bg-white border border-outline-variant rounded-md focus:outline-hidden focus:border-primary"
                          placeholder="ชื่อหมวดหมู่การประเมิน..."
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddQuestionToDimension(dim.id, dim.title)
                          }
                          className="px-2.5 py-1 bg-white hover:bg-red-50 text-primary border border-primary/30 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มคำถามในหมวดนี้</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDimension(dim.id)}
                          className="p-1.5 text-outline hover:text-error hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="ลบหมวดหมู่นี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* รายการข้อคำถามในหมวด */}
                    <div className="divide-y divide-outline-variant/60 p-3 space-y-2">
                      {dimQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center gap-2.5 pt-2 first:pt-0"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {q.id}
                          </span>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) =>
                              handleQuestionTextChange(q.id, e.target.value)
                            }
                            placeholder="พิมพ์ข้อความคำถาม..."
                            className="flex-1 px-3 py-2 text-xs sm:text-sm border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-2 text-outline hover:text-error hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบข้อคำถามนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. ส่วนที่ 3 ข้อเสนอแนะเพิ่มเติม (Qualitative Feedback) */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <input
                  type="text"
                  value={section3Title}
                  onChange={(e) => setSection3Title(e.target.value)}
                  className="text-base font-bold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-hidden px-1 py-0.5 flex-1 max-w-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    checked={enableSection3}
                    onChange={(e) => setEnableSection3(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>แสดงส่วนที่ 3</span>
                </label>

                <button
                  type="button"
                  onClick={handleResetFeedbackItems}
                  className="px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low rounded-lg text-xs font-medium text-on-surface-variant flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ค่าเริ่มต้น</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddFeedbackItem}
                  className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มหัวข้อข้อเสนอแนะ</span>
                </button>
              </div>
            </div>

            {enableSection3 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg border border-outline-variant space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                        <span className="text-xs font-bold text-primary shrink-0">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) =>
                            handleUpdateFeedbackItem(
                              item.id,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="ระบุหัวข้อข้อเสนอแนะ..."
                          className="w-full px-2.5 py-1.5 text-xs font-semibold text-on-surface border border-outline-variant rounded-md bg-white focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFeedbackItem(item.id)}
                        className="p-1.5 text-outline hover:text-error hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                        title="ลบหัวข้อข้อเสนอแนะนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        value={item.placeholder}
                        onChange={(e) =>
                          handleUpdateFeedbackItem(
                            item.id,
                            "placeholder",
                            e.target.value
                          )
                        }
                        placeholder=""
                        className="w-full text-xs p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:outline-hidden focus:border-primary resize-none text-on-surface-variant"
                      />
                      <div className="flex items-center justify-between text-[11px] text-outline mt-1">
                        <span>แก้ไขข้อความคำแนะนำในช่องกรอกด้านบนได้ (เว้นว่างไว้เป็นค่าเริ่มต้น)</span>
                        <span>0/500 ตัวอักษร</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-outline italic py-2">
                ซ่อนส่วนที่ 3 (ข้อเสนอแนะเพิ่มเติม) ออกจากหน้าแบบสอบถามนี้แล้ว
              </div>
            )}
          </section>

          {/* 4. ส่วนที่ 4 แนบเอกสารและรูปภาพ */}
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div className="space-y-1.5 flex-1">
                  <input
                    type="text"
                    value={section4Title}
                    onChange={(e) => setSection4Title(e.target.value)}
                    className="text-base font-bold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-hidden px-1 py-0.5 w-full max-w-md block"
                  />
                  <input
                    type="text"
                    value={section4Description}
                    onChange={(e) => setSection4Description(e.target.value)}
                    className="text-xs text-outline bg-transparent border-b border-dashed border-outline-variant focus:border-primary focus:outline-hidden px-1 py-0.5 w-full max-w-lg block"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSection4}
                  onChange={(e) => setEnableSection4(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span>แสดงส่วนที่ 4</span>
              </label>
            </div>

            {enableSection4 ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1">
                    หัวข้อลิงก์เอกสารหรือรูปภาพ
                  </label>
                  <input
                    type="text"
                    value={section4Label}
                    onChange={(e) => setSection4Label(e.target.value)}
                    className="w-full max-w-md px-3 py-2 text-xs font-semibold text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface-container-low/20 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <LinkIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary">
                    ใส่ลิงก์เอกสารและรูปภาพ (Link URL)
                  </div>
                  <div className="max-w-lg mx-auto">
                    <input
                      type="text"
                      value={section4HelperText}
                      onChange={(e) => setSection4HelperText(e.target.value)}
                      placeholder="วางลิงก์ (URL) ที่นี่ เช่น https://drive.google.com/..."
                      className="w-full px-3.5 py-2 text-xs text-on-surface border border-outline-variant rounded-lg bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-outline italic py-2">
                ซ่อนส่วนที่ 4 (แนบเอกสารและรูปภาพ) ออกจากหน้าแบบสอบถามนี้แล้ว
              </div>
            )}
          </section>

          {/* 5. ปุ่มยืนยัน OK ด้านล่าง */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setMode("list")}
              className="w-full sm:w-auto px-6 py-3 border border-outline-variant rounded-xl text-xs sm:text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-10 py-3 bg-primary hover:bg-[#991b1b] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>
                {isSaving
                  ? "กำลังสร้างหน้าแบบสอบถาม..."
                  : editingQnrId
                  ? "OK (บันทึกและเปิดหน้าแบบสอบถาม)"
                  : "OK (สร้างหน้าแบบสอบถามใหม่)"}
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // VIEW 1: หน้าหลัก Admin (ปุ่มสร้างแบบสอบถามมุมขวาบน + ค้นหา + รายการแบบสอบถาม 3 คอลัมน์)
  // ============================================================================
  const filteredQuestionnaires = questionnaires.filter((qnr) => {
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* แถวหัวข้อด้านบน + ปุ่มสร้างแบบสอบถามมุมขวาบน */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
          <FilePlus2 className="w-5 h-5 shrink-0" />
          <span>
            แบบสอบถามที่สร้างแล้ว ({questionnaires.length} ชุด)
            {searchQuery.trim() && (
              <span className="text-xs font-normal text-on-surface-variant ml-2">
                (พบ {filteredQuestionnaires.length} ชุด)
              </span>
            )}
          </span>
        </h2>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="ออกจากระบบผู้ดูแลระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
          <button
            type="button"
            onClick={startCreateNew}
            className="px-4 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างแบบสอบถามใหม่</span>
          </button>
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

      {/* สถานะโหลดข้อมูล */}
      {loading && questionnaires.length === 0 && (
        <div className="py-12 text-center text-sm text-outline">
          กำลังโหลดรายการแบบสอบถาม...
        </div>
      )}

      {/* สถานะยังไม่มีแบบสอบถามในระบบ */}
      {!loading && questionnaires.length === 0 && (
        <div className="bg-white border border-outline-variant rounded-xl p-12 text-center space-y-3">
          <FilePlus2 className="w-12 h-12 text-outline mx-auto" />
          <h3 className="text-base font-bold text-on-surface">ยังไม่มีแบบสอบถามในระบบ</h3>
          <p className="text-xs text-on-surface-variant">คลิกปุ่ม &quot;สร้างแบบสอบถามใหม่&quot; ด้านบนเพื่อเริ่มต้นสร้าง</p>
        </div>
      )}

      {/* รายการแบบสอบถามที่สร้างไว้แล้ว - แถวละ 3 คอลัมน์ */}
      {questionnaires.length > 0 && (
        <>
          {filteredQuestionnaires.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuestionnaires.map((qnr) => (
                <div
                  key={qnr.id}
                  className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20">
                        {qnr.questions.length} ข้อคำถาม
                      </span>
                      <span className="text-[11px] font-semibold bg-surface-container text-on-surface px-2.5 py-0.5 rounded-md border border-outline-variant">
                        ผู้เข้าอบรม: {qnr.targetAttendees || 150} คน
                      </span>
                      <span className="text-[11px] text-outline font-mono ml-auto truncate max-w-[120px]" title={qnr.id}>
                        {qnr.id}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-primary leading-snug line-clamp-2" title={qnr.title}>
                        {qnr.title}
                      </h3>
                      <p className="text-xs font-semibold text-on-surface line-clamp-1" title={qnr.courseTitle}>
                        หลักสูตร/วิชา: {qnr.courseTitle}
                      </p>
                    </div>

                    <div className="text-xs text-on-surface-variant space-y-1 pt-2 border-t border-outline-variant/40">
                      <div className="truncate" title={qnr.instructors}>
                        <span className="text-outline">วิทยากร:</span> {qnr.instructors || "-"}
                      </div>
                      <div className="truncate" title={qnr.department}>
                        <span className="text-outline">หน่วยงาน:</span> {qnr.department || "-"}
                      </div>
                      <div className="truncate" title={`${qnr.dateDisplay} (${qnr.venue})`}>
                        <span className="text-outline">วันที่:</span> {qnr.dateDisplay} {qnr.venue ? `(${qnr.venue})` : ""}
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มจัดการ: เปิดหน้าใหม่ / แชร์ / ปรับแต่ง / คัดลอก / ลบ (เฉพาะไอคอน) */}
                  <div className="pt-3 border-t border-outline-variant/50 flex items-center justify-end gap-1.5">
                    <Link
                      href={`/form?id=${encodeURIComponent(qnr.id)}`}
                      target="_blank"
                      className="p-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                      title="เปิดหน้าแบบสอบถาม"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShareModalQnr(qnr)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                      title="แชร์ลิงก์ / QR Code"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/dashboard?id=${encodeURIComponent(qnr.id)}`}
                      target="_blank"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                      title="ดูแดชบอร์ดสรุปผล (Dashboard)"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => startEditQuestionnaire(qnr)}
                      className="p-2 border border-outline-variant hover:border-primary text-primary bg-white hover:bg-red-50/40 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                      title="ปรับแต่งแก้ไข"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestionnaire(qnr)}
                      className="p-2 border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                      title="คัดลอกเพื่อสร้างแบบสอบถามชุดใหม่"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestionnaire(qnr.id)}
                      className="p-2 border border-outline-variant hover:border-error text-outline hover:text-error rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                      title="ลบแบบสอบถามนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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

            {/* QR Code สำหรับสแกนเข้าหน้าแบบสอบถาม */}
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
                  onClick={() => handleCopyLink(shareModalQnr.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {copiedId === shareModalQnr.id ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Link
                href={`/form?id=${encodeURIComponent(shareModalQnr.id)}`}
                target="_blank"
                className="px-4 py-2 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดดูหน้าแบบสอบถาม</span>
              </Link>
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
