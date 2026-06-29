<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

api_start_session();

if (empty($_SESSION['user_id'])) {
    api_json(['reason' => 'Authentication required.'], 401);
}

$pdo = get_pdo();
$mode = (string) ($_SESSION['login_mode'] ?? 'unknown');

if ($mode === 'vulnerable') {
    // Intentionally leaky: simulates attacker reaching an unprotected admin/users endpoint
    // after auth bypass — full table dump including plaintext password column.
    $sql = 'SELECT id, username, password, created_at FROM users ORDER BY id';
    $users = $pdo->query($sql)->fetchAll();

    api_json([
        'mode' => 'vulnerable',
        'leaked' => true,
        'query' => $sql,
        'reason' =>
            'No row-level filter: every account in the database is returned, including the plaintext password column.',
        'users' => $users,
    ]);
}

if ($mode === 'secure') {
    $sql = 'SELECT id, username, created_at FROM users WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([(int) $_SESSION['user_id']]);
    $row = $stmt->fetch();

    api_json([
        'mode' => 'secure',
        'leaked' => false,
        'query' => $sql,
        'reason' =>
            'Scoped to the authenticated user only. Password fields are never selected or returned.',
        'users' => $row ? [$row] : [],
    ]);
}

api_json(['reason' => 'Unknown login mode.'], 400);
