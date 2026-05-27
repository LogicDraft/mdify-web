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
  Sparkles,
  Zap,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { isValidFileType, getFileType, convertFile } from "@/lib/converters";
import { useConversionStore } from "@/lib/store/conversionStore";
import { useRouter } from "next/navigation";
import type { ConversionResult } from "@/lib/types";

type FileStatus = "idle" | "converting" | "structuring" | "done" | "error";

interface FileState {
  file: File;
  status: FileStatus;
  progress: number;
  statusLabel: string;
  error?: string;
  result?: ConversionResult;
}

async function callAiStructure(
  markdown: string,
  fileName: string,
  fileType: string
): Promise<string> {
  const res = await fetch("/api/ai-cleanup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, fileName, fileType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI structuring failed");
  return data.markdown as string;
}

export function DropZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileState[]>([]);
  const { settings, setCurrentResult, addToHistory } = useConversionStore();

  const updateFileState = (
    file: File,
    patch: Partial<FileState>
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.file === file ? { ...f, ...patch } : f))
    );
  };

  const convertSingleFile = useCallback(
    async (file: File) => {
      // Step 1: Initial raw conversion
      updateFileState(file, {
        status: "converting",
        progress: 5,
        statusLabel: "Extracting content...",
      });

      // Simulate incremental progress
      const ticker = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.status === "converting"
              ? {
                  ...f,
                  progress: Math.min(f.progress + 8, 60),
                  statusLabel:
                    f.progress < 30
                      ? "Extracting content..."
                      : "Parsing structure...",
                }
              : f
          )
        );
      }, 350);

      let result: ConversionResult;
      try {
        result = await convertFile(file, settings);
        clearInterval(ticker);
      } catch (err) {
        clearInterval(ticker);
        updateFileState(file, {
          status: "error",
          progress: 0,
          statusLabel: "Conversion failed",
          error:
            err instanceof Error ? err.message : "Unknown error",
        });
        return;
      }

      if (result.error) {
        updateFileState(file, {
          status: "error",
          progress: 0,
          statusLabel: "Conversion failed",
          error: result.error,
        });
        return;
      }

      // Step 2: AI Structuring (always run if API key is available)
      updateFileState(file, {
        status: "structuring",
        progress: 65,
        statusLabel: "AI structuring with Gemini...",
      });

      const aiTicker = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.status === "structuring"
              ? {
                  ...f,
                  progress: Math.min(f.progress + 3, 92),
                  statusLabel:
                    f.progress < 75
                      ? "Analyzing document structure..."
                      : f.progress < 85
                      ? "Reconstructing headings..."
                      : "Formatting tables & code...",
                }
              : f
          )
        );
      }, 600);

      let finalMarkdown = result.markdown;
      let aiError: string | undefined;

      try {
        finalMarkdown = await callAiStructure(
          result.markdown,
          result.fileName,
          result.fileType
        );
      } catch (err) {
        aiError =
          err instanceof Error ? err.message : "AI structuring failed";
        // Fall back to raw markdown — don't block the user
      } finally {
        clearInterval(aiTicker);
      }

      const finalResult: ConversionResult = {
        ...result,
        markdown: finalMarkdown,
      };

      updateFileState(file, {
        status: "done",
        progress: 100,
        statusLabel: aiError
          ? `Done (AI failed: ${aiError})`
          : "Structured by Gemini ✦",
        result: finalResult,
        error: aiError,
      });

      setCurrentResult(finalResult);
      addToHistory(finalResult);

      // Auto-navigate to preview for single file
      setFiles((prev) => {
        if (prev.filter((f) => f.status !== "error").length === 1) {
          setTimeout(() => router.push("/preview"), 700);
        }
        return prev;
      });
    },
    [settings, setCurrentResult, addToHistory, router]
  );

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid = arr.filter(isValidFileType);

      if (valid.length === 0) {
        alert("Please upload .docx or .pdf files only.");
        return;
      }

      const newStates: FileState[] = valid.map((f) => ({
        file: f,
        status: "idle",
        progress: 0,
        statusLabel: "Waiting...",
      }));

      setFiles((prev) => [...prev, ...newStates]);
      valid.forEach(convertSingleFile);
    },
    [convertSingleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (file: File) =>
    setFiles((prev) => prev.filter((f) => f.file !== file));

  const openPreview = (result: ConversionResult) => {
    setCurrentResult(result);
    router.push("/preview");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* AI Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Gemini AI auto-structures every conversion
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            setIsDragging(false);
        }}
        animate={{
          borderColor: isDragging ? "var(--accent)" : "var(--border)",
          backgroundColor: isDragging ? "var(--accent-light)" : "rgba(0,0,0,0)",
          scale: isDragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center select-none",
          "hover:border-[var(--accent)]/60 hover:bg-[var(--background-secondary)] transition-colors duration-200",
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
                Drop to convert + AI structure!
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
              <div className="w-20 h-20 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center">
                <Upload className="w-9 h-9 text-[var(--foreground-subtle)]" />
              </div>

              <div>
                <p className="text-lg font-semibold text-[var(--foreground)] mb-1">
                  Drop files here or{" "}
                  <span className="text-[var(--accent)]">browse</span>
                </p>
                <p className="text-sm text-[var(--foreground-subtle)]">
                  Converts and auto-structures with Gemini AI
                </p>
              </div>

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

              {/* Flow indicator */}
              <div className="flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
                <span className="px-2 py-0.5 rounded bg-[var(--background-secondary)] border border-[var(--border)]">Extract</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini Structure
                </span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-[var(--background-secondary)] border border-[var(--border)]">Preview</span>
              </div>
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
  const { file, status, progress, statusLabel, error, result } = fileState;
  const fileType = getFileType(file);

  const isProcessing = status === "converting" || status === "structuring";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border bg-[var(--card)] shadow-[var(--shadow-sm)] transition-colors duration-300",
        status === "done" && !error
          ? "border-[var(--accent)]/30"
          : status === "error"
          ? "border-red-500/30"
          : status === "structuring"
          ? "border-purple-500/30"
          : "border-[var(--border)]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
          status === "structuring"
            ? "bg-purple-500/10 border border-purple-500/20"
            : fileType === "pdf"
            ? "bg-red-500/10 border border-red-500/20"
            : "bg-blue-500/10 border border-blue-500/20"
        )}
      >
        {status === "structuring" ? (
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        ) : fileType === "pdf" ? (
          <File className="w-5 h-5 text-red-400" />
        ) : (
          <FileText className="w-5 h-5 text-blue-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {file.name}
          </span>
          <span className="text-xs text-[var(--foreground-subtle)] flex-shrink-0">
            {formatFileSize(file.size)}
          </span>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  status === "structuring"
                    ? "bg-gradient-to-r from-purple-500 to-[var(--accent)]"
                    : "bg-[var(--accent)]"
                )}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-subtle)]">
              {status === "structuring" && (
                <Sparkles className="w-3 h-3 text-purple-400" />
              )}
              {status === "converting" && (
                <Zap className="w-3 h-3 text-[var(--accent)]" />
              )}
              <span
                className={
                  status === "structuring"
                    ? "text-purple-400"
                    : "text-[var(--foreground-subtle)]"
                }
              >
                {statusLabel}
              </span>
              <span className="ml-auto text-[var(--foreground-subtle)]">
                {progress}%
              </span>
            </div>
          </div>
        )}

        {status === "done" && result && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--accent)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {statusLabel}
            </span>
            <span className="text-xs text-[var(--foreground-subtle)]">·</span>
            <span className="text-xs text-[var(--foreground-subtle)]">
              {result.conversionTimeMs}ms · ~{result.markdown.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        )}

        {status === "error" && error && (
          <p className="text-xs text-red-400 truncate">{error}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isProcessing && (
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
          disabled={isProcessing}
          className="p-1 rounded-md text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors duration-150 disabled:opacity-30"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
