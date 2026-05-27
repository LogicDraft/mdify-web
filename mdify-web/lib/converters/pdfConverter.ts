import type { ConversionSettings } from "../types";

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
}

interface PDFPageContent {
  items: TextItem[];
}

function detectHeadingLevel(
  fontSize: number,
  avgFontSize: number
): number | null {
  const ratio = fontSize / avgFontSize;
  if (ratio >= 1.8) return 1;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.25) return 3;
  if (ratio >= 1.1) return 4;
  return null;
}

function isLikelyCode(fontName?: string): boolean {
  if (!fontName) return false;
  const monoFonts = ["courier", "monospace", "mono", "code", "consolas", "inconsolata", "firacode"];
  return monoFonts.some((f) => fontName.toLowerCase().includes(f));
}

function isLikelyListItem(text: string): boolean {
  return /^[\u2022\u2023\u25E6\u2043\u2219•·‣⁃\-*]\s/.test(text) ||
    /^\d+[.)]\s/.test(text);
}

function cleanListItem(text: string): string {
  // Remove bullet chars
  return text.replace(/^[\u2022\u2023\u25E6\u2043\u2219•·‣⁃]\s/, "").trim();
}

export async function convertPdf(
  file: File,
  settings: ConversionSettings
): Promise<{ markdown: string; pageCount: number }> {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
  const numPages = pdf.numPages;

  const markdownPages: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = (await page.getTextContent()) as PDFPageContent;
    const items = textContent.items as TextItem[];

    if (items.length === 0) {
      markdownPages.push(`*[Page ${pageNum} - No extractable text]*`);
      continue;
    }

    // Calculate average font size
    const fontSizes = items
      .filter((i) => i.height > 0)
      .map((i) => i.height);
    const avgFontSize =
      fontSizes.length > 0
        ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length
        : 12;

    let pageMarkdown = "";
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let prevY: number | null = null;
    let lineBuffer = "";

    const flushCodeBlock = () => {
      if (codeLines.length > 0) {
        pageMarkdown += `\n\`\`\`\n${codeLines.join("\n")}\n\`\`\`\n`;
        codeLines = [];
        inCodeBlock = false;
      }
    };

    const flushLine = () => {
      if (lineBuffer.trim()) {
        const text = lineBuffer.trim();
        const item = items.find((i) => i.str.trim() && lineBuffer.includes(i.str.trim()));
        const fontSize = item?.height || avgFontSize;

        if (isLikelyCode(item?.fontName) && settings.preserveCodeBlocks) {
          if (!inCodeBlock) {
            inCodeBlock = true;
          }
          codeLines.push(text);
        } else {
          if (inCodeBlock) {
            flushCodeBlock();
          }

          const headingLevel = detectHeadingLevel(fontSize, avgFontSize);

          if (headingLevel && settings.headingStyle === "atx") {
            pageMarkdown += `\n${"#".repeat(headingLevel)} ${text}\n\n`;
          } else if (isLikelyListItem(text)) {
            const cleaned = cleanListItem(text);
            const isOrdered = /^\d+[.)]\s/.test(text);
            if (isOrdered) {
              pageMarkdown += `1. ${cleaned}\n`;
            } else {
              pageMarkdown += `- ${cleaned}\n`;
            }
          } else {
            pageMarkdown += `${text} `;
          }
        }
        lineBuffer = "";
      }
    };

    for (const item of items) {
      const y = item.transform[5];
      const text = item.str;

      if (!text) {
        // Line break
        if (lineBuffer.trim()) {
          flushLine();
          pageMarkdown += "\n";
        }
        continue;
      }

      if (prevY !== null && Math.abs(y - prevY) > 5) {
        flushLine();
        if (Math.abs(y - prevY) > avgFontSize * 1.5) {
          pageMarkdown += "\n";
        }
      }

      lineBuffer += text;
      prevY = y;
    }

    flushLine();
    if (inCodeBlock) flushCodeBlock();

    // Cleanup
    let cleaned = pageMarkdown
      .replace(/ {2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    markdownPages.push(cleaned);
  }

  let fullMarkdown = markdownPages.join("\n\n---\n\n");

  // Global cleanup
  fullMarkdown = fullMarkdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (settings.includeYamlFrontmatter) {
    const frontmatter = `---\ntitle: "${file.name.replace(/\.pdf$/i, "")}"\ndate: "${new Date().toISOString().split("T")[0]}"\nsource: "${file.name}"\npages: ${numPages}\n---\n\n`;
    fullMarkdown = frontmatter + fullMarkdown;
  }

  return { markdown: fullMarkdown, pageCount: numPages };
}
