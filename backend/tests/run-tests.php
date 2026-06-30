<?php
declare(strict_types=1);

/**
 * Dynamic security tests — TC-01…TC-16 on vulnerable vs secure login logic.
 *
 * Usage: php backend/tests/run-tests.php
 */

require_once dirname(__DIR__) . '/init.php';
require_once dirname(__DIR__) . '/lib/login-handlers.php';

/** @var list<array<string, string>> $cases */
$cases = require __DIR__ . '/security-test-cases.php';

function create_test_pdo(): PDO
{
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    ensure_database($pdo);

    return $pdo;
}

function classify_outcome(array $result, string $username, string $password): string
{
    if (!empty($result['error'])) {
        return 'error';
    }

    if (empty($result['granted'])) {
        return 'denied';
    }

    if (
        ($username === 'alice' && $password === 'password1') ||
        ($username === 'admin' && $password === 'admin123')
    ) {
        return 'granted';
    }

    return 'bypass';
}

function matches_expected(string $expected, string $actual): bool
{
    return $expected === $actual;
}

echo "SQLGuard dynamic security tests\n";
echo str_repeat('=', 72) . "\n\n";

$failures = 0;
$vulnBypass = 0;
$secureBypass = 0;

foreach ($cases as $case) {
    $vuln = vulnerable_login_attempt(create_test_pdo(), $case['username'], $case['password']);
    $secure = secure_login_attempt(create_test_pdo(), $case['username'], $case['password']);

    $vulnActual = classify_outcome($vuln, $case['username'], $case['password']);
    $secureActual = classify_outcome($secure, $case['username'], $case['password']);

    if ($vulnActual === 'bypass') {
        $vulnBypass++;
    }
    if ($secureActual === 'bypass') {
        $secureBypass++;
    }

    $vulnOk = matches_expected($case['vuln_expect'], $vulnActual);
    $secureOk = matches_expected($case['secure_expect'], $secureActual);
    $status = ($vulnOk && $secureOk) ? 'PASS' : 'FAIL';

    if ($status === 'FAIL') {
        $failures++;
    }

    printf(
        "%s  %-6s  vuln=%-7s (exp %-7s)  secure=%-7s (exp %-7s)  %s\n",
        $status,
        $case['id'],
        $vulnActual,
        $case['vuln_expect'],
        $secureActual,
        $case['secure_expect'],
        $case['objective'],
    );

    if (!$vulnOk) {
        echo "       vulnerable: {$vuln['reason']}\n";
    }
    if (!$secureOk) {
        echo "       secure: {$secure['reason']}\n";
    }
}

echo "\n" . str_repeat('-', 72) . "\n";
echo "Vulnerable auth bypasses (TC): {$vulnBypass}\n";
echo "Secure auth bypasses (must be 0): {$secureBypass}\n";
echo "Test failures: {$failures}\n";

exit($failures > 0 || $secureBypass > 0 ? 1 : 0);
