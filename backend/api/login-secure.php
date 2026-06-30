<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/login-handlers.php';

api_start_session();

$body = api_read_json_body();
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');

$result = secure_login_attempt(get_pdo(), $username, $password);

if ($result['granted']) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $result['id'];
    $_SESSION['username'] = (string) $result['username'];
    $_SESSION['login_mode'] = 'secure';

    api_json([
        'granted' => true,
        'username' => $result['username'],
        'mode' => 'secure',
        'query' => $result['query'],
        'bound' => ['username' => $username, 'password' => $password],
        'reason' => $result['reason'],
    ]);
}

api_json([
    'granted' => false,
    'mode' => 'secure',
    'query' => $result['query'],
    'bound' => ['username' => $username, 'password' => $password],
    'reason' => $result['reason'],
]);
