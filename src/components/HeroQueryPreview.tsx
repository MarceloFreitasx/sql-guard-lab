import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TerminalChrome } from "./Panel";

type Mode = "before" | "after";
type Phase = "typing" | "result" | "hold";

type QueryPart = {
  text: string;
  className?: string;
  dangerBg?: boolean;
};

const CHAR_MS = 30;
const RESULT_PAUSE_MS = 350;
const HOLD_MS = 2400;

const BEFORE_PARTS: QueryPart[] = [
  { text: "SELECT ", className: "text-[#79c0ff]" },
  { text: "* ", className: "" },
  { text: "FROM ", className: "text-[#79c0ff]" },
  { text: "users ", className: "" },
  { text: "WHERE ", className: "text-[#79c0ff]" },
  { text: "username=", className: "" },
  { text: "'alice'", className: "text-[#a5d6ff]" },
  { text: " AND ", className: "text-[#79c0ff]" },
  { text: "password=", className: "" },
  { text: "'secret'", className: "text-[#a5d6ff]" },
];

const INJECTED_PARTS: QueryPart[] = [
  { text: "SELECT ", className: "text-[#79c0ff]" },
  { text: "* ", className: "" },
  { text: "FROM ", className: "text-[#79c0ff]" },
  { text: "users ", className: "" },
  { text: "WHERE ", className: "text-[#79c0ff]" },
  { text: "username=", className: "" },
  { text: "''", className: "text-[color:var(--red-neon)]" },
  { text: " ", className: "" },
  {
    text: "OR '1'='1' --",
    className: "text-[color:var(--red-neon)]",
    dangerBg: true,
  },
];

const QUERIES: Record<Mode, QueryPart[]> = {
  before: BEFORE_PARTS,
  after: INJECTED_PARTS,
};

const RESULTS: Record<Mode, { text: string; tone: "ok" | "danger" }> = {
  before: { text: "Result: no match — login denied", tone: "ok" },
  after: { text: "Result: first row returned — logged in as admin", tone: "danger" },
};

function totalLength(parts: QueryPart[]) {
  return parts.reduce((n, p) => n + p.text.length, 0);
}

function renderTypedQuery(parts: QueryPart[], visible: number, showDangerBg: boolean) {
  let offset = 0;
  return parts.map((part, i) => {
    const start = offset;
    offset += part.text.length;
    const shown = Math.max(0, Math.min(part.text.length, visible - start));
    if (shown <= 0) return null;

    const complete = visible >= offset;
    const dangerBg = part.dangerBg && showDangerBg && complete;

    return (
      <span
        key={i}
        className={
          dangerBg
            ? "rounded bg-[color:var(--red-neon)]/15 px-1 text-[color:var(--red-neon)]"
            : part.className
        }
      >
        {part.text.slice(0, shown)}
      </span>
    );
  });
}

export function HeroQueryPreview() {
  const [mode, setMode] = useState<Mode>("before");
  const [phase, setPhase] = useState<Phase>("typing");
  const [visibleChars, setVisibleChars] = useState(0);
  const [resumeTick, setResumeTick] = useState(0);
  const reducedMotion = useReducedMotion();
  const pausedRef = useRef(false);

  const parts = QUERIES[mode];
  const totalChars = useMemo(() => totalLength(parts), [parts]);
  const injected = mode === "after";
  const result = RESULTS[mode];
  const showResult = phase === "result" || phase === "hold";
  const showDangerBg = phase !== "typing";

  const restart = (next: Mode, manual = false) => {
    if (manual) pausedRef.current = true;
    setMode(next);
    setVisibleChars(0);
    setPhase("typing");
  };

  useEffect(() => {
    if (pausedRef.current) return;

    if (reducedMotion) {
      setVisibleChars(totalChars);
      setPhase("hold");
      const id = window.setTimeout(() => {
        if (pausedRef.current) return;
        setMode((m) => (m === "before" ? "after" : "before"));
        setVisibleChars(0);
        setPhase("typing");
      }, HOLD_MS);
      return () => window.clearTimeout(id);
    }

    if (phase === "typing") {
      if (visibleChars < totalChars) {
        const id = window.setTimeout(() => setVisibleChars((n) => n + 1), CHAR_MS);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setPhase("result"), RESULT_PAUSE_MS);
      return () => window.clearTimeout(id);
    }

    if (phase === "result") {
      const id = window.setTimeout(() => setPhase("hold"), 50);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setMode((m) => (m === "before" ? "after" : "before"));
      setVisibleChars(0);
      setPhase("typing");
    }, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase, visibleChars, totalChars, reducedMotion, resumeTick, mode]);

  const pauseAuto = () => {
    pausedRef.current = true;
  };

  const resumeAuto = () => {
    pausedRef.current = false;
    setResumeTick((n) => n + 1);
  };

  return (
    <div className="lg:sticky lg:top-28" onMouseEnter={pauseAuto} onMouseLeave={resumeAuto}>
      <TerminalChrome
        title="sqlguard@lab — query preview"
        actions={
          <div className="flex gap-1 rounded-md border border-[color:var(--bg-border)] bg-[color:var(--bg-base)] p-0.5">
            <ToggleBtn
              active={mode === "before"}
              onClick={() => restart("before", true)}
              label="Intended"
            />
            <ToggleBtn
              active={mode === "after"}
              onClick={() => restart("after", true)}
              label="Injected"
              danger
            />
          </div>
        }
      >
        <div className="p-5 font-mono text-sm leading-relaxed">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {injected ? "Query after injection" : "Intended query"}
          </p>

          <pre className="mt-3 min-h-[5.5rem] overflow-x-auto">
            {renderTypedQuery(parts, visibleChars, showDangerBg)}
            {phase === "typing" && !reducedMotion && (
              <span className="ml-px inline-block text-[color:var(--cyan-neon)] animate-pulse">
                ▮
              </span>
            )}
          </pre>

          <div className="mt-4 min-h-[2.75rem] border-t border-[color:var(--bg-border)] pt-4">
            <AnimatePresence mode="wait">
              {showResult && (
                <motion.p
                  key={`${mode}-result`}
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex items-center gap-2 text-xs ${
                    result.tone === "danger"
                      ? "text-[color:var(--red-neon)]"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      result.tone === "danger"
                        ? "bg-[color:var(--red-neon)]"
                        : "bg-[color:var(--green-neon)]"
                    }`}
                  />
                  {result.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {!reducedMotion && (
            <p className="mt-3 text-center text-[10px] text-muted-foreground/70">
              Types live · hover to pause
            </p>
          )}
        </div>
      </TerminalChrome>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
  danger = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  const activeColor = danger ? "var(--red-neon)" : "var(--cyan-neon)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider transition-colors duration-200"
      style={
        active
          ? {
              background: `color-mix(in oklab, ${activeColor} 15%, transparent)`,
              color: activeColor,
            }
          : { color: "var(--muted-foreground)" }
      }
    >
      {label}
    </button>
  );
}
