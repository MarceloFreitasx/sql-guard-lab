<?php
declare(strict_types=1);

/**
 * Shared login logic for API endpoints and automated tests.
 *
 * @return array{granted: bool, id?: int, username?: string, query: string, error: bool, reason: string}
 */
function vulnerable_login_attempt(PDO $pdo, string $username, string $password): array
{
    $sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";

    try {
        $result = $pdo->query($sql);
        $row = $result ? $result->fetch() : false;

        if ($row) {
            return [
                'granted' => true,
                'id' => (int) $row['id'],
                'username' => (string) $row['username'],
                'query' => $sql,
                'error' => false,
                'reason' => 'A row matched the executed query.',
            ];
        }

        return [
            'granted' => false,
            'query' => $sql,
            'error' => false,
            'reason' => 'No user matched username and password.',
        ];
    } catch (PDOException $ex) {
        return [
            'granted' => false,
            'query' => $sql,
            'error' => true,
            'reason' => 'Database error: ' . $ex->getMessage(),
        ];
    }
}

/**
 * @return array{granted: bool, id?: int, username?: string, query: string, error: bool, reason: string}
 */
function secure_login_attempt(PDO $pdo, string $username, string $password): array
{
    $template = 'SELECT id, username, password_hash FROM users WHERE username = ?';

    $stmt = $pdo->prepare($template);
    $stmt->execute([$username]);
    $row = $stmt->fetch();

    if ($row && password_verify($password, (string) $row['password_hash'])) {
        return [
            'granted' => true,
            'id' => (int) $row['id'],
            'username' => (string) $row['username'],
            'query' => $template,
            'error' => false,
            'reason' => 'Valid credentials matched via prepared statement.',
        ];
    }

    return [
        'granted' => false,
        'query' => $template,
        'error' => false,
        'reason' => 'Prepared statement bound your input as data. No matching user and password.',
    ];
}
