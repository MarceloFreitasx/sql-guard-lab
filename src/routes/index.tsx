import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Code2, Zap, ListOrdered, ChevronRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ThreatStatsBar } from "../components/ThreatStatsBar";
import { HeroQueryPreview } from "../components/HeroQueryPreview";
import { LearningPathTimeline } from "../components/LearningPathTimeline";
import { Reveal, RevealStagger } from "../components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SQLGuard — Understanding SQL Injection from Attack to Defense" },
      {
        name: "description",
        content:
          "Interactive educational platform: attack a vulnerable login, study why it works, and see the hardened version.",
      },
      { property: "og:title", content: "SQLGuard — Learn SQL Injection" },
      {
        property: "og:description",
        content: "Hands-on SQL injection learning with vulnerable & secure demos.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      {/* Hero — copy left, live query preview right */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center lg:min-h-[22rem]">
            <Reveal>
              <p className="section-kicker">Interactive security lab</p>
              <p
                className="glitch-text mt-3 font-mono text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem]"
                aria-hidden="true"
              >
                SQL<span className="text-[color:var(--cyan-neon)]">Guard</span>
              </p>
              <h1 className="sr-only">
                SQLGuard — Learn SQL injection by breaking and fixing a login
              </h1>
              <p className="mt-4 text-xl font-semibold leading-snug tracking-tight text-foreground md:text-2xl lg:text-[1.75rem]">
                Learn SQL injection by <span className="text-[color:var(--red-neon)]">breaking</span>{" "}
                and <span className="text-[color:var(--green-neon)]">fixing</span> a login.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                SQLGuard is a hands-on teaching environment. Fire real payloads at a simulated
                vulnerable form, trace each step of the attack, then see how prepared statements stop
                the same input.
              </p>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  to="/walkthrough"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[color:var(--cyan-neon)] px-5 py-2.5 text-sm font-semibold text-[color:var(--bg-base)] transition-colors duration-200 hover:bg-[#7dd3fc]"
                >
                  <ListOrdered className="h-4 w-4" />
                  Start walkthrough
                </Link>
                <Link
                  to="/lab"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[color:var(--bg-border)] bg-[color:var(--bg-elevated)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-[color:var(--cyan-neon)]/40"
                >
                  Open attack lab
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12} y={24}>
            <HeroQueryPreview />
          </Reveal>
        </section>
      </div>

      {/* Full-width threat stats band */}
      <ThreatStatsBar fullWidth />

      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <Reveal>
          <section className="mt-16 md:mt-20">
            <PageHeader
              kicker="Concept"
              title="What is SQL injection?"
              description="When user input is concatenated directly into a SQL string, an attacker can break out of the value and rewrite the query logic."
              align="center"
            />

            <div className="mt-10 panel p-6 md:p-8">
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <RevealStagger index={0}>
                  <FlowCard icon={Code2} title="User input" sub={`' OR '1'='1' --`} tone="red" />
                </RevealStagger>
                <ChevronRight className="mx-auto hidden h-5 w-5 text-muted-foreground md:block" />
                <RevealStagger index={1}>
                  <FlowCard icon={Zap} title="Broken query" sub="String concatenation" tone="cyan" />
                </RevealStagger>
                <ChevronRight className="mx-auto hidden h-5 w-5 text-muted-foreground md:block" />
                <RevealStagger index={2}>
                  <FlowCard icon={Database} title="Database" sub="Returns every row" tone="red" />
                </RevealStagger>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-24">
            <PageHeader
              kicker="Curriculum"
              title="Your learning path"
              description="Four stops — from first exploit to production-ready defenses."
              align="center"
            />

            <LearningPathTimeline />
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-24">
            <PageHeader kicker="Workflow" title="How the demo works" />

            <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
              <RevealStagger index={0}>
                <StepCard
                  n="01"
                  title="Study attack techniques"
                  desc="Auth bypass, UNION, blind probes, stacked queries, and encoding variants — each with impact notes."
                  tone="red"
                />
              </RevealStagger>
              <RevealStagger index={1}>
                <StepCard
                  n="02"
                  title="Experiment in the lab"
                  desc="Fire payloads at the simulated backend and read the terminal output line by line."
                  tone="cyan"
                />
              </RevealStagger>
              <RevealStagger index={2}>
                <StepCard
                  n="03"
                  title="Compare secure code"
                  desc="See the vulnerable PHP side by side with parameterized queries that neutralize the attack."
                  tone="green"
                />
              </RevealStagger>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-24 panel p-8 md:flex md:items-center md:justify-between md:p-10">
          <div>
            <p className="section-kicker">Ready?</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Enter the attack lab</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              No setup, no real database — just a safe sandbox for learning offensive and defensive
              SQL techniques.
            </p>
          </div>
          <Link
            to="/lab"
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md bg-[color:var(--cyan-neon)] px-5 py-2.5 text-sm font-semibold text-[color:var(--bg-base)] transition-colors duration-200 hover:bg-[#7dd3fc] md:mt-0"
          >
            Launch lab
            <ArrowRight className="h-4 w-4" />
          </Link>
          </section>
        </Reveal>
      </div>
    </>
  );
}

function FlowCard({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  sub: string;
  tone: "red" | "cyan" | "green";
}) {
  const color =
    tone === "red"
      ? "var(--red-neon)"
      : tone === "green"
        ? "var(--green-neon)"
        : "var(--cyan-neon)";
  return (
    <div className="panel-inset p-4 text-center">
      <Icon className="mx-auto h-5 w-5" style={{ color }} />
      <div className="mt-2 text-sm font-medium">{title}</div>
      <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function StepCard({
  n,
  title,
  desc,
  tone,
}: {
  n: string;
  title: string;
  desc: string;
  tone: "red" | "cyan" | "green";
}) {
  const color =
    tone === "red"
      ? "var(--red-neon)"
      : tone === "green"
        ? "var(--green-neon)"
        : "var(--cyan-neon)";
  return (
    <div className="panel p-6">
      <span className="font-mono text-sm font-medium" style={{ color }}>
        {n}
      </span>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
