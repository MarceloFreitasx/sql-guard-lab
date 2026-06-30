#!/usr/bin/env node
/**
 * Static security checks (SAST-lite) for the PHP API.
 * Exit 0 = pass, 1 = findings.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const files = {
  vulnerable: resolve(root, "backend/lib/login-handlers.php"),
  secure: resolve(root, "backend/lib/login-handlers.php"),
};

const vulnSource = readFileSync(files.vulnerable, "utf8");
const secureSource = readFileSync(files.secure, "utf8");

const findings = [];

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) return "";
  const brace = source.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  return "";
}

const vulnFn = extractFunction(vulnSource, "vulnerable_login_attempt");
const secureFn = extractFunction(secureSource, "secure_login_attempt");

if (!vulnFn.includes("username='$username'") && !vulnFn.includes('username=\'$username\'')) {
  findings.push("Vulnerable login must concatenate user input into SQL (intentional baseline).");
}

if (vulnFn.includes("->prepare(")) {
  findings.push("Vulnerable login must NOT use prepared statements.");
}

if (!secureFn.includes("->prepare(")) {
  findings.push("Secure login must use PDO::prepare().");
}

if (secureFn.includes("username='$username'") || secureFn.includes("password='$password'")) {
  findings.push("Secure login must not concatenate user input into SQL.");
}

if (!secureFn.includes("password_verify(")) {
  findings.push("Secure login must verify password_hash with password_verify().");
}

const initPhp = readFileSync(resolve(root, "backend/init.php"), "utf8");
if (!initPhp.includes("password_hash")) {
  findings.push("Database seed must store password_hash for secure login.");
}

console.log("SQLGuard static security checks\n" + "=".repeat(40));

if (findings.length === 0) {
  console.log("PASS  Vulnerable path uses concatenation (intentional).");
  console.log("PASS  Secure path uses prepared statements + password_verify().");
  console.log("PASS  Schema includes password_hash column.");
  process.exit(0);
}

for (const f of findings) {
  console.log("FAIL  " + f);
}
process.exit(1);
