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

  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => stash(span("#64748b", m, ";font-style:italic")));
  out = out.replace(/\/\/[^\n]*/g, (m) => stash(span("#64748b", m, ";font-style:italic")));
  out = out.replace(/(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|"[^"]*"|'[^']*')/g, (m) =>
    stash(span("#86efac", m)),
  );
  out = out.replace(/(--[^\n]*|#[^\n]*)/g, (m) => stash(span("#64748b", m, ";font-style:italic")));

  const kwRe = KEYWORDS[language] ?? KEYWORDS.js;
  out = out.replace(kwRe, (m) => stash(span("#7dd3fc", m, ";font-weight:600")));

  out = out.replace(/\b(\d+)\b/g, (m) => stash(span("#fdba74", m)));

  if (language === "php") {
    out = out.replace(/(\$[A-Za-z_]\w*)/g, (m) => stash(span("#fca5a5", m)));
  }

  out = out.replace(/\?/g, () => stash(span("#c4b5fd", "?", ";font-weight:600")));

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
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={`panel-inset overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-[color:var(--bg-border)] bg-[color:var(--bg-elevated)] px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground transition-colors duration-200 hover:bg-[color:var(--bg-border)] hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3 w-3 text-[color:var(--green-neon)]" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
      </pre>
    </div>
  );
}
