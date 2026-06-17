import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Shield, Database, Code2, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SQLGuard — Understanding SQL Injection from Attack to Defense" },
      { name: "description", content: "Interactive educational platform: attack a vulnerable login, study why it works, and see the hardened version." },
      { property: "og:title", content: "SQLGuard — Learn SQL Injection" },
      { property: "og:description", content: "Hands-on SQL injection learning with vulnerable & secure demos." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
      {/* Hero */}
      <section className="relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--green-neon)]" />
          Live interactive cybersecurity lab
        </motion.div>

        <h1
          data-text="SQLGuard"
          className="glitch-text mt-6 font-mono text-6xl font-extrabold tracking-tight md:text-8xl"
          style={{ color: "white" }}
        >
          SQL<span className="text-[color:var(--cyan-neon)]">Guard</span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Understanding SQL Injection — <span className="text-[color:var(--red-neon)]">From Attack</span>{" "}
          <span className="text-[color:var(--green-neon)]">to Defense</span>
        </motion.p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/vulnerable"
            className="group flex items-center gap-2 rounded-md border border-[color:var(--red-neon)]/40 bg-[color:var(--red-neon)]/10 px-5 py-3 text-sm font-semibold text-[color:var(--red-neon)] transition hover:bg-[color:var(--red-neon)]/20 hover:shadow-[0_0_20px_rgba(255,71,87,0.3)]"
          >
            <ShieldAlert className="h-4 w-4" />
            Try the Vulnerable Login
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/secure"
            className="group flex items-center gap-2 rounded-md border border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/10 px-5 py-3 text-sm font-semibold text-[color:var(--green-neon)] transition hover:bg-[color:var(--green-neon)]/20 hover:shadow-[0_0_20px_rgba(46,213,115,0.3)]"
          >
            <Shield className="h-4 w-4" />
            Try the Secure Login
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* What is SQLi */}
      <section className="mt-24">
        <h2 className="text-center font-mono text-3xl font-bold md:text-4xl">
          What is <span className="text-[color:var(--cyan-neon)]">SQL Injection</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          When user input is concatenated directly into a SQL query, an attacker can break out of the
          string and rewrite the query's logic.
        </p>

        <div className="mt-10 rounded-xl border border-[#30363d] bg-[#161b22] p-6 md:p-10">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-5">
            <FlowCard icon={Code2} title="User Input" sub={`' OR '1'='1' --`} tone="red" />
            <Arrow />
            <FlowCard icon={Zap} title="SQL Query" sub="String concatenation" tone="cyan" />
            <Arrow />
            <FlowCard icon={Database} title="Database" sub="Returns ALL rows" tone="red" />
          </div>

          <div className="mt-8 rounded-lg border border-[#30363d] bg-[#0d1117] p-4 font-mono text-sm">
            <div className="text-muted-foreground">Intended query:</div>
            <div className="mt-1">
              <span className="text-[#79c0ff]">SELECT</span> * <span className="text-[#79c0ff]">FROM</span> users{" "}
              <span className="text-[#79c0ff]">WHERE</span> username=<span className="text-[#7ee787]">'alice'</span>{" "}
              <span className="text-[#79c0ff]">AND</span> password=<span className="text-[#7ee787]">'secret'</span>
            </div>
            <div className="mt-4 text-muted-foreground">After injection:</div>
            <div className="mt-1">
              <span className="text-[#79c0ff]">SELECT</span> * <span className="text-[#79c0ff]">FROM</span> users{" "}
              <span className="text-[#79c0ff]">WHERE</span> username=
              <span className="text-[color:var(--red-neon)]">''</span>{" "}
              <span className="rounded bg-[color:var(--red-neon)]/15 px-1 text-[color:var(--red-neon)]">OR '1'='1' --</span>
              <span className="text-muted-foreground">' AND password='...'</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-24">
        <h2 className="text-center font-mono text-3xl font-bold md:text-4xl">How this demo works</h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StepCard
            n="01"
            title="Try to hack the vulnerable login"
            desc="Use provided payloads or invent your own. Watch the SQL query update live as you type."
            tone="red"
          />
          <StepCard
            n="02"
            title="Understand why it works"
            desc="Every successful attack is followed by a plain-English breakdown of what the database did."
            tone="cyan"
          />
          <StepCard
            n="03"
            title="See how the secure version stops it"
            desc="Run the same payload against the hardened login and learn the exact defense that blocked it."
            tone="green"
          />
        </div>
      </section>

      {/* CTA strip */}
      <section className="mt-24 rounded-xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8 text-center md:p-12">
        <h3 className="font-mono text-2xl font-bold md:text-3xl">Ready to break some queries?</h3>
        <p className="mt-2 text-muted-foreground">Jump into the lab — no setup, no real database, just learning.</p>
        <Link
          to="/lab"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[color:var(--cyan-neon)] px-5 py-3 text-sm font-semibold text-[#0d1117] transition hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]"
        >
          Enter the Attack Lab
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function FlowCard({ icon: Icon, title, sub, tone }: { icon: any; title: string; sub: string; tone: "red" | "cyan" | "green" }) {
  const color =
    tone === "red" ? "text-[color:var(--red-neon)] border-[color:var(--red-neon)]/40" :
    tone === "green" ? "text-[color:var(--green-neon)] border-[color:var(--green-neon)]/40" :
    "text-[color:var(--cyan-neon)] border-[color:var(--cyan-neon)]/40";
  return (
    <div className={`rounded-lg border bg-[#0d1117] p-4 text-center ${color}`}>
      <Icon className="mx-auto h-6 w-6" />
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden justify-center text-[color:var(--cyan-neon)] md:flex">
      <ArrowRight className="h-6 w-6" />
    </div>
  );
}

function StepCard({ n, title, desc, tone }: { n: string; title: string; desc: string; tone: "red" | "cyan" | "green" }) {
  const accent =
    tone === "red" ? "var(--red-neon)" : tone === "green" ? "var(--green-neon)" : "var(--cyan-neon)";
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl border border-[#30363d] bg-[#161b22] p-6"
    >
      <div className="font-mono text-4xl font-bold" style={{ color: `var(--${tone === "red" ? "red-neon" : tone === "green" ? "green-neon" : "cyan-neon"})` }}>
        {n}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 h-px w-12" style={{ background: `color-mix(in oklab, ${accent} 60%, transparent)` }} />
    </motion.div>
  );
}
