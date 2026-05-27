"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversionStore } from "@/lib/store/conversionStore";
import { Navbar } from "@/components/Navbar";
import { MarkdownEditor } from "@/components/preview/MarkdownEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { PreviewToolbar } from "@/components/preview/PreviewToolbar";
import { DocumentInfo } from "@/components/preview/DocumentInfo";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { motion } from "framer-motion";
import { Hash, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ViewMode = "split" | "editor" | "preview";

export default function PreviewPage() {
  const router = useRouter();
  const { currentResult, setCurrentResult } = useConversionStore();
  const [markdown, setMarkdown] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && currentResult) {
      setMarkdown(currentResult.markdown);
    }
  }, [currentResult, mounted]);

  if (!mounted) return null;

  if (!currentResult) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-[var(--foreground-subtle)]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            No document converted yet
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            Upload a DOCX or PDF file to get started.
          </p>
          <Link
            href="/convert"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-[var(--shadow-glow)]"
          >
            <Upload className="w-4 h-4" />
            Convert a file
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Top Bar */}
      <header className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-xl">
        {/* Nav Row */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)]">
          <Link
            href="/convert"
            className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          <div className="h-3 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-[var(--accent)] flex items-center justify-center">
              <Hash className="w-3 h-3 text-black" strokeWidth={3} />
            </div>
            <span className="font-semibold text-sm text-[var(--foreground)]">
              MD<span className="text-[var(--accent)]">ify</span>
            </span>
          </div>

          <div className="flex-1" />

          {/* Settings */}
          <SettingsPanel />
        </div>

        {/* Toolbar Row */}
        <div className="px-4 py-2">
          <PreviewToolbar
            markdown={markdown}
            fileName={currentResult.fileName}
            fileType={currentResult.fileType}
            onMarkdownChange={setMarkdown}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Document Info Row */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)]">
          <DocumentInfo result={currentResult} />
        </div>
      </header>

      {/* Split-Screen Content */}
      <div className="flex-1 flex overflow-hidden">
        <motion.div
          layout
          className="flex w-full h-full"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Editor Panel */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              className="h-full border-r border-[var(--border)] overflow-hidden"
              style={{
                width: viewMode === "split" ? "50%" : "100%",
              }}
            >
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                className="h-full"
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              className="h-full overflow-hidden"
              style={{
                width: viewMode === "split" ? "50%" : "100%",
              }}
            >
              <MarkdownPreview markdown={markdown} className="h-full" />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
