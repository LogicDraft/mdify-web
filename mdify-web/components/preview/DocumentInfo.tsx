"use client";

import { countMarkdownStats, formatFileSize } from "@/lib/utils";
import { FileText, File, Clock, Hash, AlignLeft, Table2, Code2, Link } from "lucide-react";
import type { ConversionResult } from "@/lib/types";

interface DocumentInfoProps {
  result: ConversionResult;
}

export function DocumentInfo({ result }: DocumentInfoProps) {
  const stats = countMarkdownStats(result.markdown);

  const infoItems = [
    {
      icon: result.fileType === "pdf" ? File : FileText,
      label: "Source",
      value: result.fileName,
      color: result.fileType === "pdf" ? "text-red-400" : "text-blue-400",
      truncate: true,
    },
    {
      icon: AlignLeft,
      label: "Size",
      value: formatFileSize(result.fileSize),
      color: "text-[var(--foreground-muted)]",
    },
    {
      icon: Clock,
      label: "Converted in",
      value: `${result.conversionTimeMs}ms`,
      color: "text-[var(--accent)]",
    },
    ...(result.pageCount
      ? [{ icon: File, label: "Pages", value: `${result.pageCount}`, color: "text-[var(--foreground-muted)]" }]
      : []),
  ];

  const statItems = [
    { icon: Hash, label: "Headings", value: stats.headings, color: "text-purple-400" },
    { icon: AlignLeft, label: "Words", value: stats.words.toLocaleString(), color: "text-[var(--foreground-muted)]" },
    { icon: Code2, label: "Code blocks", value: stats.codeBlocks, color: "text-yellow-400" },
    { icon: Table2, label: "Tables", value: stats.tables, color: "text-cyan-400" },
    { icon: Link, label: "Links", value: stats.links, color: "text-[var(--accent)]" },
  ];

  return (
    <div className="flex items-center gap-4 flex-wrap text-xs">
      {/* Source File */}
      <div className="flex items-center gap-1.5 max-w-[200px]">
        {result.fileType === "pdf" ? (
          <File className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        )}
        <span className="text-[var(--foreground-muted)] truncate font-medium">
          {result.fileName}
        </span>
        <span className="text-[var(--foreground-subtle)]">
          ({formatFileSize(result.fileSize)})
        </span>
      </div>

      <div className="h-3 w-px bg-[var(--border)]" />

      <div className="flex items-center gap-1.5 text-[var(--accent)]">
        <Clock className="w-3 h-3" />
        <span>{result.conversionTimeMs}ms</span>
      </div>

      <div className="h-3 w-px bg-[var(--border)]" />

      {/* Markdown Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        {statItems.filter(s => Number(s.value) > 0 || typeof s.value === "string").map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-1">
              <Icon className={`w-3 h-3 ${stat.color}`} />
              <span className="text-[var(--foreground-subtle)]">{stat.value}</span>
              <span className="text-[var(--foreground-subtle)] opacity-50">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
