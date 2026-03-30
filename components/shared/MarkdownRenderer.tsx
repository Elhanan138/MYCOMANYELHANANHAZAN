"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none text-sm",
        "prose-headings:text-[#ededed] prose-headings:font-semibold",
        "prose-p:text-[#a3a3a3] prose-p:leading-relaxed",
        "prose-code:text-indigo-300 prose-code:bg-[#1e1e1e] prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-[#262626]",
        "prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-[#ededed]",
        "prose-ul:text-[#a3a3a3] prose-ol:text-[#a3a3a3]",
        "prose-blockquote:border-indigo-500 prose-blockquote:text-[#a3a3a3]",
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
