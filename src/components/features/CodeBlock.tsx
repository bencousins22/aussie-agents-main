import { useState, useCallback, memo } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

interface CodeBlockProps {
  language: string;
  children: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock = memo(function CodeBlock({
  language,
  children,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Detect dark mode (could also use a theme context)
  const isDarkMode = document.documentElement.classList.contains("dark");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, [children]);

  return (
    <div className={cn("relative group/code my-6 rounded-2xl border border-white/5 overflow-hidden shadow-2xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/60 border-b border-white/5">
        <span className="text-caption text-white/30">{language}</span>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          leftIcon={copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? atomDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "var(--spacing-4)",
          background: "transparent",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-relaxed)",
        }}
        showLineNumbers={showLineNumbers}
        wrapLines
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
});
