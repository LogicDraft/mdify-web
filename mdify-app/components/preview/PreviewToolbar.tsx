"use client";

import { useState, useCallback } from "react";
import {
  Copy,
  Download,
  CheckCheck,
  Sparkles,
  Loader2,
  Columns2,
  AlignLeft,
  Eye,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversionStore } from "@/lib/store/conversionStore";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "split" | "editor" | "preview";

interface PreviewToolbarProps {
  markdown: string;
  fileName: string;
  onMarkdownChange: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export function PreviewToolbar({
  markdown,
  fileName,
  onMarkdownChange,
  viewMode,
  setViewMode,
}: PreviewToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { settings } = useConversionStore();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      showToast("Markdown copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const baseName = fileName.replace(/\.(docx|pdf)$/i, "");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded " + baseName + ".md");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fileName} — MDify`,
          text: markdown.slice(0, 500) + "...",
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopy();
    }
  };

  const handleAiCleanup = async () => {
    if (!settings.aiCleanupEnabled) {
      showToast("Enable AI Cleanup in Settings first", "error");
      return;
    }
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, fileName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI cleanup failed");
      }

      onMarkdownChange(data.markdown);
      showToast("AI cleanup complete!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI cleanup failed";
      setAiError(msg);
      showToast(msg, "error");
    } finally {
      setAiLoading(false);
    }
  };

  const viewModes = [
    { value: "split" as ViewMode, icon: Columns2, label: "Split" },
    { value: "editor" as ViewMode, icon: AlignLeft, label: "Editor" },
    { value: "preview" as ViewMode, icon: Eye, label: "Preview" },
  ];

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-0.5 gap-0.5">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                  viewMode === mode.value
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* AI Cleanup */}
          <button
            onClick={handleAiCleanup}
            disabled={aiLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              settings.aiCleanupEnabled
                ? "bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-subtle)] border border-[var(--border)] opacity-60"
            )}
            title={settings.aiCleanupEnabled ? "Run AI cleanup" : "Enable AI cleanup in Settings"}
          >
            {aiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {aiLoading ? "Cleaning..." : "AI Cleanup"}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--background-tertiary)] text-[var(--foreground-muted)] border border-[var(--border)] hover:text-[var(--foreground)] transition-all duration-150"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--background-tertiary)] text-[var(--foreground-muted)] border border-[var(--border)] hover:text-[var(--foreground)] transition-all duration-150"
          >
            {copied ? (
              <CheckCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-all duration-150 hover:shadow-[var(--shadow-glow)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download .md</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-[var(--shadow-lg)] text-sm font-medium border",
              toast.type === "success"
                ? "bg-[var(--card)] text-[var(--foreground)] border-[var(--accent)]/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            )}
          >
            {toast.type === "success" ? (
              <CheckCheck className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
            ) : (
              <span className="text-red-400">✕</span>
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
