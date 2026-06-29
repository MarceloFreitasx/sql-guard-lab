export type LoginMode = "vulnerable" | "secure";

export type AuthSession = {
  username: string;
  mode: LoginMode;
  query?: string;
  grantedAt: number;
};

const STORAGE_KEY = "sqlguard-auth";

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("sqlguard-auth-change"));
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("sqlguard-auth-change"));
}

export function isAuthenticated(): boolean {
  return getAuthSession() !== null;
}
