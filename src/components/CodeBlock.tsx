import { useState, useCallback } from "react";
import { Copy, Check, Hash } from "lucide-react";

interface CodeBlockProps {
  code: string;
  filename: string;
}

// Simple syntax highlighting with regex-based tokenization
function highlightSyntax(code: string): React.ReactNode[] {
  const lines = code.split("\n");

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    // Process the line character by character with patterns
    while (remaining.length > 0) {
      let matched = false;

      // Single-line comments
      const commentMatch = remaining.match(/^(\/\/.*)/);
      if (commentMatch) {
        tokens.push(
          <span key={key++} className="text-[#6a9955]">
            {commentMatch[1]}
          </span>
        );
        remaining = remaining.slice(commentMatch[1].length);
        matched = true;
        continue;
      }

      // Template literal
      const templateMatch = remaining.match(/^(`[^`]*`)/);
      if (templateMatch) {
        tokens.push(
          <span key={key++} className="text-[#ce9178]">
            {templateMatch[1]}
          </span>
        );
        remaining = remaining.slice(templateMatch[1].length);
        matched = true;
        continue;
      }

      // Strings (double quote)
      const dqStringMatch = remaining.match(/^("[^"]*")/);
      if (dqStringMatch) {
        tokens.push(
          <span key={key++} className="text-[#ce9178]">
            {dqStringMatch[1]}
          </span>
        );
        remaining = remaining.slice(dqStringMatch[1].length);
        matched = true;
        continue;
      }

      // Strings (single quote)
      const sqStringMatch = remaining.match(/^('[^']*')/);
      if (sqStringMatch) {
        tokens.push(
          <span key={key++} className="text-[#ce9178]">
            {sqStringMatch[1]}
          </span>
        );
        remaining = remaining.slice(sqStringMatch[1].length);
        matched = true;
        continue;
      }

      // Numbers
      const numberMatch = remaining.match(/^(\b\d+\.?\d*\b)/);
      if (numberMatch) {
        tokens.push(
          <span key={key++} className="text-[#b5cea8]">
            {numberMatch[1]}
          </span>
        );
        remaining = remaining.slice(numberMatch[1].length);
        matched = true;
        continue;
      }

      // Keywords
      const keywordMatch = remaining.match(
        /^(\b(?:const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|finally|new|class|extends|constructor|import|export|default|from|require|module|this|super|typeof|instanceof|in|of|yield|static|get|set)\b)/
      );
      if (keywordMatch) {
        tokens.push(
          <span key={key++} className="text-[#569cd6]">
            {keywordMatch[1]}
          </span>
        );
        remaining = remaining.slice(keywordMatch[1].length);
        matched = true;
        continue;
      }

      // Built-in objects/values
      const builtinMatch = remaining.match(
        /^(\b(?:console|Math|Object|Array|String|Number|Boolean|Date|Promise|Set|Map|Error|JSON|RegExp|null|undefined|true|false|NaN|Infinity|process|setTimeout|setInterval|clearTimeout|clearInterval)\b)/
      );
      if (builtinMatch) {
        tokens.push(
          <span key={key++} className="text-[#4ec9b0]">
            {builtinMatch[1]}
          </span>
        );
        remaining = remaining.slice(builtinMatch[1].length);
        matched = true;
        continue;
      }

      // Function calls
      const funcMatch = remaining.match(/^(\b\w+)(\s*\()/);
      if (funcMatch) {
        tokens.push(
          <span key={key++} className="text-[#dcdcaa]">
            {funcMatch[1]}
          </span>
        );
        tokens.push(<span key={key++}>{funcMatch[2]}</span>);
        remaining = remaining.slice(funcMatch[0].length);
        matched = true;
        continue;
      }

      // Operators
      const opMatch = remaining.match(/^([=!<>]=?=?|[+\-*/%]|&&|\|\||=>|\.\.\.)/);
      if (opMatch) {
        tokens.push(
          <span key={key++} className="text-[#d4d4d4]">
            {opMatch[1]}
          </span>
        );
        remaining = remaining.slice(opMatch[1].length);
        matched = true;
        continue;
      }

      if (!matched) {
        tokens.push(
          <span key={key++} className="text-[#d4d4d4]">
            {remaining[0]}
          </span>
        );
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineIndex} className="flex group/line hover:bg-white/5">
        <span className="mr-4 inline-flex w-8 shrink-0 items-center justify-end text-right text-[#858585] select-none text-xs">
          {lineIndex + 1}
        </span>
        <span className="flex-1">{tokens}</span>
      </div>
    );
  });
}

export default function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lineCount = code.split("\n").length;

  return (
    <div className="border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#1e1e1e] overflow-hidden">
      {/* Code header bar */}
      <div className="flex items-center justify-between border-b-3 border-black bg-[#2d2d2d] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57] border border-black/30" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-black/30" />
            <div className="h-3 w-3 rounded-full bg-[#28c840] border border-black/30" />
          </div>
          <span className="text-xs font-bold text-[#858585] uppercase tracking-wider">
            {filename}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[#858585]">
            <Hash className="h-3 w-3" strokeWidth={3} />
            {lineCount} lines
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
              copied
                ? "border-green-400 bg-green-400/20 text-green-400"
                : "border-[#858585] bg-transparent text-[#858585] hover:border-white hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={3} />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-4 text-sm leading-6 font-mono">
        <pre className="min-w-0">{highlightSyntax(code)}</pre>
      </div>
    </div>
  );
}
