"use client";

import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: Message;
}

function CodeBlockWithCopy({
  language,
  children,
}: {
  language: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          background: "var(--muted)",
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 px-4 py-6 group",
        isUser ? "bg-transparent" : "bg-muted/30"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-accent" : "bg-primary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-accent-foreground" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? "You" : "MyDB"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="prose max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                
                if (isInline) {
                  return (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlockWithCopy language={match[1]}>{children}</CodeBlockWithCopy>
                );
              },
              p({ children }) {
                return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
              },
              strong({ children }) {
                return <strong className="font-semibold">{children}</strong>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
