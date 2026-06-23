// Client-side simulation of SQL injection logic

export const USERS = [
  { username: "admin", password: "admin123" },
  { username: "alice", password: "password1" },
];

export type AttackCategory =
  | "auth_bypass"
  | "comment"
  | "union"
  | "blind"
  | "stacked"
  | "encoding";

export type InjectionField = "username" | "password" | "either";

export type SqlPayload = {
  id: string;
  name: string;
  payload: string;
  field: InjectionField;
  category: AttackCategory;
  desc: string;
  technique: string;
  exampleQuery: string;
  impact: string;
};

export const ATTACK_CATEGORIES: {
  id: AttackCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "auth_bypass",
    label: "Auth Bypass",
    description: "Break the WHERE clause with tautologies so every row matches.",
  },
  {
    id: "comment",
    label: "Comment Injection",
    description: "Use SQL comment delimiters to ignore the rest of the query.",
  },
  {
    id: "union",
    label: "UNION Based",
    description: "Append a second SELECT to extract or forge result rows.",
  },
  {
    id: "blind",
    label: "Blind / Boolean",
    description: "Infer data through true/false responses without visible output.",
  },
  {
    id: "stacked",
    label: "Stacked Queries",
    description: "Terminate the first query and run additional SQL statements.",
  },
  {
    id: "encoding",
    label: "Encoding Variants",
    description: "Syntax variations that bypass naive filters and WAF rules.",
  },
];

export const PAYLOADS: SqlPayload[] = [
  {
    id: "classic-bypass",
    name: "Classic bypass",
    payload: "' OR '1'='1' --",
    field: "username",
    category: "auth_bypass",
    desc: "Closes the string and adds a string tautology.",
    technique:
      "The closing quote ends the username literal. OR '1'='1' is always TRUE, so the WHERE clause matches every row.",
    exampleQuery: "SELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...'",
    impact: "Full login bypass without knowing any password.",
  },
  {
    id: "or-1-1",
    name: "OR 1=1",
    payload: "' OR 1=1 --",
    field: "username",
    category: "auth_bypass",
    desc: "Numeric tautology that matches all rows.",
    technique:
      "Uses a numeric comparison (1=1) instead of string quotes. Still evaluates to TRUE for every row.",
    exampleQuery: "SELECT * FROM users WHERE username='' OR 1=1 --' AND password='...'",
    impact: "Bypasses authentication and returns the first user in the table.",
  },
  {
    id: "double-quote-bypass",
    name: "Double-quote bypass",
    payload: '" OR "1"="1" --',
    field: "username",
    category: "auth_bypass",
    desc: "Works when the query wraps values in double quotes.",
    technique:
      "Same tautology pattern but targets apps that use double-quoted string literals instead of single quotes.",
    exampleQuery: 'SELECT * FROM users WHERE username="" OR "1"="1" --" AND password="..."',
    impact: "Login bypass on double-quoted SQL construction.",
  },
  {
    id: "no-quote-bypass",
    name: "No-quote numeric",
    payload: "1 OR 1=1",
    field: "username",
    category: "auth_bypass",
    desc: "Bypass when input is inserted without quotes.",
    technique:
      "If the developer omits quotes around numeric-looking fields, the OR 1=1 is parsed as raw SQL logic.",
    exampleQuery: "SELECT * FROM users WHERE username=1 OR 1=1 AND password='...'",
    impact: "Authentication bypass on unquoted parameter insertion.",
  },
  {
    id: "admin-comment-dash",
    name: "Admin comment (--)",
    payload: "admin' --",
    field: "username",
    category: "comment",
    desc: "Logs in as admin by commenting out the password check.",
    technique:
      "Sets username to admin and uses -- to comment out everything after, including the AND password clause.",
    exampleQuery: "SELECT * FROM users WHERE username='admin' --' AND password='...'",
    impact: "Targeted login as a known username without the password.",
  },
  {
    id: "admin-comment-hash",
    name: "Admin comment (#)",
    payload: "admin'#",
    field: "username",
    category: "comment",
    desc: "MySQL-style comment delimiter.",
    technique: "# starts an inline comment in MySQL, ignoring the password check just like -- does.",
    exampleQuery: "SELECT * FROM users WHERE username='admin'#' AND password='...'",
    impact: "Password check removed via MySQL comment syntax.",
  },
  {
    id: "block-comment",
    name: "Block comment (/*)",
    payload: "admin'/*",
    field: "username",
    category: "comment",
    desc: "Opens a block comment to swallow trailing SQL.",
    technique:
      "/* starts a multi-line comment. Combined with a closing */ elsewhere, it can neutralize the password clause.",
    exampleQuery: "SELECT * FROM users WHERE username='admin'/*' AND password='...'",
    impact: "Bypasses filters that only block -- and # but allow block comments.",
  },
  {
    id: "union-forge",
    name: "UNION forged row",
    payload: "' UNION SELECT 1,'admin','x' --",
    field: "username",
    category: "union",
    desc: "Appends a forged result row with admin credentials.",
    technique:
      "UNION SELECT merges a second result set. The attacker crafts columns to match the original query shape.",
    exampleQuery: "SELECT * FROM users WHERE username='' UNION SELECT 1,'admin','x' --' AND password='...'",
    impact: "Data extraction or forged login row without valid credentials.",
  },
  {
    id: "union-null",
    name: "UNION null probe",
    payload: "' UNION SELECT null,null,null --",
    field: "username",
    category: "union",
    desc: "Probes column count with NULL placeholders.",
    technique:
      "Attackers use UNION SELECT null,... to discover how many columns the query returns before injecting real data.",
    exampleQuery: "SELECT * FROM users WHERE username='' UNION SELECT null,null,null --' AND password='...'",
    impact: "Reconnaissance step toward full UNION-based data theft.",
  },
  {
    id: "blind-boolean-true",
    name: "Blind boolean (true)",
    payload: "' OR 'a'='a",
    field: "username",
    category: "blind",
    desc: "Boolean condition that always evaluates to true.",
    technique:
      "In blind injection, the attacker infers data from whether the page behaves differently for TRUE vs FALSE conditions.",
    exampleQuery: "SELECT * FROM users WHERE username='' OR 'a'='a' AND password='...'",
    impact: "Login succeeds; in blind contexts this confirms injectable input.",
  },
  {
    id: "blind-and-true",
    name: "AND 1=1 probe",
    payload: "' AND 1=1 --",
    field: "username",
    category: "blind",
    desc: "True condition — page behaves normally.",
    technique:
      "Compare with AND 1=2 -- (false). Different responses reveal injectable parameters even when errors are hidden.",
    exampleQuery: "SELECT * FROM users WHERE username='' AND 1=1 --' AND password='...'",
    impact: "Confirms boolean-based blind injection vector.",
  },
  {
    id: "stacked-select",
    name: "Stacked SELECT",
    payload: "'; SELECT 1; --",
    field: "username",
    category: "stacked",
    desc: "Runs a second query after the login statement.",
    technique:
      "The semicolon terminates the first statement. A second query executes if the driver allows stacked queries.",
    exampleQuery: "SELECT * FROM users WHERE username=''; SELECT 1; --' AND password='...'",
    impact: "Potential for data reads, writes, or schema changes in vulnerable configs.",
  },
  {
    id: "stacked-drop",
    name: "Stacked DROP (demo)",
    payload: "'; DROP TABLE users; --",
    field: "username",
    category: "stacked",
    desc: "Illustrates destructive stacked query potential.",
    technique:
      "A classic cautionary payload. In this demo it only simulates the concept — no real table is dropped.",
    exampleQuery: "SELECT * FROM users WHERE username=''; DROP TABLE users; --' AND password='...'",
    impact: "Demonstrates catastrophic damage possible with stacked queries (educational only).",
  },
  {
    id: "encoding-no-space",
    name: "No-space comment",
    payload: "admin'--",
    field: "username",
    category: "encoding",
    desc: "Comment bypass without a space before --.",
    technique:
      "Some naive filters look for '-- ' (with space) but miss '--' glued directly to the payload.",
    exampleQuery: "SELECT * FROM users WHERE username='admin'--' AND password='...'",
    impact: "Bypasses simplistic WAF/filter rules on comment syntax.",
  },
  {
    id: "encoding-empty-string",
    name: "Empty string OR",
    payload: "' OR ''='",
    field: "username",
    category: "encoding",
    desc: "Tautology using empty string comparison.",
    technique: "''='' is always TRUE. An alternative tautology that may evade keyword blacklists on '1=1'.",
    exampleQuery: "SELECT * FROM users WHERE username='' OR ''='' AND password='...'",
    impact: "Authentication bypass using alternate tautology syntax.",
  },
  {
    id: "password-or-bypass",
    name: "Password field OR",
    payload: "' OR '1'='1' --",
    field: "password",
    category: "auth_bypass",
    desc: "Injection via the password field instead of username.",
    technique:
      "Attackers target any input that reaches the query. The password field is equally dangerous when concatenated.",
    exampleQuery: "SELECT * FROM users WHERE username='admin' AND password='' OR '1'='1' --'",
    impact: "Bypass even when username is correct or locked down.",
  },
];

export const SQLI_PATTERNS = [
  /'\s*or\s/i,
  /"\s*or\s/i,
  /--/,
  /#/,
  /\/\*/,
  /;/,
  /\b1\s*=\s*1\b/,
  /'\s*=\s*'/,
  /"\s*=\s*"/,
  /\bunion\b/i,
  /\bdrop\b/i,
  /\bselect\b/i,
];

export function getPayloadsByCategory(category: AttackCategory): SqlPayload[] {
  return PAYLOADS.filter((p) => p.category === category);
}

export function findPayloadById(id: string): SqlPayload | undefined {
  return PAYLOADS.find((p) => p.id === id);
}

export function findMatchingPayload(username: string, password: string): SqlPayload | undefined {
  const exact = PAYLOADS.find(
    (p) =>
      (p.field === "username" && p.payload === username) ||
      (p.field === "password" && p.payload === password) ||
      (p.field === "either" && (p.payload === username || p.payload === password)),
  );
  if (exact) return exact;

  const combined = `${username}\0${password}`;
  return PAYLOADS.find((p) => {
    const inUsername = p.field !== "password" && username.includes(p.payload);
    const inPassword = p.field !== "username" && password.includes(p.payload);
    return inUsername || inPassword || combined.includes(p.payload);
  });
}

export function classifyAttack(username: string, password: string): AttackCategory | null {
  const match = findMatchingPayload(username, password);
  if (match) return match.category;

  if (isDangerous(username) || isDangerous(password)) {
    if (/\bunion\b/i.test(username) || /\bunion\b/i.test(password)) return "union";
    if (/;/.test(username) || /;/.test(password)) return "stacked";
    if (/--|#|\/\*/.test(username) || /--|#|\/\*/.test(password)) return "comment";
    if (/'\s*=\s*'|"\s*=\s*"/.test(username) || /'\s*=\s*'|"\s*=\s*"/.test(password)) return "encoding";
    if (/\b(and|or)\b/i.test(username) || /\b(and|or)\b/i.test(password)) return "blind";
    return "auth_bypass";
  }
  return null;
}

export function isDangerous(input: string): boolean {
  return SQLI_PATTERNS.some((re) => re.test(input));
}

export function highlightDanger(input: string): { text: string; danger: boolean }[] {
  if (!input) return [{ text: "", danger: false }];
  const parts: { text: string; danger: boolean }[] = [];
  const dangerChars = /(['"]|--|#|\/\*|;|\bOR\b|\bAND\b|\bUNION\b|\bDROP\b|\bSELECT\b|\b1=1\b)/gi;
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

export function applyPayloadToFields(
  payload: SqlPayload,
): { username: string; password: string } {
  if (payload.field === "password") return { username: "admin", password: payload.payload };
  if (payload.field === "username") return { username: payload.payload, password: "" };
  return { username: payload.payload, password: "" };
}

export type AuthResult = {
  granted: boolean;
  reason: string;
  query: string;
  matchedUser?: string;
  attackType?: AttackCategory;
  technique?: string;
  impact?: string;
  payloadId?: string;
};

const CATEGORY_REASONS: Record<AttackCategory, string> = {
  auth_bypass:
    "The injected payload turned the WHERE clause into a tautology. The database matched every row and returned the first user.",
  comment:
    "A SQL comment delimiter truncated the query, removing the password check. The database only evaluated the username portion.",
  union:
    "UNION SELECT appended a forged result set to the query. The application treated the merged row as a valid login.",
  blind:
    "A boolean condition evaluated to TRUE, causing the query to match. In blind attacks, attackers infer secrets from true/false behavior.",
  stacked:
    "A stacked query was parsed after the semicolon. This demo simulates the concept only — no real secondary query runs.",
  encoding:
    "An encoding or syntax variant bypassed naive filters. The tautology or comment still altered query logic.",
};

function buildInjectionResult(
  query: string,
  category: AttackCategory,
  payload?: SqlPayload,
): AuthResult {
  return {
    granted: true,
    reason: payload?.technique ?? CATEGORY_REASONS[category],
    query,
    matchedUser: "admin",
    attackType: category,
    technique: payload?.technique ?? CATEGORY_REASONS[category],
    impact: payload?.impact ?? "Unauthorized access to the application.",
    payloadId: payload?.id,
  };
}

export function simulateVulnerableLogin(username: string, password: string): AuthResult {
  const query = buildVulnerableQuery(username, password);

  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return { granted: true, reason: "Valid credentials matched.", query, matchedUser: real.username };
  }

  const matchedPayload = findMatchingPayload(username, password);
  const category = classifyAttack(username, password);

  if (category) {
    return buildInjectionResult(query, category, matchedPayload);
  }

  return { granted: false, reason: "No user matched username and password.", query };
}

export function simulateSecureLogin(username: string, password: string): AuthResult {
  const query = `${buildSecureQuery()}\n-- bound: username=${JSON.stringify(username)}, password=${JSON.stringify(password)}`;
  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return { granted: true, reason: "Valid credentials matched.", query, matchedUser: real.username };
  }

  const category = classifyAttack(username, password);
  if (category) {
    const matchedPayload = findMatchingPayload(username, password);
    return {
      granted: false,
      reason:
        "Prepared statement bound your input as a literal string. SQL syntax inside the value (quotes, comments, OR 1=1) is treated as data, not code.",
      query,
      attackType: category,
      technique: matchedPayload?.technique,
      impact: `Blocked: ${matchedPayload?.impact ?? "Injection attempt neutralized by parameterized query."}`,
      payloadId: matchedPayload?.id,
    };
  }

  return {
    granted: false,
    reason: "No user matched username and password.",
    query,
  };
}

export function getCategoryLabel(category: AttackCategory): string {
  return ATTACK_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
