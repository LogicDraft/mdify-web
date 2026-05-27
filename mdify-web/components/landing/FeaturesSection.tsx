"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Zap,
  Eye,
  Download,
  Copy,
  Sparkles,
  Table2,
  Code2,
  Wifi,
  Hash,
  Layers,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "DOCX & PDF Support",
    description:
      "Convert Word documents and PDFs with full formatting preservation — headings, lists, tables, and code blocks.",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    badge: "Core",
  },
  {
    icon: Zap,
    title: "Instant Conversion",
    description:
      "Everything runs in your browser. No uploads, no waiting, no privacy concerns. Lightning fast client-side processing.",
    color: "from-yellow-500/20 to-yellow-600/10",
    iconColor: "text-yellow-400",
    badge: "Fast",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description:
      "Split-screen editor with real-time Markdown rendering. See your formatted document while editing the raw Markdown.",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    badge: "Editor",
  },
  {
    icon: Sparkles,
    title: "AI Cleanup (Gemini)",
    description:
      "Powered by Google Gemini. Fix broken formatting, normalize headings, and polish your Markdown with one click.",
    color: "from-[var(--accent)]/20 to-[var(--accent)]/10",
    iconColor: "text-[var(--accent)]",
    badge: "AI",
  },
  {
    icon: Table2,
    title: "Table Preservation",
    description:
      "Complex tables from Word and PDF are accurately converted to GFM Markdown tables with proper alignment.",
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-400",
    badge: "Formatting",
  },
  {
    icon: Code2,
    title: "Code Block Detection",
    description:
      "Monospace fonts and code-like structures are automatically wrapped in fenced code blocks with language hints.",
    color: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-400",
    badge: "Smart",
  },
  {
    icon: Download,
    title: "Export & Share",
    description:
      "Download your Markdown as a .md file or copy to clipboard instantly. Perfect for Obsidian, Notion, or GitHub.",
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    badge: "Export",
  },
  {
    icon: Wifi,
    title: "Offline First",
    description:
      "Install as a PWA and convert documents without internet access. Your files never leave your device.",
    color: "from-teal-500/20 to-teal-600/10",
    iconColor: "text-teal-400",
    badge: "PWA",
  },
  {
    icon: Clock,
    title: "Conversion History",
    description:
      "Your last 20 conversions are saved locally. Jump back to any previous document instantly.",
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
    badge: "History",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium mb-5"
        >
          <Layers className="w-3.5 h-3.5" />
          Everything you need
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
        >
          Built for{" "}
          <span className="gradient-text">power users</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[var(--foreground-muted)] text-lg max-w-2xl mx-auto"
        >
          From simple word documents to complex PDFs, MDify handles it all with
          precision and intelligence.
        </motion.p>
      </div>

      {/* Feature Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-all duration-300 card-hover overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
              />

              <div className="relative z-10">
                {/* Icon + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center border border-white/10`}
                  >
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-subtle)] border border-[var(--border)]">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mt-16"
      >
        <p className="text-[var(--foreground-muted)] text-sm">
          Trusted by developers, researchers, and technical writers worldwide.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-[var(--accent)] font-mono text-sm">
          <Hash className="w-4 h-4" strokeWidth={3} />
          <span>Start converting for free — no account required</span>
        </div>
      </motion.div>
    </section>
  );
}
