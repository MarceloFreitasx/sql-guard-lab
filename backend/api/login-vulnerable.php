<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

api_start_session();

$body = api_read_json_body();
$username = (string) ($body['username'] ?? '');
$password = (string) ($body['password'] ?? '');

$pdo = get_pdo();

// VULNERABLE: concatenated SQL against real SQLite.
$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";

try {
    $result = $pdo->query($sql);
    $row = $result ? $result->fetch() : false;

    if ($row) {
        $_SESSION['user_id'] = (int) $row['id'];
        $_SESSION['username'] = (string) $row['username'];
        $_SESSION['login_mode'] = 'vulnerable';

        api_json([
            'granted' => true,
            'username' => $row['username'],
            'mode' => 'vulnerable',
            'query' => $sql,
            'reason' => 'A row matched the executed query.',
        ]);
    }

    api_json([
        'granted' => false,
        'mode' => 'vulnerable',
        'query' => $sql,
        'reason' => 'No user matched username and password.',
    ]);
} catch (PDOException $ex) {
    api_json([
        'granted' => false,
        'mode' => 'vulnerable',
        'query' => $sql,
        'reason' => 'Database error: ' . $ex->getMessage(),
    ], 500);
}
