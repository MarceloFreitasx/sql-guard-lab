import { useEffect, useState } from "react";
import { getAuthSession, type AuthSession } from "../lib/auth-session";

export function useAuthSession(): AuthSession | null {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const read = () => setSession(getAuthSession());
    read();
    window.addEventListener("sqlguard-auth-change", read);
    return () => window.removeEventListener("sqlguard-auth-change", read);
  }, []);

  return session;
}
