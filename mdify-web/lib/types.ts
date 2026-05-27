export interface ConversionResult {
  markdown: string;
  fileName: string;
  fileSize: number;
  fileType: "docx" | "pdf";
  conversionTimeMs: number;
  pageCount?: number;
  error?: string;
}

export interface ConversionHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: "docx" | "pdf";
  markdown: string;
  convertedAt: string;
  conversionTimeMs: number;
}

export interface MarkdownStats {
  headings: number;
  words: number;
  codeBlocks: number;
  tables: number;
  links: number;
  characters: number;
  lines: number;
}

export interface ConversionSettings {
  preserveTables: boolean;
  preserveCodeBlocks: boolean;
  headingStyle: "atx" | "setext";
  includeYamlFrontmatter: boolean;
  autoCleanWhitespace: boolean;
  aiCleanupEnabled: boolean;
}

export const DEFAULT_SETTINGS: ConversionSettings = {
  preserveTables: true,
  preserveCodeBlocks: true,
  headingStyle: "atx",
  includeYamlFrontmatter: false,
  autoCleanWhitespace: true,
  aiCleanupEnabled: true,
};
