"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { isValidFileType, getFileType } from "@/lib/converters";
import { convertFile } from "@/lib/converters";
import { useConversionStore } from "@/lib/store/conversionStore";
import { useRouter } from "next/navigation";
import type { ConversionResult } from "@/lib/types";

interface FileState {
  file: File;
  status: "idle" | "converting" | "done" | "error";
  progress: number;
  error?: string;
  result?: ConversionResult;
}

export function DropZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileState[]>([]);
  const { settings, setCurrentResult, addToHistory } = useConversionStore();

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid = arr.filter((f) => {
        if (!isValidFileType(f)) {
          return false;
        }
        return true;
      });

      if (valid.length === 0) {
        alert("Please upload .docx or .pdf files only.");
        return;
      }

      const newStates: FileState[] = valid.map((f) => ({
        file: f,
        status: "idle",
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newStates]);

      // Start converting each
      newStates.forEach((fs) => {
        convertSingleFile(fs.file);
      });
    },
    [settings]
  );

  const convertSingleFile = async (file: File) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.file === file
          ? { ...f, status: "converting", progress: 10 }
          : f
      )
    );

    // Simulate progress
    const progressInterval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file && f.status === "converting"
            ? { ...f, progress: Math.min(f.progress + 15, 85) }
            : f
        )
      );
    }, 300);

    try {
      const result = await convertFile(file, settings);
      clearInterval(progressInterval);

      if (result.error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: "error", progress: 0, error: result.error }
              : f
          )
        );
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "done", progress: 100, result }
            : f
        )
      );

      setCurrentResult(result);
      addToHistory(result);

      // If only one file, navigate to preview
      if (files.length === 0) {
        setTimeout(() => router.push("/preview"), 600);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: err instanceof Error ? err.message : "Conversion failed",
              }
            : f
        )
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const openPreview = (result: ConversionResult) => {
    setCurrentResult(result);
    router.push("/preview");
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const convertingCount = files.filter((f) => f.status === "converting").length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Drop Zone */}
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          borderColor: isDragging ? "var(--accent)" : "var(--border)",
          backgroundColor: isDragging
            ? "var(--accent-light)"
            : "transparent",
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 select-none",
          "hover:border-[var(--accent)]/60 hover:bg-[var(--background-secondary)]",
          isDragging && "shadow-[var(--shadow-glow)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-[var(--accent)]/20 border-2 border-[var(--accent)] flex items-center justify-center animate-bounce">
                <CloudUpload className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <p className="text-lg font-semibold text-[var(--accent)]">
                Drop your files here!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="w-20 h-20 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)]/30 transition-colors duration-200">
                <Upload className="w-9 h-9 text-[var(--foreground-subtle)]" />
              </div>

              <div>
                <p className="text-lg font-semibold text-[var(--foreground)] mb-1">
                  Drop files here or{" "}
                  <span className="text-[var(--accent)]">browse</span>
                </p>
                <p className="text-sm text-[var(--foreground-subtle)]">
                  Supports .docx and .pdf files
                </p>
              </div>

              {/* File Type Badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  .docx
                </div>
                <div className="w-px h-4 bg-[var(--border)]" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  <File className="w-3.5 h-3.5" />
                  .pdf
                </div>
              </div>

              <p className="text-xs text-[var(--foreground-subtle)]">
                Max file size: 50MB · All processing happens locally
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            {doneCount > 0 && files.length > 1 && (
              <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)] px-1">
                <span>
                  {doneCount} of {files.length} converted
                </span>
                {convertingCount === 0 && (
                  <button
                    onClick={() => {
                      const done = files.find((f) => f.status === "done");
                      if (done?.result) openPreview(done.result);
                    }}
                    className="text-[var(--accent)] hover:underline"
                  >
                    View latest →
                  </button>
                )}
              </div>
            )}

            {files.map((fs) => (
              <FileCard
                key={fs.file.name + fs.file.size}
                fileState={fs}
                onRemove={() => removeFile(fs.file)}
                onPreview={() => fs.result && openPreview(fs.result)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileCard({
  fileState,
  onRemove,
  onPreview,
}: {
  fileState: FileState;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const { file, status, progress, error, result } = fileState;
  const fileType = getFileType(file);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          fileType === "pdf"
            ? "bg-red-500/10 border border-red-500/20"
            : "bg-blue-500/10 border border-blue-500/20"
        }`}
      >
        {fileType === "pdf" ? (
          <File className="w-5 h-5 text-red-400" />
        ) : (
          <FileText className="w-5 h-5 text-blue-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {file.name}
          </span>
          <span className="text-xs text-[var(--foreground-subtle)] flex-shrink-0">
            {formatFileSize(file.size)}
          </span>
        </div>

        {status === "converting" && (
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-[var(--foreground-subtle)]">
              Converting...
            </p>
          </div>
        )}

        {status === "done" && result && (
          <p className="text-xs text-[var(--accent)]">
            ✓ Converted in {result.conversionTimeMs}ms ·{" "}
            {result.markdown.split(" ").length} words
          </p>
        )}

        {status === "error" && (
          <p className="text-xs text-red-400 truncate">{error}</p>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {status === "converting" && (
          <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
        )}
        {status === "done" && (
          <>
            <button
              onClick={onPreview}
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Preview →
            </button>
            <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
          </>
        )}
        {status === "error" && (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}

        <button
          onClick={onRemove}
          className="p-1 rounded-md text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors duration-150"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
