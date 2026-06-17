import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import { simulateSecureLogin, type AuthResult } from "../lib/sqli";

export const Route = createFileRoute("/secure")({
  head: () => ({
    meta: [
      { title: "Secure Login — SQLGuard" },
      { name: "description", content: "Hardened login using prepared statements — SQL injection blocked." },
    ],
  }),
  component: SecurePage,
});

function SecurePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<AuthResult | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(simulateSecureLogin(username, password));
  };

  return (
    <div>
      <div className="border-b border-[color:var(--green-neon)]/30 bg-[color:var(--green-neon)]/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[color:var(--green-neon)]" />
          <p className="font-mono text-xs font-semibold tracking-wide text-[color:var(--green-neon)] md:text-sm">
            ✅ HARDENED VERSION — SQL Injection Protected
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6">
        <div className="space-y-6">
          <header>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/10 px-3 py-1 text-xs font-mono text-[color:var(--green-neon)]">
              <CheckCircle2 className="h-3 w-3" />
              SECURE MODE · PREPARED STATEMENTS
            </div>
            <h1 className="mt-3 font-mono text-3xl font-bold md:text-4xl">Secure Login</h1>
            <p className="mt-2 text-muted-foreground">
              Same form, very different backend. Input is bound as a parameter — never parsed as SQL.
            </p>
          </header>

          <div className="rounded-xl border border-[color:var(--green-neon)]/30 bg-[#161b22] p-6 shadow-[0_0_30px_rgba(46,213,115,0.1)]">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--green-neon)]">
              <ShieldCheck className="h-3 w-3" />
              Protected
            </div>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Username" value={username} onChange={setUsername} placeholder="e.g. admin" />
              <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" />
              <button
                type="submit"
                className="w-full rounded-md bg-[color:var(--green-neon)] py-2.5 font-semibold text-[#0d1117] transition hover:opacity-90"
              >
                Login (safe)
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#0d1117]">
            <div className="border-b border-[#30363d] bg-[#161b22] px-4 py-2">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Prepared Statement Preview</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
              <span className="text-[#79c0ff]">SELECT</span> * <span className="text-[#79c0ff]">FROM</span> users{" "}
              <span className="text-[#79c0ff]">WHERE</span> username = <span className="text-[#d2a8ff] font-bold">?</span>{" "}
              <span className="text-[#79c0ff]">AND</span> password = <span className="text-[#d2a8ff] font-bold">?</span>
            </pre>
            <div className="border-t border-[#30363d] bg-[#161b22]/50 p-4 font-mono text-xs">
              <div>
                <span className="text-muted-foreground">bound[1] = </span>
                <span className="rounded bg-[color:var(--green-neon)]/15 px-1.5 py-0.5 text-[color:var(--green-neon)]">
                  {JSON.stringify(username || "")}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-muted-foreground">bound[2] = </span>
                <span className="rounded bg-[color:var(--green-neon)]/15 px-1.5 py-0.5 text-[color:var(--green-neon)]">
                  {JSON.stringify(password || "")}
                </span>
              </div>
              <p className="mt-3 text-muted-foreground">
                Even if you type <span className="font-mono text-[color:var(--cyan-neon)]">' OR '1'='1'--</span>, it is
                stored as a literal string in the parameter — never parsed as SQL.
              </p>
            </div>
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
                    ? "border-[color:var(--green-neon)] bg-[color:var(--green-neon)]/10"
                    : "border-[color:var(--green-neon)]/40 bg-[#161b22]"
                }`}
              >
                {result.granted ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-7 w-7 text-[color:var(--green-neon)]" />
                      <h2 className="font-mono text-2xl font-bold text-[color:var(--green-neon)]">ACCESS GRANTED ✅</h2>
                    </div>
                    <p className="mt-2 text-sm">Welcome, <span className="font-mono">{result.matchedUser}</span>.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      <Lock className="h-7 w-7 text-[color:var(--green-neon)]" />
                      <h2 className="font-mono text-2xl font-bold text-[color:var(--green-neon)]">ACCESS DENIED 🔒</h2>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{result.reason}</p>
                    <div className="mt-4 rounded-md border border-[color:var(--green-neon)]/30 bg-[#0d1117] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--green-neon)]">
                        Defense that stopped it
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        <li>Prepared statement separates SQL code from user data.</li>
                        <li>Quotes and comments inside the value are treated as literal characters.</li>
                        <li>The database planner never sees the injected operators.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Diff panel */}
        <div className="space-y-4 md:sticky md:top-24 md:self-start">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Vulnerable vs Secure — side by side
          </h3>
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-[color:var(--red-neon)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--red-neon)]">
              ✗ Vulnerable
            </div>
            <CodeBlock
              language="php"
              code={`$user = $_POST['username'];
$pass = $_POST['password'];

$sql = "SELECT * FROM users
        WHERE username='$user'
        AND password='$pass'";

$result = mysqli_query($db, $sql);`}
            />
          </div>
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-md bg-[color:var(--green-neon)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--green-neon)]">
              ✓ Secure
            </div>
            <CodeBlock
              language="php"
              code={`$user = $_POST['username'];
$pass = $_POST['password'];

$stmt = $db->prepare(
  "SELECT * FROM users
   WHERE username = ? AND password = ?"
);
$stmt->bind_param("ss", $user, $pass);
$stmt->execute();`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-sm outline-none transition focus:border-[color:var(--green-neon)]"
      />
    </div>
  );
}
