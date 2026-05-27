import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import Link from "next/link";
import { Hash, ArrowRight, Github } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <HeroSection />
      <FeaturesSection />

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Hash className="w-3.5 h-3.5 text-black" strokeWidth={3} />
              </div>
              <span className="font-bold text-[var(--foreground)]">
                MD<span className="text-[var(--accent)]">ify</span>
              </span>
              <span className="text-[var(--foreground-subtle)] text-sm ml-2">
                — DOCX & PDF to Markdown
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[var(--foreground-subtle)]">
              <Link href="/convert" className="hover:text-[var(--foreground)] transition-colors">
                Convert
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--foreground-subtle)]">
                Built with ♥ for developers
              </span>
              <Link
                href="/convert"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-[var(--shadow-glow)]"
              >
                Try MDify
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-xs text-[var(--foreground-subtle)]">
            <p>MDify processes all files locally in your browser. No data is ever sent to our servers.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
