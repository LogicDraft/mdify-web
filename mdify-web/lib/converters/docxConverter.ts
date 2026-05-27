import mammoth from "mammoth";
import TurndownService from "turndown";
import type { ConversionSettings } from "../types";

function buildTurndownService(settings: ConversionSettings): TurndownService {
  const td = new TurndownService({
    headingStyle: settings.headingStyle === "setext" ? "setext" : "atx",
    codeBlockStyle: "fenced",
    fence: "```",
    bulletListMarker: "-",
    strongDelimiter: "**",
    emDelimiter: "_",
  });

  // Preserve code blocks
  if (settings.preserveCodeBlocks) {
    td.addRule("codeBlock", {
      filter: ["pre"],
      replacement: (_content: string, node: Node) => {
        const el = node as HTMLElement;
        const code = el.querySelector("code");
        const lang = code?.className?.replace("language-", "") || "";
        const text = el.textContent || "";
        return `\n\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`;
      },
    });
  }

  // Preserve tables
  if (settings.preserveTables) {
    td.addRule("table", {
      filter: ["table"],
      replacement: (_content: string, node: Node) => {
        const table = node as HTMLTableElement;
        const rows = Array.from(table.querySelectorAll("tr"));
        if (rows.length === 0) return "";

        const headerRow = rows[0];
        const headerCells = Array.from(
          headerRow.querySelectorAll("th, td")
        ).map((cell) => cell.textContent?.trim() || "");

        const separator = headerCells.map(() => "---");
        const bodyRows = rows.slice(1).map((row) =>
          Array.from(row.querySelectorAll("td, th")).map(
            (cell) => cell.textContent?.trim() || ""
          )
        );

        const formatRow = (cells: string[]) => `| ${cells.join(" | ")} |`;

        return [
          "",
          formatRow(headerCells),
          formatRow(separator),
          ...bodyRows.map(formatRow),
          "",
        ].join("\n");
      },
    });
  }

  // Handle strikethrough
  td.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content: string) => `~~${content}~~`,
  });

  // Handle inline code
  td.addRule("inlineCode", {
    filter: (node: Node) =>
      node.nodeName === "CODE" &&
      (node as HTMLElement).parentNode?.nodeName !== "PRE",
    replacement: (content: string) => `\`${content}\``,
  });

  return td;
}

export async function convertDocx(
  file: File,
  settings: ConversionSettings
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((imageBuffer) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    }
  );

  const html = result.value;

  const td = buildTurndownService(settings);
  let markdown = td.turndown(html);

  // Clean up artifacts
  markdown = markdown
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\u00a0/g, " ");

  if (settings.includeYamlFrontmatter) {
    const frontmatter = `---\ntitle: "${file.name.replace(/\.docx$/i, "")}"\ndate: "${new Date().toISOString().split("T")[0]}"\nsource: "${file.name}"\n---\n\n`;
    markdown = frontmatter + markdown;
  }

  return markdown;
}
