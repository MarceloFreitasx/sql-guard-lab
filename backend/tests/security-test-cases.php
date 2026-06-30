<?php
declare(strict_types=1);

/**
 * Security test catalogue (TC-01 … TC-16) aligned with report/main.tex Table tab:testcases.
 *
 * vuln_expect / secure_expect:
 *   granted | denied | bypass | error
 */
return [
    [
        'id' => 'TC-01',
        'objective' => 'Valid login succeeds',
        'username' => 'alice',
        'password' => 'password1',
        'vuln_expect' => 'granted',
        'secure_expect' => 'granted',
    ],
    [
        'id' => 'TC-02',
        'objective' => 'Wrong password rejected',
        'username' => 'alice',
        'password' => 'wrong',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-03',
        'objective' => 'Classic auth bypass',
        'username' => "' OR '1'='1' --",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-04',
        'objective' => 'Numeric tautology',
        'username' => "' OR 1=1 --",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-05',
        'objective' => 'Comment injection as admin',
        'username' => "admin' --",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-06',
        'objective' => 'MySQL # comment (SQLite)',
        'username' => "admin'#",
        'password' => '',
        'vuln_expect' => 'error',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-07',
        'objective' => 'UNION forged row',
        'username' => "' UNION SELECT 1,'admin','x','x','2026-01-01' --",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-08',
        'objective' => 'UNION column probe',
        'username' => "' UNION SELECT null,null,null,null,null --",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-09',
        'objective' => 'Boolean blind (true) without comment',
        'username' => "' OR 'a'='a",
        'password' => '',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-10',
        'objective' => 'Boolean AND probe',
        'username' => "' AND 1=1 --",
        'password' => '',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-11',
        'objective' => 'Stacked SELECT (PDO single statement)',
        'username' => "'; SELECT 1; --",
        'password' => '',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-12',
        'objective' => 'Stacked DROP (PDO single statement)',
        'username' => "'; DROP TABLE users; --",
        'password' => '',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-13',
        'objective' => 'Encoding (no space before --)',
        'username' => "admin'--",
        'password' => '',
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-14',
        'objective' => 'Empty-string tautology',
        'username' => "' OR ''='",
        'password' => '',
        'vuln_expect' => 'denied',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-15',
        'objective' => 'Injection via password field',
        'username' => 'admin',
        'password' => "' OR '1'='1' --",
        'vuln_expect' => 'bypass',
        'secure_expect' => 'denied',
    ],
    [
        'id' => 'TC-16',
        'objective' => 'Single-quote probe',
        'username' => "'",
        'password' => '',
        'vuln_expect' => 'error',
        'secure_expect' => 'denied',
    ],
];
