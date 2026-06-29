<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

api_start_session();

if (empty($_SESSION['user_id'])) {
    api_json(['authenticated' => false]);
}

api_json([
    'authenticated' => true,
    'username' => (string) ($_SESSION['username'] ?? ''),
    'mode' => (string) ($_SESSION['login_mode'] ?? 'unknown'),
    'userId' => (int) $_SESSION['user_id'],
]);
