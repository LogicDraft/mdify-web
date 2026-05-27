"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Monitor, Hash, Upload, Github, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [themeMenu, setThemeMenu] = useState(false);

  const themeOptions = [
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  const CurrentIcon = themeOptions.find((o) => o.value === theme)?.icon || Moon;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center group-hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
              <Hash className="w-4 h-4 text-black font-bold" strokeWidth={3} />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--foreground)]">
              MD<span className="text-[var(--accent)]">ify</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/#features", label: "Features" },
              { href: "/convert", label: "Convert" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--background-tertiary)] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setThemeMenu(!themeMenu)}
                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-all duration-200"
                aria-label="Toggle theme"
              >
                <CurrentIcon className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {themeMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setThemeMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50 w-36 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] overflow-hidden"
                    >
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setTheme(option.value);
                              setThemeMenu(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors duration-150 ${
                              theme === option.value
                                ? "text-[var(--accent)] bg-[var(--accent-light)]"
                                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {option.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/convert"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-[var(--shadow-glow)]"
            >
              <Upload className="w-3.5 h-3.5" />
              Convert
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
