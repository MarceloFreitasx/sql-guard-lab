import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ListOrdered, Shield, ShieldAlert } from "lucide-react";
import { RevealStagger } from "./Reveal";

const STEPS = [
  {
    n: "01",
    tone: "red" as const,
    icon: ShieldAlert,
    title: "Attack",
    desc: "Break the vulnerable login with curated payloads.",
    to: "/vulnerable" as const,
    cta: "Vulnerable login",
  },
  {
    n: "02",
    tone: "cyan" as const,
    icon: ListOrdered,
    title: "Understand",
    desc: "Replay the query rewrite step by step.",
    to: "/walkthrough" as const,
    cta: "Walkthrough",
  },
  {
    n: "03",
    tone: "green" as const,
    icon: Shield,
    title: "Defend",
    desc: "Fire the same payload at the hardened login.",
    to: "/secure" as const,
    cta: "Secure login",
  },
  {
    n: "04",
    tone: "cyan" as const,
    icon: BookOpen,
    title: "Apply",
    desc: "Use the defense guide on your own projects.",
    to: "/defense" as const,
    cta: "Defense guide",
  },
];

const TONE_COLOR = {
  red: "var(--red-neon)",
  cyan: "var(--cyan-neon)",
  green: "var(--green-neon)",
} as const;

export function LearningPathTimeline() {
  return (
    <div className="relative mt-10">
      {/* Connector line — desktop */}
      <div
        className="absolute top-6 right-[12.5%] left-[12.5%] hidden h-px bg-[color:var(--bg-border)] lg:block"
        aria-hidden="true"
      />

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
        {STEPS.map((step, i) => {
          const color = TONE_COLOR[step.tone];
          const Icon = step.icon;
          return (
            <RevealStagger key={step.n} index={i}>
              <li className="relative">
              {/* Connector — mobile vertical */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute top-14 left-6 h-[calc(100%-2rem)] w-px bg-[color:var(--bg-border)] lg:hidden"
                  aria-hidden="true"
                />
              )}

              <Link
                to={step.to}
                className="group relative flex cursor-pointer gap-4 rounded-lg border border-[color:var(--bg-border)] bg-[color:var(--bg-card)] p-5 transition-colors duration-200 hover:border-[color:var(--cyan-neon)]/30 lg:block lg:pt-8 lg:pb-5 lg:text-center"
              >
                <div
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-[color:var(--bg-base)] lg:mx-auto"
                  style={{ borderColor: color }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                  <span className="absolute -top-1 -right-1 rounded-full bg-[color:var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">
                    {step.n}
                  </span>
                </div>

                <div className="min-w-0 flex-1 lg:mt-4">
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  <span
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200 group-hover:underline lg:mt-4"
                    style={{ color }}
                  >
                    {step.cta}
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
              </li>
            </RevealStagger>
          );
        })}
      </ol>
    </div>
  );
}
