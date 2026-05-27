import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const { markdown, fileName } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "No markdown provided" }, { status: 400 });
    }

    if (markdown.length > 100000) {
      return NextResponse.json(
        { error: "Document too large for AI cleanup (max 100k characters)" },
        { status: 413 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a Markdown formatting expert. Clean up and improve the following Markdown document that was converted from a ${fileName?.includes(".pdf") ? "PDF" : "DOCX"} file.

Rules:
1. Fix broken formatting artifacts from the conversion process
2. Ensure headings are properly hierarchical (# H1, ## H2, etc.)
3. Fix any broken lists, tables, or code blocks
4. Remove duplicate whitespace and clean up spacing
5. Preserve ALL original content — do not add, remove, or summarize content
6. Keep all code blocks intact with proper language tags where identifiable
7. Fix any broken markdown syntax
8. Ensure tables are properly formatted with alignment
9. Do not add any commentary or explanations — return ONLY the cleaned markdown

Document filename: ${fileName || "document"}

Markdown to clean:
---
${markdown}
---

Return ONLY the cleaned markdown, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedMarkdown = response.text();

    // Strip any accidental wrapper code fences
    const stripped = cleanedMarkdown
      .replace(/^```markdown\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    return NextResponse.json({ markdown: stripped });
  } catch (error) {
    console.error("AI cleanup error:", error);
    return NextResponse.json(
      { error: "AI cleanup failed. Please try again." },
      { status: 500 }
    );
  }
}
