"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Zap, ArrowRight, FileText, File, Hash } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

const words = ["DOCX", "PDF"];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <AnimatedBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium mb-8"
        >
          <Zap className="w-3.5 h-3.5" />
          Free, Private & Offline-capable
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Convert{" "}
            <span className="inline-flex items-baseline gap-3">
              {words.map((word, i) => (
                <span key={word}>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-mono font-bold align-middle ${
                      word === "DOCX"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}
                    style={{ fontSize: "0.55em", lineHeight: 1 }}
                  >
                    {word === "DOCX" ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <File className="w-3.5 h-3.5" />
                    )}
                    .{word.toLowerCase()}
                  </span>
                  {i < words.length - 1 && (
                    <span className="text-[var(--foreground-subtle)] text-3xl lg:text-4xl mx-1">
                      &
                    </span>
                  )}
                </span>
              ))}
            </span>
            <br />
            to{" "}
            <span className="gradient-text inline-flex items-center gap-2">
              <Hash className="w-12 h-12 lg:w-16 lg:h-16 inline-block" strokeWidth={3} />
              Markdown
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg sm:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Instantly transform your documents into clean, structured Markdown.
          Built for developers, researchers, and writers who live in{" "}
          <span className="text-[var(--foreground)] font-medium">Obsidian, Notion, and AI workflows</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link
            href="/convert"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--accent)] text-black font-semibold text-base hover:bg-[var(--accent-hover)] transition-all duration-300 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 animate-pulse-glow"
          >
            <Upload className="w-4 h-4" />
            Start Converting
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          <a
            href="#features"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--border)] text-[var(--foreground-muted)] font-medium text-base hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)] transition-all duration-200"
          >
            Learn more
          </a>
        </motion.div>

        {/* Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl glass-card border border-[var(--border)] shadow-[var(--shadow-md)]"
        >
          {[
            { label: ".docx / .pdf", icon: FileText, color: "text-blue-400" },
            { label: "Extract", icon: null, arrow: true },
            { label: "Convert", icon: null, arrow: true },
            { label: "Clean", icon: null, arrow: true },
            { label: ".md", icon: Hash, color: "text-[var(--accent)]" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {step.arrow ? (
                <ArrowRight className="w-4 h-4 text-[var(--foreground-subtle)]" />
              ) : (
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {step.icon && (
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  )}
                  <span
                    className={
                      step.color || "text-[var(--foreground-muted)]"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-12 text-sm text-[var(--foreground-subtle)]"
        >
          {[
            { value: "100%", label: "Client-side" },
            { value: "0", label: "Data stored" },
            { value: "2", label: "File formats" },
            { value: "∞", label: "Conversions" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-[var(--foreground)]">
                {stat.value}
              </div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
