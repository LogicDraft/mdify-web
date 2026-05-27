"use client";

import { motion } from "framer-motion";
import { Hash, FileText, File } from "lucide-react";

const floatingCards = [
  {
    id: 1,
    title: "research-paper.docx",
    preview: "# Introduction\n\nThis study explores...\n\n## Methodology",
    type: "docx",
    delay: 0,
    x: "-10%",
    y: "10%",
    rotate: -6,
  },
  {
    id: 2,
    title: "report.pdf",
    preview: "## Executive Summary\n\n- Revenue grew **32%**\n- Q3 highlights",
    type: "pdf",
    delay: 1.5,
    x: "60%",
    y: "5%",
    rotate: 5,
  },
  {
    id: 3,
    title: "thesis.docx",
    preview: "### Chapter 3\n\n```python\ndef analyze():\n    pass\n```",
    type: "docx",
    delay: 0.8,
    x: "75%",
    y: "55%",
    rotate: -4,
  },
];

const symbols = ["#", "##", "**", "```", "---", ">", "-", "*", "[md]"];

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.06] blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[var(--accent)] opacity-[0.05] blur-3xl" />

      {/* Floating Markdown Symbols */}
      {symbols.map((sym, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-[var(--accent)] select-none"
          style={{
            left: `${(i * 11 + 5) % 90}%`,
            top: `${(i * 17 + 10) % 85}%`,
            fontSize: `${12 + (i % 3) * 4}px`,
            opacity: 0.06 + (i % 3) * 0.02,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [
              0.06 + (i % 3) * 0.02,
              0.12 + (i % 3) * 0.03,
              0.06 + (i % 3) * 0.02,
            ],
          }}
          transition={{
            duration: 4 + i * 0.7,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        >
          {sym}
        </motion.div>
      ))}

      {/* Floating Document Cards */}
      {floatingCards.map((card) => (
        <motion.div
          key={card.id}
          className="absolute hidden lg:block"
          style={{
            left: card.x,
            top: card.y,
            rotate: card.rotate,
            width: "220px",
          }}
          animate={{
            y: [0, -14, 0],
            rotate: [card.rotate, card.rotate + 1, card.rotate],
          }}
          transition={{
            duration: 6 + card.delay,
            repeat: Infinity,
            delay: card.delay,
            ease: "easeInOut",
          }}
        >
          <div className="glass-card rounded-xl p-4 shadow-[var(--shadow-lg)]">
            {/* Card Header */}
            <div className="flex items-center gap-2 mb-3">
              {card.type === "docx" ? (
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                  <File className="w-3.5 h-3.5 text-red-400" />
                </div>
              )}
              <span className="text-xs text-[var(--foreground-subtle)] font-medium truncate">
                {card.title}
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Hash className="w-3 h-3 text-black" strokeWidth={3} />
              </div>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Markdown preview */}
            <pre className="text-[10px] text-[var(--foreground-muted)] font-mono leading-relaxed whitespace-pre-wrap break-all">
              {card.preview}
            </pre>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
