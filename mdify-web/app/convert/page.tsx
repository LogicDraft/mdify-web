"use client";

import { Navbar } from "@/components/Navbar";
import { DropZone } from "@/components/upload/DropZone";
import { useConversionStore } from "@/lib/store/conversionStore";
import { motion } from "framer-motion";
import { Clock, FileText, File, Hash, Trash2, ArrowRight } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ConvertPage() {
  const { history, clearHistory, setCurrentResult } = useConversionStore();
  const router = useRouter();

  const loadHistoryItem = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (!item) return;
    setCurrentResult({
      markdown: item.markdown,
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileType: item.fileType,
      conversionTimeMs: item.conversionTimeMs,
    });
    router.push("/preview");
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium mb-5">
              <Hash className="w-3.5 h-3.5" strokeWidth={3} />
              Document Converter
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
              Convert your documents
            </h1>
            <p className="text-[var(--foreground-muted)] text-lg">
              Drop a DOCX or PDF file below and get clean Markdown instantly.
            </p>
          </motion.div>

          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DropZone />
          </motion.div>

          {/* History Section */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-16"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--foreground-subtle)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">
                    Recent Conversions
                  </h2>
                  <span className="text-xs text-[var(--foreground-subtle)] bg-[var(--background-tertiary)] px-2 py-0.5 rounded-full">
                    {history.length}
                  </span>
                </div>

                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 text-xs text-[var(--foreground-subtle)] hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.slice(0, 6).map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => loadHistoryItem(item.id)}
                    whileHover={{ y: -2 }}
                    className="group text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-md)] transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.fileType === "pdf"
                            ? "bg-red-500/10"
                            : "bg-blue-500/10"
                        }`}
                      >
                        {item.fileType === "pdf" ? (
                          <File className="w-4 h-4 text-red-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate mb-0.5">
                          {item.fileName}
                        </p>
                        <p className="text-xs text-[var(--foreground-subtle)]">
                          {formatFileSize(item.fileSize)} ·{" "}
                          {formatDate(new Date(item.convertedAt))}
                        </p>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-[var(--foreground-subtle)] group-hover:text-[var(--accent)] flex-shrink-0 mt-0.5 transition-colors duration-200" />
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--foreground-subtle)] font-mono truncate">
                        {item.markdown.slice(0, 80)}...
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
