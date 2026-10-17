"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";

export interface UploadedFileItem {
  fileName: string;
  r2Key: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
}

interface FileUploaderProps {
  projectId?: string;
  category?: "document" | "speaker" | "gallery" | "certificate" | "report";
  maxSizeMB?: number;
  allowedTypes?: string[];
  onUploadComplete?: (files: UploadedFileItem[]) => void;
  label?: string;
  helperText?: string;
}

export default function FileUploader({
  projectId = "PRJ-2567-TR048",
  category = "document",
  maxSizeMB = 20,
  allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx", ".xlsx"],
  onUploadComplete,
  label = "แนบเอกสารหรือรูปภาพประกอบ",
  helperText = "รองรับไฟล์ PDF, Word, Excel, JPG, PNG ขนาดสูงสุด 20 MB ต่อไฟล์",
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const newUploaded: UploadedFileItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`ไฟล์ "${file.name}" มีขนาดเกิน ${maxSizeMB} MB`);
        }

        // 1. ขอ Presigned URL จาก API
        const presignRes = await fetch("/api/r2/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            category,
            projectId,
          }),
        });

        if (!presignRes.ok) {
          throw new Error("ไม่สามารถสร้างลิงก์สำหรับอัปโหลด Cloudflare R2 ได้");
        }

        const { uploadUrl, publicUrl, r2Key } = await presignRes.json();

        // 2. อัปโหลดไฟล์ไปยัง URL ที่ได้รับ (Direct PUT หรือ fallback API)
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`การอัปโหลดไฟล์ "${file.name}" ล้มเหลว`);
        }

        newUploaded.push({
          fileName: file.name,
          r2Key,
          fileUrl: publicUrl,
          fileType: file.type,
          fileSize: file.size,
          category,
        });
      }

      const updated = [...uploadedFiles, ...newUploaded];
      setUploadedFiles(updated);
      if (onUploadComplete) {
        onUploadComplete(updated);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, idx) => idx !== index);
    setUploadedFiles(updated);
    if (onUploadComplete) {
      onUploadComplete(updated);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-on-surface">
          {label}
        </label>
      )}

      {/* Drop / Select Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-outline-variant hover:border-secondary bg-surface-container-low/50 hover:bg-surface-container-low rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <div>
          <span className="text-sm font-semibold text-primary block">
            {isUploading ? "กำลังอัปโหลดไฟล์..." : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
          </span>
          <span className="text-xs text-outline block mt-0.5">{helperText}</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider block">
            ไฟล์ที่อัปโหลดแล้ว ({uploadedFiles.length} ไฟล์):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedFiles.map((file, idx) => {
              const isImage = file.fileType.startsWith("image/");
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                      {isImage ? (
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-on-surface truncate block" title={file.fileName}>
                        {file.fileName}
                      </span>
                      <span className="text-[11px] text-outline">
                        {formatSize(file.fileSize)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 text-outline hover:text-error rounded hover:bg-error-container/30 transition-colors"
                    title="ลบไฟล์"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
