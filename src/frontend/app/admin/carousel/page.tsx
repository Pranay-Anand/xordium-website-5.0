"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/admin-api";
import Link from "next/link";

const CAROUSEL_FOLDER = "src/frontend/carousel-source";

export default function CarouselAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== "OWNER") return null;

  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setFiles([...files, ...newFiles]);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
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
        // Refresh the page to see updated carousel
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setUploadStatus(`Error: ${result.error || "Upload failed"}`);
      }
    } catch (err) {
      setUploadStatus(`Error: ${err instanceof Error ? err.message : "Upload failed"}`);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // HOMEPAGE CAROUSEL
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
          Owner-only local image directory
        </p>
      </div>

      <div className="border border-white/10 bg-white/5 p-6">
        <p className="font-mono text-sm leading-relaxed text-white/70">
          Add source images directly to the local project folder below. The homepage
          imports new files into the database as compressed WebP images.
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
            Supported: AVIF, GIF, JPEG, PNG, WebP. Files are resized to 300px and converted to WebP.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={uploadFiles}
            className="mt-3 inline-flex items-center rounded-md border border-cyan-300/30 bg-cyan-300/5 px-4 py-2 text-sm font-mono text-cyan-200 hover:bg-cyan-300/10 transition-colors"
          >
            Upload Images
            <svg
              className="inline-blockalign-middle mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v5m7-7a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Add to carousel
          </button>
        </div>

        {uploadStatus && (
          <p className="mt-4 text-sm text-white/60">{uploadStatus}</p>
        )}

        <p className="mt-6 text-xs text-white/50">
          Supported formats: AVIF, GIF, JPEG, PNG, and WebP. File names determine slide order.
        </p>
      </div>
    </div>
  );
}