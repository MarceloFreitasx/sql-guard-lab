import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, FlaskConical, Lock, Unlock, Terminal } from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import {
  ATTACK_CATEGORIES,
  applyPayloadToFields,
  getCategoryLabel,
  getPayloadsByCategory,
  highlightDanger,
  isDangerous,
  simulateVulnerableLogin,
  type AuthResult,
  type SqlPayload,
} from "../lib/sqli";

export const Route = createFileRoute("/vulnerable")({
  head: () => ({
    meta: [
      { title: "Vulnerable Login — SQLGuard" },
      { name: "description", content: "Intentionally insecure login form to demonstrate SQL injection." },
    ],
  }),
  component: VulnerablePage,
});

function VulnerablePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hintOpen, setHintOpen] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>("auth_bypass");
  const [result, setResult] = useState<AuthResult | null>(null);

  const dangerousU = isDangerous(username);
  const dangerousP = isDangerous(password);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(simulateVulnerableLogin(username, password));
  };

  const applyPayload = (payload: SqlPayload) => {
    const fields = applyPayloadToFields(payload);
    setUsername(fields.username);
    setPassword(fields.password);
    setResult(null);
  };

  const queryParts = useMemo(() => ({ u: highlightDanger(username), p: highlightDanger(password) }), [username, password]);

  return (
    <div>
      <div className="border-b border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--red-neon)]" />
          <p className="font-mono text-xs font-semibold tracking-wide text-[color:var(--red-neon)] md:text-sm">
            ⚠️ THIS IS INTENTIONALLY INSECURE — FOR EDUCATIONAL PURPOSES ONLY
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="md:col-span-2 space-y-6">
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--red-neon)]/30 bg-[color:var(--red-neon)]/10 px-3 py-1 text-xs font-mono text-[color:var(--red-neon)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--red-neon)]" />
              VULNERABLE MODE
            </div>
            <h1 className="mt-3 font-mono text-3xl font-bold md:text-4xl">Vulnerable Login</h1>
            <p className="mt-2 text-muted-foreground">
              This form builds SQL by concatenating your input directly. Browse payloads by attack type below.
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
                    dangerousU ? "border-[color:var(--red-neon)] shadow-[0_0_12px_rgba(255,71,87,0.25)]" : "border-[#30363d] focus:border-[color:var(--cyan-neon)]"
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
                    dangerousP ? "border-[color:var(--red-neon)] shadow-[0_0_12px_rgba(255,71,87,0.25)]" : "border-[#30363d] focus:border-[color:var(--cyan-neon)]"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-[color:var(--red-neon)] py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                Login (unsafe)
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#161b22]">
            <button
              onClick={() => setHintOpen((o) => !o)}
              className="flex w-full items-center justify-between px-5 py-3 text-left"
            >
              <span className="text-sm font-semibold">Payload library — grouped by attack type</span>
              <ChevronDown className={`h-4 w-4 transition ${hintOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {hintOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-5 pb-5">
                    {ATTACK_CATEGORIES.map((cat) => {
                      const items = getPayloadsByCategory(cat.id);
                      if (items.length === 0) return null;
                      const isOpen = openCategory === cat.id;
                      return (
                        <div key={cat.id} className="rounded-lg border border-[#30363d] bg-[#0d1117]">
                          <button
                            type="button"
                            onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left"
                          >
                            <div>
                              <span className="text-sm font-semibold">{cat.label}</span>
                              <p className="text-xs text-muted-foreground">{cat.description}</p>
                            </div>
                            <ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && (
                            <div className="space-y-2 border-t border-[#30363d] p-3">
                              {items.map((p) => (
                                <div
                                  key={p.id}
                                  className="rounded-md border border-[#30363d] bg-[#161b22] p-3"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <div className="text-sm font-semibold">{p.name}</div>
                                      <div className="mt-1 break-all font-mono text-xs text-[color:var(--cyan-neon)]">
                                        {p.payload}
                                      </div>
                                      <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                                        Target: {p.field}
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={() => applyPayload(p)}
                                        className="rounded-md bg-[color:var(--red-neon)]/20 px-2 py-1 text-xs font-medium text-[color:var(--red-neon)] hover:bg-[color:var(--red-neon)]/30"
                                      >
                                        Use payload
                                      </button>
                                      <Link
                                        to="/lab"
                                        search={{ payload: p.id }}
                                        className="rounded-md border border-[#30363d] px-2 py-1 text-center text-xs text-muted-foreground hover:text-white"
                                      >
                                        Open in Lab
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#0d1117]">
            <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-2">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Live SQL Query Preview</span>
              {(dangerousU || dangerousP) && (
                <span className="font-mono text-xs text-[color:var(--red-neon)]">⚠ dangerous input detected</span>
              )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
              <span className="text-[#79c0ff]">SELECT</span> * <span className="text-[#79c0ff]">FROM</span> users{" "}
              <span className="text-[#79c0ff]">WHERE</span> username=<span className="text-[#7ee787]">'</span>
              {queryParts.u.map((p, i) => (
                <span key={i} className={p.danger ? "rounded bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]" : ""}>
                  {p.text}
                </span>
              ))}
              <span className="text-[#7ee787]">'</span> <span className="text-[#79c0ff]">AND</span> password=
              <span className="text-[#7ee787]">'</span>
              {queryParts.p.map((p, i) => (
                <span key={i} className={p.danger ? "rounded bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]" : ""}>
                  {p.text}
                </span>
              ))}
              <span className="text-[#7ee787]">'</span>
            </pre>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.granted ? "ok" : "no"}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl border p-6 ${
                  result.granted
                    ? "border-[color:var(--red-neon)] bg-[color:var(--red-neon)]/10"
                    : "border-[#30363d] bg-[#161b22]"
                }`}
              >
                {result.granted ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Unlock className="h-8 w-8 text-[color:var(--red-neon)]" />
                      <h2 className="font-mono text-2xl font-bold text-[color:var(--red-neon)]">ACCESS GRANTED</h2>
                    </div>
                    <p className="mt-3 text-sm">
                      Logged in as <span className="font-mono font-bold text-[color:var(--red-neon)]">{result.matchedUser}</span>.
                    </p>
                    {result.attackType && (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--red-neon)]">
                        Attack type: {getCategoryLabel(result.attackType)}
                      </p>
                    )}
                    <div className="mt-4 rounded-md border border-[color:var(--red-neon)]/30 bg-[#0d1117] p-4 space-y-3">
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
                        <pre className="mt-1 overflow-x-auto font-mono text-xs text-[color:var(--cyan-neon)]">{result.query}</pre>
                      </div>
                    </div>
                    <Link
                      to="/lab"
                      search={result.payloadId ? { payload: result.payloadId } : {}}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-[color:var(--cyan-neon)] hover:underline"
                    >
                      <FlaskConical className="h-4 w-4" />
                      Replay in Attack Lab
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <h2 className="font-mono text-xl font-bold">ACCESS DENIED</h2>
                      <p className="text-sm text-muted-foreground">{result.reason}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[color:var(--cyan-neon)]" />
              <h3 className="font-mono text-sm font-bold">Under the hood</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-mono text-[color:var(--cyan-neon)]">1.</span> Form submits your input as plain
                strings to the backend.
              </li>
              <li>
                <span className="font-mono text-[color:var(--cyan-neon)]">2.</span> The server builds SQL with{" "}
                <span className="font-mono text-white">string concatenation</span>.
              </li>
              <li>
                <span className="font-mono text-[color:var(--cyan-neon)]">3.</span> The DB executes whatever query it
                receives — it cannot tell user input from SQL code.
              </li>
              <li>
                <span className="font-mono text-[color:var(--cyan-neon)]">4.</span> Different techniques (tautology,
                comments, UNION, stacked queries) all abuse this same weakness.
              </li>
              <li>
                <span className="font-mono text-[color:var(--cyan-neon)]">5.</span> The app logs you in as the first
                user returned.
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
        </aside>
      </div>
    </div>
  );
}
