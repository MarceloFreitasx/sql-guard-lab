import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldAlert,
  Database,
  Users,
} from "lucide-react";
import { Reveal } from "../components/Reveal";
import { fetchUsers, logoutApi, type ApiUsersResponse } from "../lib/auth-api";
import { clearAuthSession, getAuthSession } from "../lib/auth-session";
import { useAuthSession } from "../hooks/use-auth-session";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SQLGuard" },
      {
        name: "description",
        content: "Protected area reached after a successful login (vulnerable or secure backend).",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const [usersData, setUsersData] = useState<ApiUsersResponse | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (session === null && getAuthSession() === null) {
      navigate({ to: "/vulnerable" });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    setUsersLoading(true);
    setUsersError(null);

    fetchUsers()
      .then((data) => {
        if (!cancelled) setUsersData(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setUsersError(err instanceof Error ? err.message : "Could not load users.");
        }
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted-foreground">
        Checking session…
      </div>
    );
  }

  const isVuln = session.mode === "vulnerable";

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Backend may be offline; still clear client session.
    }
    clearAuthSession();
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Reveal>
        <div
          className={`rounded-xl border p-6 md:p-8 ${
            isVuln
              ? "border-[color:var(--red-neon)]/40 bg-[color:var(--red-neon)]/8"
              : "border-[color:var(--green-neon)]/40 bg-[color:var(--green-neon)]/8"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard
                className={`h-8 w-8 ${isVuln ? "text-[color:var(--red-neon)]" : "text-[color:var(--green-neon)]"}`}
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Protected dashboard
                </p>
                <h1 className="font-mono text-2xl font-bold md:text-3xl">
                  Welcome, {session.username}
                </h1>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${
                isVuln
                  ? "border-[color:var(--red-neon)]/50 text-[color:var(--red-neon)]"
                  : "border-[color:var(--green-neon)]/50 text-[color:var(--green-neon)]"
              }`}
            >
              {isVuln ? (
                <ShieldAlert className="h-3.5 w-3.5" />
              ) : (
                <Shield className="h-3.5 w-3.5" />
              )}
              {isVuln ? "Vulnerable backend" : "Secure backend"}
            </span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            You reached this page after a successful login against the{" "}
            <strong className="text-foreground">real SQLite database</strong> (PHP API). This
            simulates a protected area that should only be available to authenticated users.
          </motion.p>

          {isVuln ? (
            <div className="mt-5 flex gap-3 rounded-lg border border-[color:var(--red-neon)]/30 bg-[#0d1117]/80 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--red-neon)]" />
              <p className="text-sm text-muted-foreground">
                If you used a SQL injection payload, this confirms the bypass worked end-to-end: the
                database returned a row and the application treated you as logged in.
              </p>
            </div>
          ) : (
            <div className="mt-5 flex gap-3 rounded-lg border border-[color:var(--green-neon)]/30 bg-[#0d1117]/80 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--green-neon)]" />
              <p className="text-sm text-muted-foreground">
                Login used prepared statements and password verification. Injection payloads are
                stored as literal data and cannot change the query structure.
              </p>
            </div>
          )}

          {session.query && (
            <div className="mt-6 rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                Login query executed on the server
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[color:var(--cyan-neon)]">
                {session.query}
              </pre>
            </div>
          )}

          <UsersPanel
            isVuln={isVuln}
            loading={usersLoading}
            error={usersError}
            data={usersData}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm font-medium transition hover:border-[#484f58]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
            <Link
              to={isVuln ? "/vulnerable" : "/secure"}
              className="inline-flex items-center gap-2 rounded-md bg-[color:var(--cyan-neon)]/15 px-4 py-2 text-sm font-medium text-[color:var(--cyan-neon)] hover:bg-[color:var(--cyan-neon)]/25"
            >
              Back to login
            </Link>
            <Link
              to="/walkthrough"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Open walkthrough
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function UsersPanel({
  isVuln,
  loading,
  error,
  data,
}: {
  isVuln: boolean;
  loading: boolean;
  error: string | null;
  data: ApiUsersResponse | null;
}) {
  return (
    <div
      className={`mt-6 rounded-lg border p-4 md:p-5 ${
        isVuln
          ? "border-[color:var(--red-neon)]/40 bg-[color:var(--red-neon)]/5"
          : "border-[color:var(--green-neon)]/30 bg-[#0d1117]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users
            className={`h-4 w-4 ${isVuln ? "text-[color:var(--red-neon)]" : "text-[color:var(--green-neon)]"}`}
          />
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
            {isVuln ? "Exposed user records" : "Your account"}
          </h2>
        </div>
        {data && (
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
              data.leaked
                ? "bg-[color:var(--red-neon)]/20 text-[color:var(--red-neon)]"
                : "bg-[color:var(--green-neon)]/20 text-[color:var(--green-neon)]"
            }`}
          >
            {data.leaked ? `${data.users.length} rows leaked` : "Scoped query"}
          </span>
        )}
      </div>

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground">Loading user data from API…</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-[color:var(--red-neon)]">
          {error} — is <code className="font-mono text-xs">npm run dev</code> running?
        </p>
      )}

      {data && (
        <>
          <p className="mt-3 text-sm text-muted-foreground">{data.reason}</p>

          {data.query && (
            <pre className="mt-3 overflow-x-auto rounded-md border border-[#30363d] bg-[#161b22] p-3 font-mono text-xs text-[color:var(--cyan-neon)]">
              {data.query}
            </pre>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-[#30363d]">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-[#30363d] bg-[#161b22] font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Username</th>
                  {data.leaked && (
                    <th className="px-4 py-2.5 text-[color:var(--red-neon)]">Password (plaintext)</th>
                  )}
                  <th className="px-4 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id} className="border-b border-[#30363d]/60 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{user.id}</td>
                    <td className="px-4 py-2.5 font-mono font-medium">{user.username}</td>
                    {data.leaked && (
                      <td className="px-4 py-2.5 font-mono text-[color:var(--red-neon)]">
                        {user.password}
                      </td>
                    )}
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {user.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.leaked && (
            <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--red-neon)]" />
              After bypassing login, a poorly protected endpoint can dump the entire{" "}
              <code className="font-mono">users</code> table — including passwords stored in
              plaintext for the vulnerable demo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
