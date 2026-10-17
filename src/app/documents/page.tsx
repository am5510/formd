"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import FileUploader, { UploadedFileItem } from "@/components/FileUploader";
import { R2FileItem } from "@/lib/types";

export default function DocumentsPage() {
  const [files, setFiles] = useState<R2FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<R2FileItem | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/r2/files");
      if (res.ok) {
        const data = (await res.json()) as any;
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to load R2 files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: R2FileItem) => {
    if (!confirm(`ต้องการลบไฟล์ "${file.fileName}" ออกจาก Cloudflare R2 ใช่หรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/r2/files?key=${encodeURIComponent(file.r2Key)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      }
    } catch (err) {
      alert("ไม่สามารถลบไฟล์ได้");
    }
  };

  const filteredFiles = files.filter((f) => {
    if (activeCategory === "all") return true;
    return f.category === activeCategory;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* R2 Cloud Header Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">
                คลังเอกสารและรูปภาพโครงการ (Cloudflare R2 Storage)
              </h1>
              <span className="text-[10px] font-bold bg-[#E6FFFA] text-[#0D9488] px-2 py-0.5 rounded border border-[#0D9488]/30">
                S3-Compatible Object Storage
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              จัดเก็บคู่มือฝึกอบรม สไลด์บรรยาย ภาพถ่ายวิทยากร และภาพบรรยากาศกิจกรรม พร้อมระบบ Zero Egress Fees
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-primary hover:bg-[#991b1b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>อัปโหลดเอกสาร / รูปภาพใหม่</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl p-6 border border-outline-variant shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Cloud className="w-5 h-5 text-secondary" />
                <span>อัปโหลดไฟล์สู่ Cloudflare R2 Bucket</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                ✕
              </button>
            </div>

            <FileUploader
              projectId="PRJ-2567-TR048"
              onUploadComplete={(newFiles) => {
                fetchFiles();
                setShowUploadModal(false);
              }}
              label="เลือกไฟล์เอกสาร (PDF) หรือภาพถ่ายกิจกรรม (JPG, PNG)"
            />
          </div>
        </div>
      )}

      {/* File Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { key: "all", label: "ทั้งหมด" },
          { key: "document", label: "เอกสารและคู่มือหลักสูตร (PDF)" },
          { key: "speaker", label: "ภาพถ่ายวิทยากร" },
          { key: "gallery", label: "ภาพกิจกรรมและ Workshop" },
          { key: "certificate", label: "ใบประกาศและหลักฐาน" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === tab.key
                ? "bg-primary text-white"
                : "bg-surface-container-low text-on-surface hover:bg-surface-container"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Files Grid / List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-outline">
          กำลังโหลดรายการไฟล์จาก Cloudflare R2...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
          <FolderOpen className="w-12 h-12 text-outline mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-primary">ยังไม่มีไฟล์ในหมวดหมู่นี้</p>
          <p className="text-xs text-outline mt-1">
            สามารถคลิกปุ่ม &quot;อัปโหลดเอกสาร / รูปภาพใหม่&quot; เพื่อเพิ่มไฟล์เข้าสู่ Cloudflare R2
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const isImage = file.fileType.startsWith("image/");
            return (
              <div
                key={file.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs hover:border-secondary transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant">
                      {file.category}
                    </span>
                    <span className="text-[11px] text-outline">
                      {formatSize(file.fileSize)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                      {isImage ? (
                        <ImageIcon className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xs font-bold text-on-surface line-clamp-2"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </h3>
                      <p className="text-[10px] text-outline truncate mt-0.5">
                        {file.r2Key}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-outline">
                    {new Date(file.uploadedAt).toLocaleDateString("th-TH")}
                  </span>

                  <div className="flex items-center gap-1">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-primary hover:bg-surface-container-low rounded transition-colors"
                      title="เปิดดูไฟล์"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDelete(file)}
                      className="p-1.5 text-error hover:bg-error-container/30 rounded transition-colors"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
