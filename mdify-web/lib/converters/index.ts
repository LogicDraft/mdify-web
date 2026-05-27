import type { ConversionResult, ConversionSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { convertDocx } from "./docxConverter";
import { convertPdf } from "./pdfConverter";

export async function convertFile(
  file: File,
  settings: ConversionSettings = DEFAULT_SETTINGS
): Promise<ConversionResult> {
  const startTime = Date.now();
  const fileName = file.name;
  const fileSize = file.size;

  const ext = fileName.toLowerCase().split(".").pop();

  try {
    if (ext === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const markdown = await convertDocx(file, settings);
      return {
        markdown,
        fileName,
        fileSize,
        fileType: "docx",
        conversionTimeMs: Date.now() - startTime,
      };
    }

    if (ext === "pdf" || file.type === "application/pdf") {
      const { markdown, pageCount } = await convertPdf(file, settings);
      return {
        markdown,
        fileName,
        fileSize,
        fileType: "pdf",
        conversionTimeMs: Date.now() - startTime,
        pageCount,
      };
    }

    throw new Error(`Unsupported file type: .${ext}. Please upload a .docx or .pdf file.`);
  } catch (error) {
    return {
      markdown: "",
      fileName,
      fileSize,
      fileType: ext === "pdf" ? "pdf" : "docx",
      conversionTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Conversion failed",
    };
  }
}

export function isValidFileType(file: File): boolean {
  const ext = file.name.toLowerCase().split(".").pop();
  const validTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return (
    validTypes.includes(file.type) ||
    ext === "pdf" ||
    ext === "docx"
  );
}

export function getFileType(file: File): "docx" | "pdf" | null {
  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "pdf" || file.type === "application/pdf") return "pdf";
  if (ext === "docx") return "docx";
  return null;
}
