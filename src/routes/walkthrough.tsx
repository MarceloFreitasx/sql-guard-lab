import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  ATTACK_CATEGORIES,
  buildAttackSteps,
  buildDefenseSteps,
  findPayloadById,
  getCategoryLabel,
  getPayloadsByCategory,
  PAYLOADS,
  SEVERITY_META,
  type AttackCategory,
  type SqlPayload,
  type WalkStep,
} from "../lib/sqli";

type WalkSearch = {
  payload?: string;
};

export const Route = createFileRoute("/walkthrough")({
  validateSearch: (search: Record<string, unknown>): WalkSearch => ({
    payload: typeof search.payload === "string" ? search.payload : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Step-by-Step Walkthrough — SQLGuard" },
      {
        name: "description",
        content:
          "Watch a SQL injection break a login step by step, then see exactly how a prepared statement neutralizes the same payload.",
      },
    ],
  }),
  component: WalkthroughPage,
});

type Phase = "attack" | "defense";

function WalkthroughPage() {
  const { payload: payloadId } = Route.useSearch();
  const [selected, setSelected] = useState<SqlPayload>(
    () => (payloadId && findPayloadById(payloadId)) || PAYLOADS[0],
  );
  const [phase, setPhase] = useState<Phase>("attack");
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [openCategory, setOpenCategory] = useState<AttackCategory | null>(selected.category);

  useEffect(() => {
    if (!payloadId) return;
    const p = findPayloadById(payloadId);
    if (p) {
      setSelected(p);
      setOpenCategory(p.category);
      setPhase("attack");
      setStep(0);
    }
  }, [payloadId]);

  const steps = useMemo<WalkStep[]>(
    () => (phase === "attack" ? buildAttackSteps(selected) : buildDefenseSteps(selected)),
    [phase, selected],
  );

  const current = steps[step];
  const atEnd = step === steps.length - 1;

  useEffect(() => {
    if (!autoplay) return;
    if (atEnd) {
      setAutoplay(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 3200);
    return () => clearTimeout(t);
  }, [autoplay, atEnd, step, steps.length]);

  const pickPayload = (p: SqlPayload) => {
    setSelected(p);
    setPhase("attack");
    setStep(0);
    setAutoplay(false);
  };

  const switchPhase = (next: Phase) => {
    setPhase(next);
    setStep(0);
    setAutoplay(false);
  };

  const sev = SEVERITY_META[selected.severity];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs text-muted-foreground">
            <ListOrdered className="h-3 w-3 text-[color:var(--cyan-neon)]" />
            Guided, step-by-step
          </div>
          <h1 className="mt-3 font-mono text-3xl font-bold md:text-4xl">
            SQL Injection Walkthrough
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Pick a payload, then move through each step to see exactly how the attack rewrites the
            query — and how the secure version stops the very same input.
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Payload picker */}
        <aside className="lg:col-span-3">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Choose a payload
          </h3>
          <div className="mt-2 max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {ATTACK_CATEGORIES.map((cat) => {
              const items = getPayloadsByCategory(cat.id);
              if (items.length === 0) return null;
              const isOpen = openCategory === cat.id;
              return (
                <div key={cat.id} className="rounded-lg border border-[#30363d] bg-[#161b22]">
                  <button
                    type="button"
                    onClick={() => setOpenCategory((cur) => (cur === cat.id ? null : cat.id))}
                    className="flex w-full items-center justify-between px-3 py-2 text-left"
                  >
                    <span className="text-sm font-semibold">{cat.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-1 border-t border-[#30363d] p-2">
                      {items.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => pickPayload(p)}
                          className={`block w-full rounded-md border p-2 text-left transition ${
                            selected.id === p.id
                              ? "border-[color:var(--cyan-neon)]/60 bg-[color:var(--cyan-neon)]/10"
                              : "border-[#30363d] bg-[#0d1117] hover:border-[color:var(--cyan-neon)]/40"
                          }`}
                        >
                          <div className="text-xs font-semibold">{p.name}</div>
                          <div className="mt-0.5 break-all font-mono text-[11px] text-[color:var(--cyan-neon)]">
                            {p.payload}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Stage */}
        <section className="lg:col-span-9">
          {/* Selected payload + phase tabs */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#30363d] bg-[#161b22] p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{selected.name}</span>
                <span className="rounded bg-[#0d1117] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {getCategoryLabel(selected.category)}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: sev.color,
                    background: `color-mix(in oklab, ${sev.color} 15%, transparent)`,
                  }}
                >
                  {sev.label}
                </span>
              </div>
              <div className="mt-1 break-all font-mono text-xs text-[color:var(--cyan-neon)]">
                {selected.payload}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#30363d] bg-[#0d1117] p-1">
              <PhaseBtn
                active={phase === "attack"}
                onClick={() => switchPhase("attack")}
                tone="red"
                icon={ShieldAlert}
                label="Attack"
              />
              <PhaseBtn
                active={phase === "defense"}
                onClick={() => switchPhase("defense")}
                tone="green"
                icon={ShieldCheck}
                label="Defense"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-2">
            {steps.map((s, i) => (
              <button
                key={s.n}
                onClick={() => {
                  setStep(i);
                  setAutoplay(false);
                }}
                className="group flex flex-1 items-center gap-2"
                aria-label={`Go to step ${s.n}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition ${
                    i <= step
                      ? phase === "attack"
                        ? "border-[color:var(--red-neon)] bg-[color:var(--red-neon)]/15 text-[color:var(--red-neon)]"
                        : "border-[color:var(--green-neon)] bg-[color:var(--green-neon)]/15 text-[color:var(--green-neon)]"
                      : "border-[#30363d] text-muted-foreground"
                  }`}
                >
                  {s.n}
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`h-px flex-1 transition ${
                      i < step
                        ? phase === "attack"
                          ? "bg-[color:var(--red-neon)]/50"
                          : "bg-[color:var(--green-neon)]/50"
                        : "bg-[#30363d]"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Step card */}
          <div className="mt-4 rounded-xl border border-[#30363d] bg-[#0d1117] p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${phase}-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Step {current.n} / {steps.length}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      phase === "attack"
                        ? "text-[color:var(--red-neon)]"
                        : "text-[color:var(--green-neon)]"
                    }`}
                  >
                    {phase === "attack" ? "Attack" : "Defense"}
                  </span>
                </div>
                <h2 className="mt-2 font-mono text-2xl font-bold">{current.title}</h2>
                <p className="mt-2 text-muted-foreground">{current.narration}</p>

                {current.queryTokens && (
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-[#30363d] bg-black p-4 font-mono text-sm leading-relaxed">
                    {current.queryTokens.map((t, i) => (
                      <span
                        key={i}
                        className={
                          t.danger
                            ? "rounded bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]"
                            : "text-[#7ee787]"
                        }
                      >
                        {t.text}
                      </span>
                    ))}
                  </pre>
                )}

                {current.callout && (
                  <Callout kind={current.callout.kind} text={current.callout.text} />
                )}

                {/* End-of-phase CTA */}
                {atEnd && phase === "attack" && (
                  <button
                    onClick={() => switchPhase("defense")}
                    className="mt-5 inline-flex items-center gap-2 rounded-md border border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--green-neon)] transition hover:bg-[color:var(--green-neon)]/20"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Now defend the same payload
                  </button>
                )}
                {atEnd && phase === "defense" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      to="/lab"
                      search={{ payload: selected.id }}
                      className="inline-flex items-center gap-2 rounded-md bg-[color:var(--cyan-neon)] px-4 py-2 text-sm font-semibold text-[#0d1117] transition hover:opacity-90"
                    >
                      Replay in the Attack Lab
                    </Link>
                    <button
                      onClick={() => switchPhase("attack")}
                      className="inline-flex items-center gap-2 rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm font-medium transition hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Watch the attack again
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setStep((s) => Math.max(s - 1, 0));
                setAutoplay(false);
              }}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm transition disabled:opacity-40 hover:enabled:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoplay((a) => !a)}
                disabled={atEnd}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm transition disabled:opacity-40 hover:enabled:text-white"
              >
                {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoplay ? "Pause" : "Auto-play"}
              </button>
              <button
                onClick={() => {
                  setStep(0);
                  setAutoplay(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm transition hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
            </div>

            <button
              onClick={() => {
                setStep((s) => Math.min(s + 1, steps.length - 1));
                setAutoplay(false);
              }}
              disabled={atEnd}
              className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                phase === "attack"
                  ? "bg-[color:var(--red-neon)] text-white hover:enabled:opacity-90"
                  : "bg-[color:var(--green-neon)] text-[#0d1117] hover:enabled:opacity-90"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function PhaseBtn({
  active,
  onClick,
  tone,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  tone: "red" | "green";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const color = tone === "red" ? "var(--red-neon)" : "var(--green-neon)";
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
      style={
        active
          ? { background: `color-mix(in oklab, ${color} 18%, transparent)`, color }
          : { color: "var(--muted-foreground)" }
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Callout({ kind, text }: { kind: "danger" | "info" | "safe"; text: string }) {
  const map = {
    danger: { color: "var(--red-neon)", Icon: AlertTriangle },
    info: { color: "var(--cyan-neon)", Icon: Lightbulb },
    safe: { color: "var(--green-neon)", Icon: CheckCircle2 },
  } as const;
  const { color, Icon } = map[kind];
  return (
    <div
      className="mt-4 flex gap-3 rounded-lg border p-4"
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        background: `color-mix(in oklab, ${color} 6%, transparent)`,
      }}
    >
      <Icon className="h-5 w-5 shrink-0" style={{ color }} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
