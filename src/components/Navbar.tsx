import { Link } from "@tanstack/react-router";
import {
  Shield,
  ShieldAlert,
  FlaskConical,
  BookOpen,
  Home,
  Swords,
  ListOrdered,
} from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/attacks", label: "Attacks", icon: Swords },
  { to: "/vulnerable", label: "Vulnerable", icon: ShieldAlert },
  { to: "/secure", label: "Secure", icon: Shield },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/walkthrough", label: "Walkthrough", icon: ListOrdered },
  { to: "/defense", label: "Defense", icon: BookOpen },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight">
          <span className="text-[color:var(--cyan-neon)]">{"<"}</span>
          <span className="text-white">SQLGuard</span>
          <span className="text-[color:var(--cyan-neon)]">{"/>"}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-[#161b22] hover:text-white"
              activeProps={{
                className:
                  "rounded-md px-3 py-1.5 text-sm text-[color:var(--cyan-neon)] bg-[#161b22]",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              <span className="flex items-center gap-1.5">
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] p-1 md:flex">
          <Link
            to="/vulnerable"
            className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-[color:var(--red-neon)]"
            activeProps={{
              className:
                "rounded-full px-3 py-1 text-xs font-medium bg-[color:var(--red-neon)]/15 text-[color:var(--red-neon)]",
            }}
          >
            ⚠ Vulnerable
          </Link>
          <Link
            to="/secure"
            className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-[color:var(--green-neon)]"
            activeProps={{
              className:
                "rounded-full px-3 py-1 text-xs font-medium bg-[color:var(--green-neon)]/15 text-[color:var(--green-neon)]",
            }}
          >
            ✓ Secure
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="flex gap-1 overflow-x-auto border-t border-[#30363d] px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="shrink-0 rounded-md px-3 py-1 text-xs text-muted-foreground"
            activeProps={{
              className:
                "shrink-0 rounded-md px-3 py-1 text-xs text-[color:var(--cyan-neon)] bg-[#161b22]",
            }}
            activeOptions={{ exact: l.to === "/" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
