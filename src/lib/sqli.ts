// Client-side simulation of SQL injection logic

export const USERS = [
  { username: "admin", password: "admin123" },
  { username: "alice", password: "password1" },
];

export const SQLI_PATTERNS = [
  /'\s*or\s/i,
  /--/,
  /#/,
  /\b1\s*=\s*1\b/,
  /'\s*=\s*'/,
  /\bunion\b/i,
];

export function isDangerous(input: string): boolean {
  return SQLI_PATTERNS.some((re) => re.test(input));
}

export function highlightDanger(input: string): { text: string; danger: boolean }[] {
  if (!input) return [{ text: "", danger: false }];
  const parts: { text: string; danger: boolean }[] = [];
  const dangerChars = /(['"]|--|#|\bOR\b|\bUNION\b|\b1=1\b)/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = dangerChars.exec(input)) !== null) {
    if (m.index > lastIndex) parts.push({ text: input.slice(lastIndex, m.index), danger: false });
    parts.push({ text: m[0], danger: true });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < input.length) parts.push({ text: input.slice(lastIndex), danger: false });
  return parts;
}

export function buildVulnerableQuery(username: string, password: string): string {
  return `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
}

export function buildSecureQuery(): string {
  return `SELECT * FROM users WHERE username = ? AND password = ?`;
}

export type AuthResult = {
  granted: boolean;
  reason: string;
  query: string;
  matchedUser?: string;
};

export function simulateVulnerableLogin(username: string, password: string): AuthResult {
  const query = buildVulnerableQuery(username, password);

  // Real credential match
  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return { granted: true, reason: "Valid credentials matched.", query, matchedUser: real.username };
  }

  // Naive SQLi simulation: if input contains common bypass tokens, "the query"
  // collapses to a tautology and returns the first user (admin).
  if (isDangerous(username) || isDangerous(password)) {
    return {
      granted: true,
      reason:
        "The injected payload turned the WHERE clause into a tautology (e.g. '1'='1' is always TRUE). The DB returned the first matching row.",
      query,
      matchedUser: "admin",
    };
  }

  return { granted: false, reason: "No user matched username and password.", query };
}

export function simulateSecureLogin(username: string, password: string): AuthResult {
  const query = `${buildSecureQuery()}\n-- bound: username=${JSON.stringify(username)}, password=${JSON.stringify(password)}`;
  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return { granted: true, reason: "Valid credentials matched.", query, matchedUser: real.username };
  }
  return {
    granted: false,
    reason:
      "Prepared statement bound your input as a literal string. SQL syntax inside the value (quotes, comments, OR 1=1) is treated as data, not code.",
    query,
  };
}

export const PAYLOADS = [
  { name: "Classic bypass", payload: "' OR '1'='1' --", desc: "Closes the string and adds a tautology." },
  { name: "Admin comment", payload: "admin' --", desc: "Logs in as admin by commenting out the password check." },
  { name: "OR 1=1", payload: "' OR 1=1 --", desc: "Tautology that matches every row." },
  { name: "Comment bypass (#)", payload: "admin'#", desc: "Uses # as a MySQL comment delimiter." },
  { name: "UNION attack", payload: "' UNION SELECT 1,'x','y' --", desc: "Appends a second result set." },
  { name: "Blind boolean", payload: "' OR 'a'='a", desc: "Boolean-based blind injection." },
];
