"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

// Simple syntax highlighting patterns for common languages
const patterns: Record<string, { pattern: RegExp; className: string }[]> = {
  javascript: [
    { pattern: /\/\/.*$/gm, className: "text-slate-500" }, // comments
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-slate-500" }, // multi-line comments
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" }, // strings
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|typeof|instanceof|in|of)\b/g, className: "text-purple-500" }, // keywords
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: "text-orange-500" }, // constants
    { pattern: /\b(\d+\.?\d*)\b/g, className: "text-amber-500" }, // numbers
    { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, className: "text-cyan-500" }, // classes/constructors
    { pattern: /(\w+)(?=\s*\()/g, className: "text-blue-400" }, // function calls
  ],
  typescript: [
    { pattern: /\/\/.*$/gm, className: "text-slate-500" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-slate-500" },
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" },
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|typeof|instanceof|in|of|type|interface|enum|implements|extends|readonly|private|public|protected|static|abstract|as)\b/g, className: "text-purple-500" },
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: "text-orange-500" },
    { pattern: /\b(\d+\.?\d*)\b/g, className: "text-amber-500" },
    { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, className: "text-cyan-500" },
    { pattern: /:\s*(\w+)/g, className: "text-cyan-400" }, // type annotations
  ],
  python: [
    { pattern: /#.*$/gm, className: "text-slate-500" },
    { pattern: /(["']{3}[\s\S]*?["']{3})/g, className: "text-slate-500" },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" },
    { pattern: /\b(def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|lambda|yield|raise|pass|break|continue|and|or|not|in|is|True|False|None|self|async|await)\b/g, className: "text-purple-500" },
    { pattern: /\b(\d+\.?\d*)\b/g, className: "text-amber-500" },
    { pattern: /@[\w.]+/g, className: "text-yellow-500" }, // decorators
  ],
  html: [
    { pattern: /<!--[\s\S]*?-->/g, className: "text-slate-500" },
    { pattern: /(<\/?[\w-]+)/g, className: "text-pink-500" }, // tags
    { pattern: /\b([\w-]+)(?==)/g, className: "text-purple-400" }, // attributes
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" }, // strings
  ],
  css: [
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-slate-500" },
    { pattern: /([\w-]+)(?=\s*:)/g, className: "text-cyan-400" }, // properties
    { pattern: /([.#][\w-]+)/g, className: "text-yellow-500" }, // selectors
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" },
    { pattern: /\b(\d+\.?\d*(px|em|rem|%|vh|vw|s|ms)?)\b/g, className: "text-amber-500" },
  ],
  json: [
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1(?=\s*:)/g, className: "text-cyan-400" }, // keys
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" }, // values
    { pattern: /\b(true|false|null)\b/g, className: "text-orange-500" },
    { pattern: /\b(-?\d+\.?\d*)\b/g, className: "text-amber-500" },
  ],
  bash: [
    { pattern: /#.*$/gm, className: "text-slate-500" },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" },
    { pattern: /\$[\w{}]+/g, className: "text-cyan-400" }, // variables
    { pattern: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|export|source|cd|ls|rm|mv|cp|mkdir|chmod|chown|grep|sed|awk|cat|head|tail|find|sudo)\b/g, className: "text-purple-500" },
  ],
  sql: [
    { pattern: /--.*$/gm, className: "text-slate-500" },
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, className: "text-green-500" },
    { pattern: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MAX|MIN|INTO|VALUES|SET|UNION|LIKE|IN|BETWEEN|IS|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/gi, className: "text-purple-500" },
    { pattern: /\b(\d+\.?\d*)\b/g, className: "text-amber-500" },
  ],
};

function highlightCode(code: string, language: string): string {
  const langPatterns = patterns[language.toLowerCase()] || patterns.javascript;
  let highlighted = escapeHtml(code);

  // Store positions of already highlighted text to avoid overlapping
  const markers: { start: number; end: number }[] = [];

  langPatterns.forEach(({ pattern, className }) => {
    highlighted = highlighted.replace(pattern, (match) => {
      return `<span class="${className}">${match}</span>`;
    });
  });

  return highlighted;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function CodeBlock({
  code,
  language = "javascript",
  className,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 uppercase font-medium">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="bg-slate-900 overflow-x-auto">
        <pre className="p-4 text-sm font-mono text-slate-100">
          <code>
            {showLineNumbers ? (
              <table className="border-collapse">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="hover:bg-slate-800/50">
                      <td className="pr-4 text-right text-slate-500 select-none w-8 align-top">
                        {index + 1}
                      </td>
                      <td
                        className="whitespace-pre"
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(line, language) || "&nbsp;",
                        }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component for single-line code
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        "px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 text-sm font-mono",
        className
      )}
    >
      {children}
    </code>
  );
}
