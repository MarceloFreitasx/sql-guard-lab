import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bug, Eye, EyeOff, FlaskConical, Radio, ShieldAlert, Swords } from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import { Reveal } from "../components/Reveal";
import {
  ATTACK_CATEGORIES,
  getPayloadsByCategory,
  SEVERITY_META,
  type AttackCategory,
} from "../lib/sqli";

export const Route = createFileRoute("/attacks")({
  head: () => ({
    meta: [
      { title: "Attack Guide — SQLGuard" },
      {
        name: "description",
        content:
          "Reference guide to SQL injection techniques: auth bypass, comments, UNION, blind, stacked queries, and encoding variants.",
      },
    ],
  }),
  component: AttacksPage,
});

const SQLI_TYPES = [
  {
    title: "In-band",
    icon: Eye,
    desc: "Results appear directly in the application response — classic login bypass and UNION attacks.",
  },
  {
    title: "Inferential (Blind)",
    icon: EyeOff,
    desc: "No visible data leaked; attackers infer truth from page behavior, timing, or error differences.",
  },
  {
    title: "Out-of-band",
    icon: Radio,
    desc: "Data exfiltrated via DNS/HTTP to an attacker server — rare in simple login forms but worth knowing.",
  },
];

const CATEGORY_PHP: Record<AttackCategory, string> = {
  auth_bypass: `$user = $_POST['username'];
$sql = "SELECT * FROM users
        WHERE username='$user' AND password='$pass'";
// Input: ' OR '1'='1' --
// Query becomes always-TRUE → every row matches`,
  comment: `$user = "admin' --";
$sql = "SELECT * FROM users
        WHERE username='$user' AND password='$pass'";
// Everything after -- is ignored → password check skipped`,
  union: `$user = "' UNION SELECT 1,'admin','x' --";
$sql = "SELECT * FROM users
        WHERE username='$user' AND password='$pass'";
// Second SELECT merges forged credentials into the result`,
  blind: `$user = "' AND 1=1 --";
$sql = "SELECT * FROM users WHERE username='$user' ...";
// Compare response with AND 1=2 -- to detect injection`,
  stacked: `$user = "'; DROP TABLE users; --";
$sql = "SELECT * FROM users WHERE username='$user' ...";
// Semicolon runs a second destructive statement`,
  encoding: `$user = "admin'--";  // no space before --
// Naive filters blocking '-- ' miss this variant`,
};

function AttacksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <Reveal>
        <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs text-muted-foreground">
          <Swords className="h-3 w-3" />
          Attack Reference
        </div>
        <h1 className="mt-4 font-mono text-3xl font-bold md:text-5xl">
          SQL Injection Attack Guide
        </h1>
        <p className="mt-2 text-muted-foreground">
          Techniques, payloads, and PHP examples — then test each one in the lab.
        </p>
      </header>
      </Reveal>

      <Reveal>
      <section className="mt-14">
        <h2 className="font-mono text-2xl font-bold">Types of SQL injection</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SQLI_TYPES.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-5"
            >
              <t.icon className="h-6 w-6 text-[color:var(--red-neon)]" />
              <h3 className="mt-3 font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      </Reveal>

      {ATTACK_CATEGORIES.map((cat) => {
        const payloads = getPayloadsByCategory(cat.id);
        return (
          <Reveal key={cat.id}>
          <section className="mt-14" id={cat.id}>
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-[color:var(--red-neon)]" />
              <h2 className="font-mono text-2xl font-bold">{cat.label}</h2>
            </div>
            <p className="mt-2 text-muted-foreground">{cat.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="rounded border border-[#30363d] bg-[#161b22] px-2 py-1">Input</span>
              <span>→</span>
              <span className="rounded border border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/10 px-2 py-1 text-[color:var(--red-neon)]">
                Broken query
              </span>
              <span>→</span>
              <span className="rounded border border-[#30363d] bg-[#161b22] px-2 py-1">
                Unauthorized access
              </span>
            </div>

            <div className="mt-5">
              <CodeBlock language="php" code={CATEGORY_PHP[cat.id]} />
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[#30363d]">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-[#30363d] bg-[#161b22] font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Payload</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Field</th>
                    <th className="px-4 py-3">Impact</th>
                    <th className="px-4 py-3">Try</th>
                  </tr>
                </thead>
                <tbody>
                  {payloads.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#30363d] bg-[#0d1117]/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[color:var(--cyan-neon)]">
                        {p.payload}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            color: SEVERITY_META[p.severity].color,
                            background: `color-mix(in oklab, ${SEVERITY_META[p.severity].color} 15%, transparent)`,
                          }}
                        >
                          {SEVERITY_META[p.severity].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.field}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.impact}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/lab"
                            search={{ payload: p.id }}
                            className="text-xs text-[color:var(--cyan-neon)] hover:underline"
                          >
                            Lab
                          </Link>
                          <Link
                            to="/vulnerable"
                            className="text-xs text-[color:var(--red-neon)] hover:underline"
                          >
                            Login
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </Reveal>
        );
      })}

      <Reveal>
      <section className="mt-14 rounded-xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] p-8">
        <h2 className="font-mono text-2xl font-bold">Vulnerable vs Secure</h2>
        <p className="mt-3 text-muted-foreground">
          Every payload in this guide succeeds against string-concatenated SQL and fails against
          prepared statements. Run the same input in both modes to see the difference.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/5 p-4">
            <div className="flex items-center gap-2 text-[color:var(--red-neon)]">
              <ShieldAlert className="h-4 w-4" />
              <span className="font-semibold">Vulnerable mode</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Input is stitched into the query. Quotes, OR, UNION, and comments become executable
              SQL.
            </p>
            <Link
              to="/vulnerable"
              className="mt-3 inline-block text-sm text-[color:var(--red-neon)] hover:underline"
            >
              Open vulnerable login →
            </Link>
          </div>
          <div className="rounded-lg border border-[color:var(--green-neon)]/30 bg-[color:var(--green-neon)]/5 p-4">
            <div className="flex items-center gap-2 text-[color:var(--green-neon)]">
              <ShieldAlert className="h-4 w-4" />
              <span className="font-semibold">Secure mode</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Prepared statements bind values as data. The same payloads are harmless literal
              strings.
            </p>
            <Link
              to="/secure"
              className="mt-3 inline-block text-sm text-[color:var(--green-neon)] hover:underline"
            >
              Open secure login →
            </Link>
          </div>
        </div>
        <Link
          to="/lab"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[color:var(--cyan-neon)] px-5 py-3 text-sm font-semibold text-[#0d1117] transition hover:opacity-90"
        >
          <FlaskConical className="h-4 w-4" />
          Open Attack Lab
        </Link>
      </section>
      </Reveal>

      <Reveal>
      <section className="mt-10 text-center text-xs text-muted-foreground">
        <p>
          {ATTACK_CATEGORIES.length} categories ·{" "}
          {ATTACK_CATEGORIES.reduce((n, c) => n + getPayloadsByCategory(c.id).length, 0)} documented
          payloads
        </p>
      </section>
      </Reveal>
    </div>
  );
}
