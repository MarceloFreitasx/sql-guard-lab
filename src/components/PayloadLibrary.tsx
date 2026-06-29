import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  ATTACK_CATEGORIES,
  getPayloadsByCategory,
  LAB_SQL_CONTEXT,
  type SqlPayload,
} from "../lib/sqli";

type PayloadLibraryProps = {
  hintOpen: boolean;
  onToggleHint: () => void;
  openCategory: string | null;
  onToggleCategory: (id: string) => void;
  onApplyPayload: (payload: SqlPayload) => void;
  variant?: "vulnerable" | "secure";
};

const accent = {
  vulnerable: {
    button: "bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)] hover:bg-[color:var(--red-neon)]/30",
  },
  secure: {
    button:
      "bg-[color:var(--green-neon)]/20 text-[color:var(--green-neon)] hover:bg-[color:var(--green-neon)]/30",
  },
} as const;

function sortPayloads(items: SqlPayload[]): SqlPayload[] {
  return [...items].sort((a, b) => Number(b.worksInLab) - Number(a.worksInLab));
}

function PayloadCard({
  payload,
  buttonClass,
  onApply,
}: {
  payload: SqlPayload;
  buttonClass: string;
  onApply: (p: SqlPayload) => void;
}) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold">{payload.name}</div>
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
              payload.worksInLab
                ? "bg-[color:var(--green-neon)]/15 text-[color:var(--green-neon)]"
                : "bg-[#30363d] text-muted-foreground"
            }`}
          >
            {payload.worksInLab ? "Works here" : "Reference"}
          </span>
        </div>
        <div className="break-all font-mono text-xs text-[color:var(--cyan-neon)]">
          {payload.payload}
        </div>
        <p className="text-xs text-muted-foreground">{payload.desc}</p>
        {!payload.worksInLab && payload.labMismatchReason && (
          <p className="text-xs text-[#ffa657]">{payload.labMismatchReason}</p>
        )}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Target: {payload.field}
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onApply(payload)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${buttonClass}`}
          >
            Use payload
          </button>
          <Link
            to="/lab"
            search={{ payload: payload.id }}
            className="rounded-md border border-[#30363d] px-2 py-1 text-xs text-muted-foreground hover:text-white"
          >
            Open in Lab
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PayloadLibrary({
  hintOpen,
  onToggleHint,
  openCategory,
  onToggleCategory,
  onApplyPayload,
  variant = "vulnerable",
}: PayloadLibraryProps) {
  const colors = accent[variant];

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22]">
      <button
        type="button"
        onClick={onToggleHint}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div>
          <span className="text-sm font-semibold">Payload library</span>
          {variant === "secure" ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Full catalog — same as the Attack Lab. Prepared statements should block all of them.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Full catalog · {LAB_SQL_CONTEXT}
            </p>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${hintOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {hintOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[calc(100vh-10rem)] space-y-3 overflow-y-auto px-5 pb-5">
              {ATTACK_CATEGORIES.map((cat) => {
                const items = sortPayloads(getPayloadsByCategory(cat.id));
                if (items.length === 0) return null;
                const isOpen = openCategory === cat.id;
                return (
                  <div key={cat.id} className="rounded-lg border border-[#30363d] bg-[#0d1117]">
                    <button
                      type="button"
                      onClick={() => onToggleCategory(cat.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left"
                    >
                      <div>
                        <span className="text-sm font-semibold">{cat.label}</span>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-2 border-t border-[#30363d] p-3">
                        {items.map((p) => (
                          <PayloadCard
                            key={p.id}
                            payload={p}
                            buttonClass={colors.button}
                            onApply={onApplyPayload}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="pt-1 text-center text-xs text-muted-foreground">
                <span className="text-[color:var(--green-neon)]">Works here</span> = bypasses this
                login · <span className="text-muted-foreground">Reference</span> = other SQL shapes
                (try anyway, or{" "}
                <Link to="/lab" className="text-[color:var(--cyan-neon)] hover:underline">
                  open in Lab
                </Link>
                )
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
