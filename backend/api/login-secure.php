<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

api_start_session();

$body = api_read_json_body();
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');

$pdo = get_pdo();
$template = 'SELECT id, username, password_hash FROM users WHERE username = ?';

$stmt = $pdo->prepare($template);
$stmt->execute([$username]);
$row = $stmt->fetch();

if ($row && password_verify($password, (string) $row['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $row['id'];
    $_SESSION['username'] = (string) $row['username'];
    $_SESSION['login_mode'] = 'secure';

    api_json([
        'granted' => true,
        'username' => $row['username'],
        'mode' => 'secure',
        'query' => $template,
        'bound' => ['username' => $username, 'password' => $password],
        'reason' => 'Valid credentials matched via prepared statement.',
    ]);
}

api_json([
    'granted' => false,
    'mode' => 'secure',
    'query' => $template,
    'bound' => ['username' => $username, 'password' => $password],
    'reason' => 'Prepared statement bound your input as data. No matching user and password.',
]);
