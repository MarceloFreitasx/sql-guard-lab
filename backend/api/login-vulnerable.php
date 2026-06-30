<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once dirname(__DIR__) . '/lib/login-handlers.php';

api_start_session();

$body = api_read_json_body();
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');

$result = vulnerable_login_attempt(get_pdo(), $username, $password);

if ($result['granted']) {
    $_SESSION['user_id'] = (int) $result['id'];
    $_SESSION['username'] = (string) $result['username'];
    $_SESSION['login_mode'] = 'vulnerable';

    api_json([
        'granted' => true,
        'username' => $result['username'],
        'mode' => 'vulnerable',
        'query' => $result['query'],
        'reason' => $result['reason'],
    ]);
}

$status = $result['error'] ? 500 : 200;
api_json([
    'granted' => false,
    'mode' => 'vulnerable',
    'query' => $result['query'],
    'reason' => $result['reason'],
], $status);
