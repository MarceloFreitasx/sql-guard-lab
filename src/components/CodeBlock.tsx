import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  code: string;
  language?: string;
  className?: string;
};

// Very small SQL/PHP/JS highlighter — enough to feel alive without bundling Prism.
function highlight(code: string, language: string) {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let out = escape(code);

  const keywords: Record<string, RegExp> = {
    sql: /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|UNION|JOIN|ON|AS|LIMIT|ORDER|BY|GROUP|HAVING|TRUE|FALSE|NULL)\b/g,
    php: /\b(function|return|if|else|new|class|public|private|protected|use|echo|null|true|false|try|catch|throw|foreach|as)\b/g,
    js: /\b(function|return|const|let|var|if|else|new|class|import|export|from|null|true|false|try|catch|throw|async|await|of|in)\b/g,
  };

  const kwRe = keywords[language] ?? keywords.js;

  // strings
  out = out.replace(
    /(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|"[^"]*"|'[^']*')/g,
    (m) => `<span style="color:#7ee787">${m}</span>`,
  );
  // comments
  out = out.replace(/(--[^\n]*|#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) => `<span style="color:#8b949e;font-style:italic">${m}</span>`);
  // keywords
  out = out.replace(kwRe, (m) => `<span style="color:#79c0ff;font-weight:600">${m}</span>`);
  // numbers
  out = out.replace(/\b(\d+)\b/g, `<span style="color:#ffa657">$1</span>`);
  // php variables
  if (language === "php") {
    out = out.replace(/(\$[A-Za-z_]\w*)/g, `<span style="color:#ff7b72">$1</span>`);
  }
  // placeholders
  out = out.replace(/\?/g, `<span style="color:#d2a8ff;font-weight:600">?</span>`);

  return out;
}

export function CodeBlock({ code, language = "sql", className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={`group relative overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117] ${className}`}>
      <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground transition hover:bg-[#30363d] hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-[color:var(--green-neon)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
      </pre>
    </div>
  );
}
