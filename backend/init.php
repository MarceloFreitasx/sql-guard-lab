<?php
declare(strict_types=1);

function ensure_database(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );

    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $seed = [
        ['admin', 'admin123'],
        ['alice', 'password1'],
    ];

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, password, password_hash) VALUES (?, ?, ?)'
    );

    foreach ($seed as [$username, $password]) {
        $stmt->execute([
            $username,
            $password,
            password_hash($password, PASSWORD_BCRYPT),
        ]);
    }
}
