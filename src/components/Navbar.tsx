import { Link, useNavigate } from "@tanstack/react-router";
import {
  Shield,
  ShieldAlert,
  FlaskConical,
  BookOpen,
  Home,
  Swords,
  ListOrdered,
  Terminal,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuthSession } from "../hooks/use-auth-session";
import { logoutApi } from "../lib/auth-api";
import { clearAuthSession } from "../lib/auth-session";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/walkthrough", label: "Walkthrough", icon: ListOrdered },
  { to: "/attacks", label: "Attacks", icon: Swords },
  { to: "/defense", label: "Defense", icon: BookOpen },
  { to: "/vulnerable", label: "Vulnerable", icon: ShieldAlert },
  { to: "/secure", label: "Secure", icon: Shield },
] as const;

const labCtaBase =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-md font-semibold transition-colors duration-200";

export function Navbar() {
  const session = useAuthSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore if backend offline
    }
    clearAuthSession();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-lg border border-[color:var(--bg-border)] bg-[color:var(--bg-card)]/90 px-4 py-2.5 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.5)] backdrop-blur-md">
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-md transition-colors hover:text-[color:var(--cyan-neon)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--bg-border)] bg-[color:var(--bg-base)]">
            <Terminal className="h-4 w-4 text-[color:var(--cyan-neon)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
              SQLGuard
            </span>
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">security lab</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-[color:var(--bg-elevated)] hover:text-foreground"
              activeProps={{
                className:
                  "cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-[color:var(--cyan-neon)] bg-[color:var(--bg-elevated)]",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              <span className="flex items-center gap-1.5">
                <l.icon className="h-3.5 w-3.5 shrink-0" />
                {l.label}
              </span>
            </Link>
          ))}
          {session && (
            <Link
              to="/dashboard"
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-[color:var(--bg-elevated)] hover:text-foreground"
              activeProps={{
                className:
                  "cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-[color:var(--cyan-neon)] bg-[color:var(--bg-elevated)]",
              }}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                Dashboard
              </span>
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {session && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[color:var(--bg-border)] px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          )}
          <Link
            to="/lab"
            className={`${labCtaBase} bg-[color:var(--cyan-neon)] px-3.5 py-2 text-xs text-[color:var(--bg-base)] shadow-[0_0_24px_-6px_var(--cyan-neon)] hover:bg-[#7dd3fc]`}
            activeProps={{
              className: `${labCtaBase} bg-[color:var(--cyan-neon)] px-3.5 py-2 text-xs text-[color:var(--bg-base)] shadow-[0_0_24px_-6px_var(--cyan-neon)] ring-2 ring-[color:var(--cyan-neon)]/40 ring-offset-2 ring-offset-[color:var(--bg-card)]`,
            }}
          >
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            Open Lab
          </Link>
        </div>
      </nav>

      <div className="mx-auto mt-2 flex max-w-7xl items-center gap-2 lg:hidden">
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-lg border border-[color:var(--bg-border)] bg-[color:var(--bg-card)]/80 px-2 py-1.5 backdrop-blur-md">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors"
              activeProps={{
                className:
                  "shrink-0 cursor-pointer rounded-md bg-[color:var(--bg-elevated)] px-2.5 py-1 text-xs text-[color:var(--cyan-neon)]",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          {session && (
            <Link
              to="/dashboard"
              className="shrink-0 cursor-pointer rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors"
              activeProps={{
                className:
                  "shrink-0 cursor-pointer rounded-md bg-[color:var(--bg-elevated)] px-2.5 py-1 text-xs text-[color:var(--cyan-neon)]",
              }}
            >
              Dashboard
            </Link>
          )}
        </div>

        <Link
          to="/lab"
          className={`${labCtaBase} shrink-0 bg-[color:var(--cyan-neon)] px-3 py-2 text-xs text-[color:var(--bg-base)] shadow-[0_0_20px_-6px_var(--cyan-neon)] hover:bg-[#7dd3fc]`}
          activeProps={{
            className: `${labCtaBase} shrink-0 bg-[color:var(--cyan-neon)] px-3 py-2 text-xs text-[color:var(--bg-base)] shadow-[0_0_20px_-6px_var(--cyan-neon)] ring-2 ring-[color:var(--cyan-neon)]/40`,
          }}
        >
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          Lab
        </Link>
      </div>
    </header>
  );
}
