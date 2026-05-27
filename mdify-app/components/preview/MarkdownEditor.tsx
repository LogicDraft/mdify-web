"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const wordCount = value.split(/\s+/).filter(Boolean).length;
  const lineCount = value.split("\n").length;
  const charCount = value.length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-[var(--foreground-subtle)] font-mono ml-2">
            output.md
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--foreground-subtle)] font-mono">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pr-2 pt-4 text-[11px] font-mono text-[var(--foreground-subtle)] pointer-events-none overflow-hidden select-none bg-[var(--background-secondary)] border-r border-[var(--border)] z-10">
          {Array.from({ length: Math.min(lineCount, 500) }, (_, i) => (
            <div key={i + 1} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="absolute inset-0 w-full h-full resize-none pl-14 pr-4 pt-4 pb-4 font-mono text-sm leading-6 bg-[var(--background)] text-[var(--foreground)] outline-none placeholder-[var(--foreground-subtle)] overflow-y-auto"
          placeholder="Your Markdown will appear here after conversion..."
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
        />
      </div>
    </div>
  );
}
