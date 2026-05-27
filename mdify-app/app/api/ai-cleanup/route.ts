import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const { markdown, fileName, fileType } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "No markdown provided" }, { status: 400 });
    }

    // Extract base64 images to prevent blowing up the AI token limit
    const imageMap = new Map<string, string>();
    let imgCounter = 0;
    const markdownWithoutImages = markdown.replace(
      /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^\)]+)\)/g,
      (match, alt, data) => {
        const placeholder = `__MDIFY_IMG_${imgCounter++}__`;
        imageMap.set(placeholder, data);
        return `![${alt}](${placeholder})`;
      }
    );

    // Chunk if too long (gemini-2.0-flash supports 1M token context)
    const MAX_CHARS = 200000;
    if (markdownWithoutImages.length > MAX_CHARS) {
      return NextResponse.json(
        { error: "Document too large for AI structuring (max 200k characters). Try splitting it." },
        { status: 413 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const docType = fileType === "pdf" ? "PDF document" : "Word document (.docx)";

    const prompt = `You are an expert technical document analyst and Markdown formatter. You have been given raw text extracted from a ${docType} named "${fileName || "document"}". The extraction process is imperfect and may have introduced formatting errors, broken paragraphs, lost hierarchy, merged lines, or garbled structure.

Your task is to produce a clean, well-structured Markdown document. Follow these rules STRICTLY:

## ANALYSIS PHASE
First, analyze the content to understand:
- What type of document is this? (report, article, manual, thesis, contract, notes, etc.)
- What are the main sections and their hierarchy?
- Where are the key topics, arguments, or data points?

## STRUCTURING RULES

### Headings
- Reconstruct the logical heading hierarchy: # for document title, ## for major sections, ### for subsections, #### for sub-subsections
- If the document title is clear, make it an H1 (#)
- Every major topic change should be an H2 (##)
- Never skip heading levels (e.g., don't go from # to ###)
- Capitalize headings properly (Title Case for H1-H2, Sentence case for H3+)

### Paragraphs
- Merge broken lines that belong to the same paragraph (a line ending mid-sentence should be joined with the next)
- Separate distinct paragraphs with a single blank line
- Fix incorrect mid-sentence line breaks

### Lists
- Convert bullet points (•, -, *, ◦, ▪, ▸, etc.) to proper Markdown lists using -
- Convert numbered/lettered items to ordered lists using 1. 2. 3.
- Preserve nesting levels (indent 2 spaces per level)
- If content is clearly list-like (short parallel items on separate lines), convert it to a list

### Tables
- If tabular data exists (columns, rows), format as GFM Markdown tables with | separators
- Add header separator row: | --- | --- | --- |
- Align numeric columns to the right: | ---: |
- If a table was broken across lines, reconstruct it accurately

### Code
- Wrap inline code, commands, file paths, function names in backticks
- Wrap multi-line code blocks in fenced code blocks with the appropriate language tag: \`\`\`python, \`\`\`bash, \`\`\`json, \`\`\`sql, etc.
- If the language is unknown, use \`\`\` with no tag

### Emphasis
- Restore **bold** for key terms, important warnings, field names, and emphasized phrases
- Restore *italic* for titles of works, technical terms, or foreign words
- Use ~~strikethrough~~ only if content is clearly crossed-out or deprecated

### Block Quotes
- Use > for quoted text, definitions, notes, warnings, or highlighted callouts

### Links and References
- Format URLs as [descriptive text](url) where the link text is clear from context
- If only a raw URL exists, format as <url>

### Page Artifacts (PDF-specific)
- REMOVE page numbers (e.g., "Page 3 of 10", "- 3 -", standalone numbers between sections)
- REMOVE headers/footers that repeat on every page (document title, date, copyright line)
- REMOVE "---" page break markers unless they semantically separate major sections
- JOIN text that was split across page breaks into continuous paragraphs

### Preserve Everything Else
- Keep ALL content — do not summarize, shorten, or omit any information
- Keep all data, facts, figures, statistics exactly as written
- Keep all footnotes and endnotes (format as > **Note:** text)
- STRICTLY PRESERVE all image placeholders formatted as \`![alt text](__MDIFY_IMG_X__)\`. Do not alter or remove them.

## OUTPUT FORMAT
- Output ONLY the clean Markdown — no explanations, no preamble, no "Here is the structured Markdown:"
- Do NOT wrap output in \`\`\`markdown code fences
- Start directly with the document content (H1 title or first heading)

## INPUT DOCUMENT
The following is the raw extracted text. Structure and clean it now:

---
${markdownWithoutImages}
---`;

    // Model cascade: try best → fallback on quota
    const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];

    let structured = "";
    let lastError: Error | null = null;

    for (const modelName of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 65536,
          },
        });
        structured = response.text ?? "";
        console.log(`AI structure used model: ${modelName}`);
        break; // success — exit loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const is429 = lastError.message.includes("429") || lastError.message.includes("quota") || lastError.message.includes("RESOURCE_EXHAUSTED");
        if (!is429) throw lastError; // non-quota error — don't retry
        console.warn(`Model ${modelName} quota hit, trying next...`);
      }
    }

    if (!structured && lastError) throw lastError;
    if (!structured) throw new Error("Gemini returned an empty response.");

    // Strip any accidental wrapper code fences
    let stripped = structured
      .replace(/^```markdown\n?/i, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    // Restore base64 images
    for (const [placeholder, data] of imageMap.entries()) {
      stripped = stripped.replace(placeholder, data);
    }

    return NextResponse.json({ markdown: stripped });

  } catch (error) {
    console.error("AI structure error:", error);

    let message = "AI structuring failed. Please try again.";

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("quota") || msg.includes("429")) {
        message = "Gemini API quota exceeded. Please try again in a moment.";
      } else if (msg.includes("api key") || msg.includes("401") || msg.includes("403")) {
        message = "Invalid Gemini API key. Check your GEMINI_API_KEY in .env.local.";
      } else if (msg.includes("not found") || msg.includes("404")) {
        message = "Gemini model not found. Check your API key has access to gemini-2.0-flash.";
      } else if (msg.includes("empty response")) {
        message = "Gemini returned an empty response. Please try again.";
      } else if (msg.includes("too large") || msg.includes("413")) {
        message = "Document is too large for AI processing. Try a smaller file.";
      } else {
        // Surface the raw error in dev for easier debugging
        message = `AI structuring failed: ${error.message}`;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
