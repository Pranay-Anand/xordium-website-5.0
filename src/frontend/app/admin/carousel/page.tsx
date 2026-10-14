"use client";

import { useState } from "react";
import { getCurrentUser } from "@/lib/admin-api";

export default function CarouselAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== "OWNER") return null;

  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/admin/carousel/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setUploadStatus(`${result.message}`);
        setFiles([]);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setUploadStatus(`Error: ${result.error || "Upload failed"}`);
      }
    } catch (err) {
      setUploadStatus(`Error: ${err instanceof Error ? err.message : "Upload failed"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // HOMEPAGE CAROUSEL
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
          Owner-only image upload
        </p>
      </div>

      <div className="border border-white/10 bg-white/5 p-6">
        <p className="font-mono text-sm leading-relaxed text-white/70">
          Upload images directly from your computer. Images are automatically converted to
          WebP format, resized to max 300px height, and stored in the database.
        </p>

        <div className="mt-4">
          <input
            type="file"
            multiple
            className="mt-2 block w-full text-sm text-white/30 file:border file:bg-white/5 file:rounded file:text-sm hover:file:bg-white/10"
            accept="image/*,.avif,.gif,.jpeg,.jpg,.png,.webp"
            onChange={handleFileChange}
          />
          <p className="mt-2 text-xs text-white/40">
            Supported: AVIF, GIF, JPEG, PNG, WebP. Max height: 300px. Quality: 75%.
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="font-mono text-xs text-white/60">
              Selected {files.length} file{files.length > 1 ? "s" : ""}:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between text-sm text-white/70 bg-black/30 px-3 py-2 rounded border border-white/10"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-white/40 ml-2">
                    {Math.round(file.size / 1024)} KB
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-white/50 hover:text-white ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFiles}
                className="text-sm text-white/60 hover:text-white"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            className="inline-flex items-center rounded-md border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-sm font-mono text-cyan-200 hover:bg-cyan-300/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="inline-block align-middle mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v5m7-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upload Images
              </>
            )}
          </button>
        </div>

        {uploadStatus && (
          <p className={`mt-4 text-sm ${uploadStatus.startsWith("Error") ? "text-red-400" : "text-white/60"}`}>
            {uploadStatus}
          </p>
        )}

        <p className="mt-6 text-xs text-white/50">
          Images are converted to WebP (max 300px height, 75% quality) and stored in the database.
          The homepage carousel fetches images directly from the database.
        </p>
      </div>
    </div>
  );
}