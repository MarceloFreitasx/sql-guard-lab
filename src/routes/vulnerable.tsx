import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  FlaskConical,
  Lock,
  Unlock,
  Terminal,
  ListOrdered,
} from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import { PayloadLibrary } from "../components/PayloadLibrary";
import { Reveal } from "../components/Reveal";
import { loginVulnerable } from "../lib/auth-api";
import { setAuthSession } from "../lib/auth-session";
import {
  altersLabQueryLogic,
  applyPayloadToFields,
  explainLabMismatch,
  getCategoryLabel,
  highlightLabQueryValue,
  isDangerous,
  simulateVulnerableLogin,
  type AuthResult,
  type SqlPayload,
} from "../lib/sqli";

const FRAGMENT_EXPLAINER: { match: RegExp; label: string; meaning: string }[] = [
  {
    match: /^['"]$/,
    label: "quote",
    meaning: "Closes the string literal early, so anything after it is read as SQL code.",
  },
  {
    match: /^(--|#)/,
    label: "comment",
    meaning: "Comments out the rest of the query — the password check is discarded.",
  },
  {
    match: /^\/\*/,
    label: "block comment",
    meaning: "Opens a block comment to swallow the trailing SQL.",
  },
  {
    match: /^;$/,
    label: "semicolon",
    meaning: "Ends the current statement so a second query can be stacked after it.",
  },
  {
    match: /^or$/i,
    label: "OR",
    meaning:
      "Adds an alternative condition — combined with a tautology it makes the WHERE always true.",
  },
  {
    match: /^and$/i,
    label: "AND",
    meaning: "Chains a condition, often used to probe true/false behavior (blind injection).",
  },
  {
    match: /^union$/i,
    label: "UNION",
    meaning: "Appends a second SELECT to forge or extract rows.",
  },
  { match: /^select$/i, label: "SELECT", meaning: "A nested query the attacker controls." },
  {
    match: /^drop$/i,
    label: "DROP",
    meaning: "A destructive command that can delete a whole table.",
  },
  {
    match: /1\s*=\s*1/,
    label: "1=1",
    meaning: "A tautology that is always true, so every row matches.",
  },
];

function explainFragment(text: string): { label: string; meaning: string } {
  const trimmed = text.trim();
  const hit = FRAGMENT_EXPLAINER.find((f) => f.match.test(trimmed));
  if (hit) return { label: hit.label, meaning: hit.meaning };
  return { label: trimmed, meaning: "Unexpected SQL syntax injected into the value." };
}

export const Route = createFileRoute("/vulnerable")({
  head: () => ({
    meta: [
      { title: "Vulnerable Login — SQLGuard" },
      {
        name: "description",
        content: "Intentionally insecure login form to demonstrate SQL injection.",
      },
    ],
  }),
  component: VulnerablePage,
});

function VulnerablePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hintOpen, setHintOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>("auth_bypass");
  const [result, setResult] = useState<AuthResult | null>(null);
  const [lastPayloadId, setLastPayloadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendNotice, setBackendNotice] = useState<string | null>(null);

  const altersQuery = altersLabQueryLogic(username, password);
  const sqlLikeU = isDangerous(username);
  const sqlLikeP = isDangerous(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBackendNotice(null);

    const local = simulateVulnerableLogin(username, password);

    try {
      const api = await loginVulnerable(username, password);
      const merged: AuthResult = {
        granted: api.granted,
        reason: api.granted
          ? local.reason || api.reason
          : explainLabMismatch(username, password) ?? api.reason,
        query: api.query ?? local.query,
        matchedUser: api.granted ? api.username : undefined,
        attackType: local.attackType,
        technique: local.technique,
        impact: local.impact,
        payloadId: local.payloadId,
      };
      setResult(merged);

      if (api.granted && api.username) {
        setAuthSession({
          username: api.username,
          mode: "vulnerable",
          query: api.query,
          grantedAt: Date.now(),
        });
        navigate({ to: "/dashboard" });
      }
    } catch {
      setBackendNotice(
        "SQLite backend unavailable — showing client-side simulation. Run npm run backend in another terminal.",
      );
      setResult(local);
      if (local.granted && local.matchedUser) {
        setAuthSession({
          username: local.matchedUser,
          mode: "vulnerable",
          query: local.query,
          grantedAt: Date.now(),
        });
        navigate({ to: "/dashboard" });
      }
    } finally {
      setLoading(false);
    }
  };

  const applyPayload = (payload: SqlPayload) => {
    const fields = applyPayloadToFields(payload);
    setUsername(fields.username);
    setPassword(fields.password);
    setLastPayloadId(payload.id);
    setResult(null);
  };

  const queryParts = useMemo(
    () => ({ u: highlightLabQueryValue(username), p: highlightLabQueryValue(password) }),
    [username, password],
  );

  return (
    <div>
      <div className="border-b border-[color:var(--red-neon)]/25 bg-[color:var(--red-neon)]/8">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[color:var(--red-neon)]" />
          <p className="font-mono text-xs font-medium tracking-wide text-[color:var(--red-neon)] md:text-sm">
            Intentionally insecure — educational use only
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        <Reveal className="space-y-6 md:col-span-2">
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/10 px-3 py-1 text-xs font-mono text-[color:var(--red-neon)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--red-neon)]" />
              VULNERABLE MODE
            </div>
            <h1 className="mt-3 font-mono text-3xl font-bold md:text-4xl">Vulnerable Login</h1>
            <p className="mt-2 text-muted-foreground">
              This form builds SQL by concatenating your input directly. Pick a payload from the
              library on the right.
            </p>
          </header>

          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className={`w-full rounded-md border bg-[#0d1117] px-3 py-2 font-mono text-sm outline-none transition ${
                    altersQuery && sqlLikeU
                      ? "border-[color:var(--red-neon)] shadow-[0_0_12px_rgba(255,71,87,0.25)]"
                      : sqlLikeU
                        ? "border-[#ffa657]/60"
                        : "border-[#30363d] focus:border-[color:var(--cyan-neon)]"
                  }`}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-md border bg-[#0d1117] px-3 py-2 font-mono text-sm outline-none transition ${
                    altersQuery && sqlLikeP
                      ? "border-[color:var(--red-neon)] shadow-[0_0_12px_rgba(255,71,87,0.25)]"
                      : sqlLikeP
                        ? "border-[#ffa657]/60"
                        : "border-[#30363d] focus:border-[color:var(--cyan-neon)]"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[color:var(--red-neon)] py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Checking database…" : "Login (unsafe)"}
              </button>
            </form>
          </div>

          {backendNotice && (
            <p className="rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-3 text-sm text-muted-foreground">
              {backendNotice}
            </p>
          )}

          <LoginResult result={result} onDismiss={() => setResult(null)} />

          <div className="rounded-xl border border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-2">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Live SQL Query Preview
              </span>
              {(altersQuery || sqlLikeU || sqlLikeP) && (
                <span
                  className={`font-mono text-xs ${
                    altersQuery ? "text-[color:var(--red-neon)]" : "text-[#ffa657]"
                  }`}
                >
                  {altersQuery
                    ? "Query logic altered"
                    : "SQL-like text (stays inside quotes)"}
                </span>
              )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
              <span className="text-[#79c0ff]">SELECT</span> *{" "}
              <span className="text-[#79c0ff]">FROM</span> users{" "}
              <span className="text-[#79c0ff]">WHERE</span> username=
              <span className="text-[#7ee787]">'</span>
              {queryParts.u.map((p, i) => (
                <span
                  key={i}
                  className={
                    p.danger
                      ? "rounded bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]"
                      : ""
                  }
                >
                  {p.text}
                </span>
              ))}
              <span className="text-[#7ee787]">'</span> <span className="text-[#79c0ff]">AND</span>{" "}
              password=
              <span className="text-[#7ee787]">'</span>
              {queryParts.p.map((p, i) => (
                <span
                  key={i}
                  className={
                    p.danger
                      ? "rounded bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]"
                      : ""
                  }
                >
                  {p.text}
                </span>
              ))}
              <span className="text-[#7ee787]">'</span>
            </pre>
          </div>

          <ExplainQuery
            username={username}
            password={password}
            lastPayloadId={lastPayloadId}
            show={altersQuery}
          />

          <UnderTheHoodPanel />
        </Reveal>

        <Reveal delay={0.1} className="md:sticky md:top-24 md:self-start">
          <PayloadLibrary
            hintOpen={hintOpen}
            onToggleHint={() => setHintOpen((o) => !o)}
            openCategory={openCategory}
            onToggleCategory={(id) => setOpenCategory((cur) => (cur === id ? null : id))}
            onApplyPayload={applyPayload}
          />
        </Reveal>
      </div>
    </div>
  );
}

function LoginResult({ result, onDismiss }: { result: AuthResult | null; onDismiss: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {result && (
        <motion.div
          key={result.granted ? "ok" : "no"}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`rounded-xl border p-6 shadow-lg ${
            result.granted
              ? "border-[color:var(--red-neon)] bg-[color:var(--red-neon)]/10 shadow-[0_0_30px_rgba(255,71,87,0.15)]"
              : "border-[#30363d] bg-[#161b22]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            {result.granted ? (
              <div className="flex items-center gap-3">
                <Unlock className="h-8 w-8 shrink-0 text-[color:var(--red-neon)]" />
                <h2 className="font-mono text-2xl font-bold text-[color:var(--red-neon)]">
                  ACCESS GRANTED
                </h2>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 shrink-0 text-muted-foreground" />
                <h2 className="font-mono text-xl font-bold">ACCESS DENIED</h2>
              </div>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-[#30363d] hover:text-white"
            >
              Dismiss
            </button>
          </div>

          {result.granted ? (
            <>
              <p className="mt-3 text-sm">
                Logged in as{" "}
                <span className="font-mono font-bold text-[color:var(--red-neon)]">
                  {result.matchedUser}
                </span>
                .
              </p>
              {result.attackType && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--red-neon)]">
                  Attack type: {getCategoryLabel(result.attackType)}
                </p>
              )}
              <div className="mt-4 space-y-3 rounded-md border border-[color:var(--red-neon)]/30 bg-[#0d1117] p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--red-neon)]">
                    Why it worked
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{result.reason}</p>
                </div>
                {result.impact && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--red-neon)]">
                      Impact
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{result.impact}</p>
                  </div>
                )}
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Executed query:</p>
                  <pre className="mt-1 overflow-x-auto font-mono text-xs text-[color:var(--cyan-neon)]">
                    {result.query}
                  </pre>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-[color:var(--red-neon)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Go to protected dashboard →
              </Link>
              <Link
                to="/lab"
                search={result.payloadId ? { payload: result.payloadId } : {}}
                className="mt-3 inline-flex items-center gap-2 text-sm text-[color:var(--cyan-neon)] hover:underline"
              >
                <FlaskConical className="h-4 w-4" />
                Replay in Attack Lab
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{result.reason}</p>
          )}
          {!result.granted && result.attackType && result.payloadId && (
            <p className="mt-3 text-xs text-[#ffa657]">
              Payload recognized as {getCategoryLabel(result.attackType)} — see the library badge
              for whether it applies to this lab&apos;s SQL.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ExplainQuery({
  username,
  password,
  lastPayloadId,
  show,
}: {
  username: string;
  password: string;
  lastPayloadId: string | null;
  show: boolean;
}) {
  const fragments = useMemo(() => {
    if (!show) return [];
    const tokens = [...highlightLabQueryValue(username), ...highlightLabQueryValue(password)].filter(
      (t) => t.danger,
    );
    const seen = new Set<string>();
    const unique: { label: string; meaning: string }[] = [];
    for (const t of tokens) {
      const exp = explainFragment(t.text);
      if (seen.has(exp.label)) continue;
      seen.add(exp.label);
      unique.push(exp);
    }
    return unique;
  }, [username, password, show]);

  if (!show || fragments.length === 0) return null;

  return (
    <div className="rounded-xl border border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[color:var(--red-neon)]" />
          <h3 className="font-mono text-sm font-bold text-[color:var(--red-neon)]">
            Explain this query
          </h3>
        </div>
        <Link
          to="/walkthrough"
          search={lastPayloadId ? { payload: lastPayloadId } : {}}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--cyan-neon)] hover:underline"
        >
          <ListOrdered className="h-3.5 w-3.5" />
          See this step-by-step
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Your input contains SQL syntax. In the vulnerable backend these characters are not data —
        they become part of the query:
      </p>
      <ul className="mt-3 space-y-2">
        {fragments.map((f) => (
          <li
            key={f.label}
            className="flex gap-3 rounded-md border border-[#30363d] bg-[#0d1117] p-3"
          >
            <code className="shrink-0 rounded bg-[color:var(--red-neon)]/15 px-1.5 py-0.5 font-mono text-xs text-[color:var(--red-neon)]">
              {f.label}
            </code>
            <span className="text-sm text-muted-foreground">{f.meaning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UnderTheHoodPanel() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-[color:var(--cyan-neon)]" />
        <h3 className="font-mono text-sm font-bold">Under the hood</h3>
      </div>
      <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
        <li>
          <span className="font-mono text-[color:var(--cyan-neon)]">1.</span> Form submits your
          input as plain strings to the backend.
        </li>
        <li>
          <span className="font-mono text-[color:var(--cyan-neon)]">2.</span> The server builds SQL
          with <span className="font-mono text-white">string concatenation</span>.
        </li>
        <li>
          <span className="font-mono text-[color:var(--cyan-neon)]">3.</span> The DB executes
          whatever query it receives — it cannot tell user input from SQL code.
        </li>
        <li>
          <span className="font-mono text-[color:var(--cyan-neon)]">4.</span> Different techniques
          (tautology, comments, UNION, stacked queries) all abuse this same weakness.
        </li>
        <li>
          <span className="font-mono text-[color:var(--cyan-neon)]">5.</span> The app logs you in as
          the first user returned.
        </li>
      </ol>

      <div className="mt-5">
        <CodeBlock
          language="php"
          code={`// the unsafe backend
$sql = "SELECT * FROM users
        WHERE username='$user'
        AND password='$pass'";
$result = mysqli_query($db, $sql);`}
        />
      </div>

      <Link
        to="/attacks"
        className="mt-4 block text-center text-xs text-[color:var(--cyan-neon)] hover:underline"
      >
        View full Attack Guide →
      </Link>
    </div>
  );
}
