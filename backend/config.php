<?php
declare(strict_types=1);

require_once __DIR__ . '/init.php';

function get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dataDir = __DIR__ . '/data';
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            http_response_code(500);
            exit(
                'PDO SQLite is not enabled. Install the PHP SQLite extension, e.g. ' .
                'sudo apt install php-sqlite3 (Debian/Ubuntu) or php8.3-sqlite3, then restart.'
            );
        }

        $pdo = new PDO('sqlite:' . $dataDir . '/app.db');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        ensure_database($pdo);
    }

    return $pdo;
}
