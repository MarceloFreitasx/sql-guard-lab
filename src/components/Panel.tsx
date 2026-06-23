import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  inset?: boolean;
};

export function Panel({ children, className = "", inset = false }: PanelProps) {
  return <div className={`${inset ? "panel-inset" : "panel"} ${className}`.trim()}>{children}</div>;
}

type TerminalChromeProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function TerminalChrome({
  title = "sqlguard",
  children,
  className = "",
  actions,
}: TerminalChromeProps) {
  return (
    <div className={`terminal-chrome overflow-hidden ${className}`.trim()}>
      <div className="flex items-center justify-between border-b border-[color:var(--bg-border)] bg-[color:var(--bg-elevated)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]/80" />
          </div>
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">{title}</span>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
