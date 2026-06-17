import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Lightbulb, CheckSquare, Square } from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";

export const Route = createFileRoute("/defense")({
  head: () => ({
    meta: [
      { title: "Defense Guide — SQLGuard" },
      { name: "description", content: "Prepared statements, password hashing, session hardening, and security headers explained." },
    ],
  }),
  component: DefensePage,
});

const TABS = [
  { id: "prepared", label: "Prepared Statements" },
  { id: "hash", label: "Password Hashing" },
  { id: "session", label: "Session Security" },
  { id: "headers", label: "HTTP Headers" },
] as const;

const CHECKLIST = [
  "Use prepared statements / parameterized queries everywhere",
  "Never concatenate user input into SQL",
  "Hash passwords with bcrypt or Argon2 (never MD5/SHA1)",
  "Validate and sanitize all input on the server",
  "Regenerate session ID after login (session_regenerate_id)",
  "Set HttpOnly, Secure, and SameSite=Strict on session cookies",
  "Enforce HTTPS via Strict-Transport-Security header",
  "Set Content-Security-Policy to restrict script sources",
  "Use least-privilege database accounts",
  "Log and monitor failed login attempts",
];

function DefensePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("prepared");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3" />
          Documentation
        </div>
        <h1 className="mt-4 font-mono text-3xl font-bold md:text-5xl">Defense Guide</h1>
        <p className="mt-2 text-muted-foreground">A practical reference for stopping SQL injection — and the rest.</p>
      </header>

      {/* Section 1 */}
      <section className="mt-14">
        <h2 className="font-mono text-2xl font-bold">1. The Problem</h2>
        <div className="mt-4 rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <p className="text-muted-foreground">
            When code builds SQL by gluing strings together, user input becomes part of the query. An attacker who
            understands the structure can close a string, add a tautology, and rewrite what the DB executes.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {["Input", "Concat", "DB executes attacker SQL"].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-lg border border-[color:var(--red-neon)]/30 bg-[#0d1117] p-4 text-center font-mono text-sm text-[color:var(--red-neon)]"
              >
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Tabs */}
      <section className="mt-14">
        <h2 className="font-mono text-2xl font-bold">2. The Fixes</h2>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#30363d]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "border-[color:var(--cyan-neon)] text-[color:var(--cyan-neon)]"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {tab === "prepared" && (
            <TabContent
              explanation="Prepared statements send the SQL template and the user data over separate channels. The database compiles the template first, then binds your values as pure data — never as code."
              code={`$stmt = $pdo->prepare(
  "SELECT id FROM users
   WHERE username = :u AND password_hash = :p"
);
$stmt->execute([
  ':u' => $username,
  ':p' => $hashed_password,
]);
$row = $stmt->fetch();`}
              language="php"
              why="Even input like ' OR '1'='1' -- is stored verbatim in the parameter. The DB looks for a username literally equal to that string and finds nothing."
            />
          )}
          {tab === "hash" && (
            <TabContent
              explanation="Never store passwords in plain text. Hash them with a slow, salted algorithm. PHP's password_hash() uses bcrypt by default."
              code={`// signing up
$hash = password_hash($plain, PASSWORD_BCRYPT, ['cost' => 12]);

// logging in
if (password_verify($plain, $row['password_hash'])) {
    // authenticated
}`}
              language="php"
              why="If your DB ever leaks, attackers get hashes — not passwords. Bcrypt's slow cost factor makes brute-force impractical."
            />
          )}
          {tab === "session" && (
            <TabContent
              explanation="A session is only as safe as the cookie that identifies it. Lock it down before sending it to the browser."
              code={`session_set_cookie_params([
  'lifetime' => 0,
  'path'     => '/',
  'secure'   => true,    // HTTPS only
  'httponly' => true,    // JS cannot read it
  'samesite' => 'Strict' // block CSRF
]);

session_start();

// After successful login:
session_regenerate_id(true);`}
              language="php"
              why="HttpOnly stops XSS from stealing the cookie, Secure stops it leaking over plain HTTP, SameSite blocks cross-site requests, and regenerating the ID stops session fixation."
            />
          )}
          {tab === "headers" && (
            <TabContent
              explanation="Defense in depth — set HTTP security headers so the browser refuses to do dangerous things even if something slips through."
              code={`header("Strict-Transport-Security: max-age=63072000; includeSubDomains; preload");
header("Content-Security-Policy: default-src 'self'");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: geolocation=(), microphone=()");`}
              language="php"
              why="These headers turn the browser into an extra firewall. Even if an attacker injects HTML, CSP can refuse to execute their script."
            />
          )}
        </div>
      </section>

      {/* Checklist */}
      <section className="mt-14">
        <h2 className="font-mono text-2xl font-bold">3. Checklist</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tick each item as you ship it.</p>
        <ul className="mt-5 space-y-2">
          {CHECKLIST.map((item, i) => {
            const isChecked = checked.has(i);
            return (
              <li
                key={i}
                onClick={() => toggle(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  isChecked
                    ? "border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/5"
                    : "border-[#30363d] bg-[#161b22] hover:border-[color:var(--cyan-neon)]/40"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-5 w-5 shrink-0 text-[color:var(--green-neon)]" />
                ) : (
                  <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span className={`text-sm ${isChecked ? "text-[color:var(--green-neon)] line-through" : ""}`}>{item}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {checked.size} / {CHECKLIST.length} measures applied
        </div>
      </section>
    </div>
  );
}

function TabContent({ explanation, code, language, why }: { explanation: string; code: string; language: string; why: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-muted-foreground">{explanation}</p>
      <CodeBlock code={code} language={language} />
      <div className="flex gap-3 rounded-lg border border-[color:var(--cyan-neon)]/30 bg-[color:var(--cyan-neon)]/5 p-4">
        <Lightbulb className="h-5 w-5 shrink-0 text-[color:var(--cyan-neon)]" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--cyan-neon)]">Why this matters</p>
          <p className="mt-1 text-sm text-muted-foreground">{why}</p>
        </div>
      </div>
    </motion.div>
  );
}
