import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function countMarkdownStats(markdown: string) {
  const lines = markdown.split("\n");
  const headings = lines.filter((l) => l.startsWith("#")).length;
  const words = markdown
    .replace(/[#*`_~\[\]]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const codeBlocks = (markdown.match(/```/g) || []).length / 2;
  const tables = (markdown.match(/^\|/gm) || []).length;
  const links = (markdown.match(/\[.*?\]\(.*?\)/g) || []).length;
  return {
    headings,
    words,
    codeBlocks: Math.floor(codeBlocks),
    tables: Math.floor(tables / 3),
    links,
    characters: markdown.length,
    lines: lines.length,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
