import type { LoginMode } from "./auth-session";

export type ApiLoginResponse = {
  granted: boolean;
  username?: string;
  mode: LoginMode;
  query?: string;
  bound?: { username: string; password: string };
  reason: string;
};

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function postJson<T>(url: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as T & { reason?: string };
  if (!res.ok) {
    throw new AuthApiError(
      typeof data === "object" && data && "reason" in data && data.reason
        ? String(data.reason)
        : `Request failed (${res.status})`,
    );
  }
  return data;
}

export async function loginVulnerable(
  username: string,
  password: string,
): Promise<ApiLoginResponse> {
  return postJson<ApiLoginResponse>("/api/login/vulnerable", { username, password });
}

export async function loginSecure(username: string, password: string): Promise<ApiLoginResponse> {
  return postJson<ApiLoginResponse>("/api/login/secure", { username, password });
}

export async function logoutApi(): Promise<void> {
  await postJson<{ ok: boolean }>("/api/logout", {});
}

export type ApiUserRecord = {
  id: number;
  username: string;
  password?: string;
  created_at: string;
};

export type ApiUsersResponse = {
  mode: LoginMode;
  leaked: boolean;
  query: string;
  reason: string;
  users: ApiUserRecord[];
};

export async function fetchUsers(): Promise<ApiUsersResponse> {
  const res = await fetch("/api/users", { credentials: "include" });
  const data = (await res.json()) as ApiUsersResponse & { reason?: string };
  if (!res.ok) {
    throw new AuthApiError(
      typeof data === "object" && data?.reason ? data.reason : `Request failed (${res.status})`,
    );
  }
  return data;
}

export async function fetchSession(): Promise<{
  authenticated: boolean;
  username?: string;
  mode?: LoginMode;
}> {
  const res = await fetch("/api/session", { credentials: "include" });
  if (!res.ok) throw new AuthApiError(`Session check failed (${res.status})`);
  return res.json();
}
