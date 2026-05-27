"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  X,
  Moon,
  Sun,
  Monitor,
  Table2,
  Code2,
  Hash,
  FileJson,
  Sparkles,
  Eraser,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useConversionStore } from "@/lib/store/conversionStore";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useConversionStore();

  const themeOptions = [
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all duration-200"
        aria-label="Settings"
        id="settings-button"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Overlay + Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-[var(--background)] border-l border-[var(--border)] shadow-[var(--shadow-lg)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--accent)]" />
                  <h2 className="font-semibold text-[var(--foreground)]">Settings</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-7">
                {/* Theme */}
                <section>
                  <h3 className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-3">
                    Appearance
                  </h3>
                  <div className="flex rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-1 gap-1">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                            theme === opt.value
                              ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                              : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Markdown Preferences */}
                <section>
                  <h3 className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-3">
                    Markdown Formatting
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "preserveTables" as const,
                        label: "Preserve Tables",
                        description: "Convert tables to GFM Markdown format",
                        icon: Table2,
                      },
                      {
                        key: "preserveCodeBlocks" as const,
                        label: "Preserve Code Blocks",
                        description: "Detect and wrap code in fenced blocks",
                        icon: Code2,
                      },
                      {
                        key: "autoCleanWhitespace" as const,
                        label: "Auto-clean Whitespace",
                        description: "Remove extra blank lines and spaces",
                        icon: Eraser,
                      },
                      {
                        key: "includeYamlFrontmatter" as const,
                        label: "YAML Frontmatter",
                        description: "Add title/date/source metadata header",
                        icon: FileJson,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <div className="relative mt-0.5">
                            <input
                              type="checkbox"
                              checked={settings[item.key]}
                              onChange={(e) =>
                                updateSettings({ [item.key]: e.target.checked })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 rounded-full border border-[var(--border)] bg-[var(--background-tertiary)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all duration-200" />
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {item.label}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Heading Style */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-1.5 mb-2">
                      <Hash className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                      Heading Style
                    </label>
                    <div className="flex rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-0.5 gap-0.5">
                      {[
                        { value: "atx" as const, label: "ATX (# Heading)" },
                        { value: "setext" as const, label: "Setext (===)" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() =>
                            updateSettings({ headingStyle: opt.value })
                          }
                          className={cn(
                            "flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                            settings.headingStyle === opt.value
                              ? "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                              : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* AI Settings */}
                <section>
                  <h3 className="text-xs font-semibold text-[var(--foreground-subtle)] uppercase tracking-wider mb-3">
                    AI Features
                  </h3>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={settings.aiCleanupEnabled}
                        onChange={(e) =>
                          updateSettings({ aiCleanupEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 rounded-full border border-[var(--border)] bg-[var(--background-tertiary)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all duration-200" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          AI Cleanup (Gemini)
                        </span>
                      </div>
                      <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                        Use Google Gemini to fix formatting artifacts and improve Markdown quality. Requires <code className="bg-[var(--background-tertiary)] px-1 rounded text-[10px]">GEMINI_API_KEY</code>.
                      </p>
                    </div>
                  </label>
                </section>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--foreground-subtle)] text-center">
                  Settings are saved locally in your browser.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
