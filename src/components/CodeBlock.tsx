import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  code: string;
  language?: string;
  className?: string;
};

const KEYWORDS: Record<string, RegExp> = {
  sql: /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|UNION|JOIN|ON|AS|LIMIT|ORDER|BY|GROUP|HAVING|TRUE|FALSE|NULL)\b/g,
  php: /\b(function|return|if|else|new|class|public|private|protected|use|echo|null|true|false|try|catch|throw|foreach|as)\b/g,
  js: /\b(function|return|const|let|var|if|else|new|class|import|export|from|null|true|false|try|catch|throw|async|await|of|in)\b/g,
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function span(color: string, text: string, extra = ""): string {
  return `<span style="color:${color}${extra}">${text}</span>`;
}

function highlight(code: string, language: string): string {
  const tokens: string[] = [];
  const stash = (html: string) => {
    const id = tokens.length;
    tokens.push(html);
    return `\uE000HL${id}\uE001`;
  };

  let out = escapeHtml(code);

  // Block comments
  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => stash(span("#8b949e", m, ";font-style:italic")));

  // Full-line // comments first — before strings, so payloads inside comments stay literal
  out = out.replace(/\/\/[^\n]*/g, (m) => stash(span("#8b949e", m, ";font-style:italic")));

  // Quoted strings (single and double)
  out = out.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|"[^"]*"|'[^']*')/g, (m) => stash(span("#7ee787", m)));

  // Remaining line comments (-- and #), e.g. SQL-style
  out = out.replace(/(--[^\n]*|#[^\n]*)/g, (m) => stash(span("#8b949e", m, ";font-style:italic")));

  const kwRe = KEYWORDS[language] ?? KEYWORDS.js;
  out = out.replace(kwRe, (m) => stash(span("#79c0ff", m, ";font-weight:600")));

  out = out.replace(/\b(\d+)\b/g, (m) => stash(span("#ffa657", m)));

  if (language === "php") {
    out = out.replace(/(\$[A-Za-z_]\w*)/g, (m) => stash(span("#ff7b72", m)));
  }

  out = out.replace(/\?/g, () => stash(span("#d2a8ff", "?", ";font-weight:600")));

  // Expand nested placeholders (e.g. strings tokenized inside a later pass)
  const placeholder = /\uE000HL(\d+)\uE001/g;
  let prev = "";
  while (prev !== out) {
    prev = out;
    out = out.replace(placeholder, (_, id) => tokens[Number(id)] ?? "");
  }

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
