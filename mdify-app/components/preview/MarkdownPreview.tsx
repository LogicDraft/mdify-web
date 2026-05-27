"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

export function MarkdownPreview({ markdown, className }: MarkdownPreviewProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--background-secondary)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs text-[var(--foreground-subtle)] font-medium">
            Live Preview
          </span>
        </div>
        <span className="text-xs text-[var(--foreground-subtle)]">
          Rendered Markdown
        </span>
      </div>

      {/* Rendered Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {markdown ? (
          <div className="markdown-body max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Style code blocks
                pre({ children, ...props }) {
                  return (
                    <pre
                      {...props}
                      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono"
                    >
                      {children}
                    </pre>
                  );
                },
                code(props) {
                  const { className, children } = props;
                  const isInline = !className && typeof children === "string" && !children.includes("\n");
                  if (isInline) {
                    return (
                      <code
                        className="bg-[var(--background-tertiary)] text-[var(--foreground)] px-1.5 py-0.5 rounded text-[0.85em] font-mono"
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className}>
                      {children}
                    </code>
                  );
                },
                // Style tables
                table({ children, ...props }) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table
                        {...props}
                        className="w-full border-collapse text-sm"
                      >
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children, ...props }) {
                  return (
                    <th
                      {...props}
                      className="bg-[var(--background-secondary)] font-semibold text-left px-3 py-2 border border-[var(--border)]"
                    >
                      {children}
                    </th>
                  );
                },
                td({ children, ...props }) {
                  return (
                    <td
                      {...props}
                      className="px-3 py-2 border border-[var(--border)]"
                    >
                      {children}
                    </td>
                  );
                },
                // Style blockquotes
                blockquote({ children, ...props }) {
                  return (
                    <blockquote
                      {...props}
                      className="border-l-[3px] border-[var(--accent)] pl-4 my-4 text-[var(--foreground-muted)] italic bg-[var(--accent-light)] py-2 pr-4 rounded-r-lg"
                    >
                      {children}
                    </blockquote>
                  );
                },
                // Checkboxes
                input({ type, checked, ...props }) {
                  if (type === "checkbox") {
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="mr-2 accent-[var(--accent)]"
                        {...props}
                      />
                    );
                  }
                  return <input type={type} {...props} />;
                },
                // Links
                a({ href, children, ...props }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)] transition-colors"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                // Horizontal rule
                hr(props) {
                  return (
                    <hr
                      {...props}
                      className="border-none border-t border-[var(--border)] my-6"
                    />
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[var(--foreground-subtle)]">
            <div className="text-4xl">📄</div>
            <p className="text-sm">Upload a file to see the rendered preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
