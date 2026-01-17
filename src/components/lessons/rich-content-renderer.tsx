"use client";

import { useMemo } from "react";
import { CodeBlock, InlineCode } from "@/components/ui/code-block";

interface RichContentRendererProps {
  content: string;
  className?: string;
}

// Parse HTML content and render with syntax-highlighted code blocks
export function RichContentRenderer({ content, className }: RichContentRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Parse the content and extract code blocks
    const parts: { type: "html" | "code"; content: string; language?: string }[] = [];

    // Match code blocks: <pre><code class="language-xxx">...</code></pre> or ```xxx...```
    const codeBlockRegex = /<pre[^>]*><code[^>]*class="(?:language-)?([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>|```(\w*)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add HTML content before this code block
      if (match.index > lastIndex) {
        parts.push({
          type: "html",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add the code block
      const language = match[1] || match[3] || "plaintext";
      const code = decodeHtmlEntities(match[2] || match[4] || "");
      parts.push({
        type: "code",
        content: code.trim(),
        language,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining HTML content
    if (lastIndex < content.length) {
      parts.push({
        type: "html",
        content: content.slice(lastIndex),
      });
    }

    // If no code blocks found, return original content
    if (parts.length === 0) {
      parts.push({ type: "html", content });
    }

    return parts;
  }, [content]);

  if (!renderedContent) {
    return null;
  }

  return (
    <div className={className}>
      {renderedContent.map((part, index) => {
        if (part.type === "code") {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language}
              className="my-4"
            />
          );
        }

        // Render HTML content with inline code highlighting
        return (
          <div
            key={index}
            className="prose prose-sm max-w-none dark:prose-invert
              prose-headings:font-semibold
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:text-pink-600 prose-code:dark:text-pink-400 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:p-0 prose-pre:bg-transparent
              prose-img:rounded-lg prose-img:shadow-lg
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </div>
  );
}

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (textarea) {
    textarea.innerHTML = text;
    return textarea.value;
  }
  // Fallback for SSR
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
