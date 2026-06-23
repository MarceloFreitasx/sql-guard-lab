import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Terminal as TermIcon, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  ATTACK_CATEGORIES,
  applyPayloadToFields,
  buildSecureQuery,
  buildVulnerableQuery,
  findPayloadById,
  getCategoryLabel,
  getPayloadsByCategory,
  PAYLOADS,
  simulateSecureLogin,
  simulateVulnerableLogin,
  type AttackCategory,
} from "../lib/sqli";

type LabSearch = {
  payload?: string;
};

export const Route = createFileRoute("/lab")({
  validateSearch: (search: Record<string, unknown>): LabSearch => ({
    payload: typeof search.payload === "string" ? search.payload : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Attack Lab — SQLGuard" },
      { name: "description", content: "Interactive SQL injection playground with payload library and live terminal output." },
    ],
  }),
  component: LabPage,
});

type LogLine = { kind: "info" | "ok" | "err" | "muted"; text: string };

function LabPage() {
  const { payload: payloadId } = Route.useSearch();
  const [mode, setMode] = useState<"vulnerable" | "secure">("vulnerable");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AttackCategory | "all">("all");
  const [log, setLog] = useState<LogLine[]>([
    { kind: "muted", text: "// Attack lab ready. Pick a payload or write your own." },
  ]);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Partial<Record<AttackCategory, number>>>({});

  useEffect(() => {
    if (!payloadId) return;
    const payload = findPayloadById(payloadId);
    if (!payload) return;
    const fields = applyPayloadToFields(payload);
    setUsername(fields.username);
    setPassword(fields.password);
    setCategoryFilter(payload.category);
    setLog((prev) => [
      ...prev,
      { kind: "info", text: `→ Loaded payload: ${payload.name} (${getCategoryLabel(payload.category)})` },
    ]);
  }, [payloadId]);

  const visiblePayloads =
    categoryFilter === "all" ? PAYLOADS : getPayloadsByCategory(categoryFilter);

  const fire = () => {
    const isVuln = mode === "vulnerable";
    const query = isVuln ? buildVulnerableQuery(username, password) : buildSecureQuery();
    const res = isVuln ? simulateVulnerableLogin(username, password) : simulateSecureLogin(username, password);

    const lines: LogLine[] = [
      { kind: "info", text: `→ Mode: ${isVuln ? "VULNERABLE" : "SECURE"}` },
    ];
    if (res.attackType) {
      lines.push({ kind: "info", text: `→ Attack type: ${getCategoryLabel(res.attackType)}` });
    }
    lines.push(
      { kind: "muted", text: `→ Query constructed:` },
      { kind: "info", text: `  ${query}` },
    );
    if (!isVuln) {
      lines.push({ kind: "muted", text: `→ Bound params: username=${JSON.stringify(username)}, password=${JSON.stringify(password)}` });
    }
    lines.push({ kind: "muted", text: `→ Executing...` });
    if (res.granted) {
      lines.push({ kind: "err", text: `→ Result: ACCESS GRANTED — logged in as "${res.matchedUser}"` });
    } else {
      lines.push({ kind: "ok", text: `→ Result: ACCESS DENIED` });
    }
    lines.push({ kind: "muted", text: `→ ${res.reason}` });
    if (res.impact) {
      lines.push({ kind: "muted", text: `→ Impact: ${res.impact}` });
    }
    lines.push({ kind: "muted", text: `` });

    setLog((prev) => [...prev, ...lines]);
    setAttempts((a) => a + 1);
    if (res.attackType) {
      setCategoryCounts((prev) => ({
        ...prev,
        [res.attackType!]: (prev[res.attackType!] ?? 0) + 1,
      }));
    }
    if (!isVuln && !res.granted && (username || password)) setBlocked((b) => b + 1);
  };

  const applyPayload = (id: string) => {
    const payload = findPayloadById(id);
    if (!payload) return;
    const fields = applyPayloadToFields(payload);
    setUsername(fields.username);
    setPassword(fields.password);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-mono text-3xl font-bold md:text-4xl">SQL Injection Lab</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fire payloads at the simulated backend. Compare vulnerable vs secure behavior in real time.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[#30363d] bg-[#161b22] p-1">
          <ModeBtn active={mode === "vulnerable"} onClick={() => setMode("vulnerable")} tone="red" icon={ShieldAlert} label="Vulnerable" />
          <ModeBtn active={mode === "secure"} onClick={() => setMode("secure")} tone="green" icon={ShieldCheck} label="Secure" />
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-3">
        <div className="inline-flex gap-3 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 font-mono text-xs">
          <span className="text-muted-foreground">Attacks attempted: <span className="text-white">{attempts}</span></span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Blocked by Secure Mode: <span className="text-[color:var(--green-neon)]">{blocked}</span></span>
        </div>
        {ATTACK_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] ?? 0;
          if (count === 0) return null;
          return (
            <span key={cat.id} className="rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1 font-mono text-[10px] text-muted-foreground">
              {cat.label}: <span className="text-[color:var(--cyan-neon)]">{count}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-3">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payload library</h3>
          <div className="flex flex-wrap gap-1">
            <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} label="All" />
            {ATTACK_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.id}
                active={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                label={cat.label}
              />
            ))}
          </div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {visiblePayloads.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPayload(p.id)}
                className="block w-full rounded-lg border border-[#30363d] bg-[#161b22] p-3 text-left transition hover:border-[color:var(--cyan-neon)]/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{p.name}</div>
                  <span className="shrink-0 rounded bg-[#0d1117] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                    {getCategoryLabel(p.category)}
                  </span>
                </div>
                <div className="mt-1 break-all font-mono text-xs text-[color:var(--cyan-neon)]">{p.payload}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Input</h3>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
            <Input label="Username" value={username} onChange={setUsername} />
            <div className="h-3" />
            <Input label="Password" value={password} onChange={setPassword} />
            <button
              onClick={fire}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 font-semibold transition ${
                mode === "vulnerable"
                  ? "bg-[color:var(--red-neon)] text-white hover:opacity-90"
                  : "bg-[color:var(--green-neon)] text-[#0d1117] hover:opacity-90"
              }`}
            >
              <Zap className="h-4 w-4" />
              Fire Attack
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Demo credentials: <span className="font-mono text-white">admin / admin123</span>,{" "}
              <span className="font-mono text-white">alice / password1</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Output</h3>
          <div className="mt-2 overflow-hidden rounded-xl border border-[#30363d] bg-black">
            <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-3 py-1.5">
              <div className="flex items-center gap-2">
                <TermIcon className="h-3 w-3 text-[color:var(--green-neon)]" />
                <span className="font-mono text-xs text-muted-foreground">sqlguard@lab:~$</span>
              </div>
              <button onClick={() => setLog([{ kind: "muted", text: "// cleared" }])} className="text-xs text-muted-foreground hover:text-white">
                clear
              </button>
            </div>
            <div className="h-[420px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              {log.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    l.kind === "err"
                      ? "text-[color:var(--red-neon)]"
                      : l.kind === "ok"
                        ? "text-[color:var(--green-neon)]"
                        : l.kind === "info"
                          ? "text-[color:var(--cyan-neon)]"
                          : "text-muted-foreground"
                  }
                >
                  {l.text || "\u00a0"}
                </motion.div>
              ))}
              <div className="text-[color:var(--green-neon)]">
                <span className="animate-pulse">▮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
        active
          ? "bg-[color:var(--cyan-neon)]/20 text-[color:var(--cyan-neon)]"
          : "bg-[#161b22] text-muted-foreground hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-sm outline-none transition focus:border-[color:var(--cyan-neon)]"
      />
    </div>
  );
}

function ModeBtn({ active, onClick, tone, icon: Icon, label }: { active: boolean; onClick: () => void; tone: "red" | "green"; icon: { className?: string }; label: string }) {
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
