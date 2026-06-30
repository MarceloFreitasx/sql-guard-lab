// Client-side simulation of SQL injection logic

export const USERS = [
  { username: "admin", password: "admin123" },
  { username: "alice", password: "password1" },
];

export type AttackCategory = "auth_bypass" | "comment" | "union" | "blind" | "stacked" | "encoding";

export type InjectionField = "username" | "password" | "either";

export type Severity = "low" | "medium" | "high" | "critical";

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
  severity: Severity;
  /** Bypasses the project's vulnerable login (single-quoted fields, SQLite). */
  worksInLab: boolean;
  labMismatchReason?: string;
};

/** SQL construction used by backend/api/login-vulnerable.php and the live preview. */
export const LAB_SQL_CONTEXT =
  "Values are wrapped in single quotes — only a closing quote (') breaks out into SQL code";

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
    severity: "critical",
    worksInLab: true,
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
    severity: "critical",
    worksInLab: true,
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
    severity: "high",
    worksInLab: false,
    labMismatchReason:
      "This lab wraps values in single quotes ('), so the double quotes stay inside the literal and do not break out of the string.",
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
    severity: "high",
    worksInLab: false,
    labMismatchReason:
      'The app builds username=\'1 OR 1=1\' — the database searches for that exact text as a username. OR 1=1 is never parsed as SQL unless the developer omits quotes (see example query).',
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
    severity: "critical",
    worksInLab: true,
  },
  {
    id: "admin-comment-hash",
    name: "Admin comment (#)",
    payload: "admin'#",
    field: "username",
    category: "comment",
    desc: "MySQL-style comment delimiter.",
    technique:
      "# starts an inline comment in MySQL, ignoring the password check just like -- does.",
    exampleQuery: "SELECT * FROM users WHERE username='admin'#' AND password='...'",
    impact: "Password check removed via MySQL comment syntax.",
    severity: "critical",
    worksInLab: false,
    labMismatchReason:
      "The # comment syntax is MySQL-specific. This lab uses SQLite, which rejects # as a comment.",
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
    severity: "medium",
    worksInLab: true,
  },
  {
    id: "union-forge",
    name: "UNION forged row",
    payload: "' UNION SELECT 1,'admin','x','x','2026-01-01' --",
    field: "username",
    category: "union",
    desc: "Appends a forged result row with admin credentials.",
    technique:
      "UNION SELECT merges a second result set. The attacker crafts columns to match the original query shape.",
    exampleQuery:
      "SELECT * FROM users WHERE username='' UNION SELECT 1,'admin','x','x','2026-01-01' --' AND password='...'",
    impact: "Data extraction or forged login row without valid credentials.",
    severity: "critical",
    worksInLab: true,
  },
  {
    id: "union-null",
    name: "UNION null probe",
    payload: "' UNION SELECT null,null,null,null,null --",
    field: "username",
    category: "union",
    desc: "Probes column count with NULL placeholders.",
    technique:
      "Attackers use UNION SELECT null,... to discover how many columns the query returns before injecting real data.",
    exampleQuery:
      "SELECT * FROM users WHERE username='' UNION SELECT null,null,null,null,null --' AND password='...'",
    impact: "Reconnaissance step toward full UNION-based data theft.",
    severity: "medium",
    worksInLab: true,
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
    severity: "high",
    worksInLab: false,
    labMismatchReason:
      "Without a comment (--), the password clause still runs. This probe is useful for blind SQLi, but it does not bypass this login form.",
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
    severity: "low",
    worksInLab: false,
    labMismatchReason:
      "This is a reconnaissance probe (true branch), not a tautology that returns a user row on this login.",
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
    severity: "high",
    worksInLab: false,
    labMismatchReason:
      "SQLite via PDO executes one statement per query() call — stacked SQL does not bypass this login.",
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
    severity: "critical",
    worksInLab: false,
    labMismatchReason:
      "Stacked queries are not executed on this login endpoint (single statement, SQLite PDO).",
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
    severity: "medium",
    worksInLab: true,
  },
  {
    id: "encoding-empty-string",
    name: "Empty string OR",
    payload: "' OR ''='",
    field: "username",
    category: "encoding",
    desc: "Tautology using empty string comparison.",
    technique:
      "''='' is always TRUE. An alternative tautology that may evade keyword blacklists on '1=1'.",
    exampleQuery: "SELECT * FROM users WHERE username='' OR ''='' AND password='...'",
    impact: "Authentication bypass using alternate tautology syntax.",
    severity: "high",
    worksInLab: false,
    labMismatchReason:
      "Operator precedence leaves the password check active — no row matches on this login query shape.",
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
    severity: "critical",
    worksInLab: true,
  },
];

export const SEVERITY_META: Record<Severity, { label: string; color: string }> = {
  low: { label: "Low", color: "var(--cyan-neon)" },
  medium: { label: "Medium", color: "#ffa657" },
  high: { label: "High", color: "var(--red-neon)" },
  critical: { label: "Critical", color: "var(--red-neon)" },
};

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
    if (/'\s*=\s*'|"\s*=\s*"/.test(username) || /'\s*=\s*'|"\s*=\s*"/.test(password))
      return "encoding";
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

/** Input can close the opening quote and change SQL structure in this lab. */
export function escapesSingleQuotedLiteral(value: string): boolean {
  return value.includes("'");
}

export function altersLabQueryLogic(username: string, password: string): boolean {
  return escapesSingleQuotedLiteral(username) || escapesSingleQuotedLiteral(password);
}

/** Highlight only syntax that actually leaves the string literal in this lab. */
export function highlightLabQueryValue(value: string): { text: string; danger: boolean }[] {
  if (!escapesSingleQuotedLiteral(value)) {
    return value ? [{ text: value, danger: false }] : [{ text: "", danger: false }];
  }
  return highlightDanger(value);
}

export function buildSecureQuery(): string {
  return `SELECT * FROM users WHERE username = ? AND password = ?`;
}

export function applyPayloadToFields(payload: SqlPayload): { username: string; password: string } {
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

export function explainLabMismatch(username: string, password: string): string | null {
  const matched = findMatchingPayload(username, password);
  if (matched && !matched.worksInLab) {
    return matched.labMismatchReason ?? "This payload does not match how this lab builds SQL.";
  }
  return null;
}

export function simulateVulnerableLogin(username: string, password: string): AuthResult {
  const query = buildVulnerableQuery(username, password);

  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return {
      granted: true,
      reason: "Valid credentials matched.",
      query,
      matchedUser: real.username,
    };
  }

  const matchedPayload = findMatchingPayload(username, password);

  if (matchedPayload && !matchedPayload.worksInLab) {
    return {
      granted: false,
      reason:
        matchedPayload.labMismatchReason ??
        "This payload targets a different SQL construction than this lab uses.",
      query,
      attackType: matchedPayload.category,
      technique: matchedPayload.technique,
      impact: matchedPayload.impact,
      payloadId: matchedPayload.id,
    };
  }

  const category = classifyAttack(username, password);

  if (category && matchedPayload?.worksInLab) {
    return buildInjectionResult(query, category, matchedPayload);
  }

  if (category && !matchedPayload) {
    return {
      granted: false,
      reason:
        "Dangerous SQL-like input was detected, but it does not bypass this login query against the real database.",
      query,
      attackType: category,
    };
  }

  return { granted: false, reason: "No user matched username and password.", query };
}

export function simulateSecureLogin(username: string, password: string): AuthResult {
  const query = `${buildSecureQuery()}\n-- bound: username=${JSON.stringify(username)}, password=${JSON.stringify(password)}`;
  const real = USERS.find((u) => u.username === username && u.password === password);
  if (real) {
    return {
      granted: true,
      reason: "Valid credentials matched.",
      query,
      matchedUser: real.username,
    };
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

// Maps each attack category to the concrete defense that neutralizes it.
export const DEFENSE_BY_CATEGORY: Record<
  AttackCategory,
  { primary: string; how: string; extra: string }
> = {
  auth_bypass: {
    primary: "Prepared statements (parameterized queries)",
    how: "The tautology ' OR '1'='1' is bound as a literal value, so the WHERE clause searches for a username equal to that exact string and matches nothing.",
    extra: "Defense in depth: server-side validation + generic 'invalid credentials' errors.",
  },
  comment: {
    primary: "Prepared statements (parameterized queries)",
    how: "Comment delimiters (--, #, /*) stay inside the bound value and never truncate the SQL template, so the password check is always executed.",
    extra: "Never rely on blacklisting comment characters; bind parameters instead.",
  },
  union: {
    primary: "Prepared statements + least-privilege DB account",
    how: "A bound value can never add a second SELECT to the compiled statement, so no forged row can be merged into the result set.",
    extra: "Restrict the DB user so it cannot read other tables even if injection were possible.",
  },
  blind: {
    primary: "Prepared statements + uniform responses",
    how: "Binding input removes the injectable condition, and returning identical responses/timing for true and false denies the attacker any signal to infer data.",
    extra: "Rate-limit and monitor repeated failed logins that probe boolean conditions.",
  },
  stacked: {
    primary: "Prepared statements + disable multi-statements",
    how: "Parameter binding keeps the semicolon inside the value, and most drivers reject stacked statements on a single query, so no second command runs.",
    extra: "Least-privilege accounts prevent destructive statements like DROP/DELETE.",
  },
  encoding: {
    primary: "Prepared statements (not filtering)",
    how: "Because the value is bound as data, encoding tricks that dodge naive WAF/keyword filters are irrelevant — the payload is never parsed as SQL.",
    extra: "Treat WAFs as a secondary layer, never as the primary control.",
  },
};

export type WalkStep = {
  n: number;
  title: string;
  narration: string;
  queryTokens?: { text: string; danger: boolean }[];
  callout?: { kind: "danger" | "info" | "safe"; text: string };
};

const CATEGORY_PARSE_EXPLAINER: Record<AttackCategory, string> = {
  auth_bypass:
    "The database now sees a condition that is always TRUE (a tautology), so every row matches the WHERE clause and the first user is returned.",
  comment:
    "Everything after the comment delimiter is ignored. The AND password=... check is gone, so only the username portion is evaluated.",
  union:
    "The UNION appends a second, attacker-controlled result set. The application reads the forged row as if it were a real user.",
  blind:
    "The injected boolean condition decides whether a row comes back. By flipping it between TRUE and FALSE, an attacker reads data one bit at a time.",
  stacked:
    "The semicolon ends the login query and a second statement is queued. On drivers that allow stacked queries this can read, write, or destroy data.",
  encoding:
    "A syntax/encoding variant slips past naive filters, but the underlying tautology or comment still rewrites the query logic.",
};

export function buildAttackSteps(payload: SqlPayload): WalkStep[] {
  const injectedQuery =
    payload.field === "password"
      ? buildVulnerableQuery("admin", payload.payload)
      : buildVulnerableQuery(payload.payload, "");
  const fieldLabel = payload.field === "password" ? "password" : "username";

  return [
    {
      n: 1,
      title: "The intended query",
      narration:
        "Normally the app builds this query from a legitimate login. The values in green are meant to be plain data — a username and a password.",
      queryTokens: highlightSafe(
        "SELECT * FROM users WHERE username='alice' AND password='secret'",
      ),
      callout: {
        kind: "info",
        text: "Notice the single quotes that wrap each value. They mark where data is supposed to start and end.",
      },
    },
    {
      n: 2,
      title: "The attacker types a payload",
      narration: `Instead of a normal value, the attacker enters this into the ${fieldLabel} field:`,
      queryTokens: highlightDanger(payload.payload),
      callout: { kind: "danger", text: `${payload.technique}` },
    },
    {
      n: 3,
      title: "The server concatenates it into SQL",
      narration:
        "The vulnerable backend glues the input straight into the SQL string. The highlighted characters break out of the data and become SQL code.",
      queryTokens: highlightDanger(injectedQuery),
      callout: {
        kind: "danger",
        text: "User input is no longer just data — it is now part of the query structure.",
      },
    },
    {
      n: 4,
      title: "The database parses it as code",
      narration: CATEGORY_PARSE_EXPLAINER[payload.category],
      queryTokens: highlightDanger(payload.exampleQuery),
      callout: { kind: "danger", text: CATEGORY_REASONS[payload.category] },
    },
    {
      n: 5,
      title: "Result: ACCESS GRANTED",
      narration:
        "The query returns a matching row, so the app logs the attacker in — usually as the first user (admin).",
      callout: { kind: "danger", text: `Impact: ${payload.impact}` },
    },
  ];
}

export function buildDefenseSteps(payload: SqlPayload): WalkStep[] {
  const defense = DEFENSE_BY_CATEGORY[payload.category];
  const boundValue = payload.payload;

  return [
    {
      n: 1,
      title: "Same payload, hardened backend",
      narration:
        "We send the exact same attack, but this backend uses a prepared statement instead of string concatenation.",
      queryTokens: highlightDanger(payload.payload),
      callout: {
        kind: "info",
        text: "Nothing changes on the attacker's side — only the server-side code is different.",
      },
    },
    {
      n: 2,
      title: "The SQL template is compiled first",
      narration:
        "The database receives the query template with placeholders (?) and compiles its structure before any user data is attached.",
      queryTokens: highlightSafe("SELECT * FROM users WHERE username = ? AND password = ?"),
      callout: {
        kind: "safe",
        text: "The structure of the query is now locked. Data sent later cannot change it.",
      },
    },
    {
      n: 3,
      title: "Your input is bound as pure data",
      narration:
        "The payload is sent separately and bound to the first placeholder. Quotes, comments and OR 1=1 are stored verbatim.",
      queryTokens: highlightSafe(`bound[1] = ${JSON.stringify(boundValue)}`),
      callout: {
        kind: "safe",
        text: "Everything inside the value is treated as literal characters, not SQL operators.",
      },
    },
    {
      n: 4,
      title: "The database searches for that literal string",
      narration: defense.how,
      callout: { kind: "safe", text: `Defense: ${defense.primary}` },
    },
    {
      n: 5,
      title: "Result: ACCESS DENIED",
      narration:
        "No user has a username (or password) literally equal to the payload, so the query returns nothing and login fails.",
      callout: { kind: "safe", text: `Blocked: ${payload.impact}` },
    },
  ];
}

function highlightSafe(input: string): { text: string; danger: boolean }[] {
  return [{ text: input, danger: false }];
}
