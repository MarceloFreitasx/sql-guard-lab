<?php
declare(strict_types=1);

/**
 * Router for PHP built-in server: php -S localhost:8080 -t backend backend/router.php
 */

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

$routes = [
    'POST' => [
        '/api/login/vulnerable' => __DIR__ . '/api/login-vulnerable.php',
        '/api/login/secure' => __DIR__ . '/api/login-secure.php',
        '/api/logout' => __DIR__ . '/api/logout.php',
    ],
    'GET' => [
        '/' => null,
        '/api/session' => __DIR__ . '/api/session.php',
        '/api/users' => __DIR__ . '/api/users.php',
    ],
];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (isset($routes[$method][$path])) {
    if ($path === '/' && $method === 'GET') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'service' => 'sqlguard-api',
            'endpoints' => [
                'POST /api/login/vulnerable',
                'POST /api/login/secure',
                'GET /api/session',
                'GET /api/users',
                'POST /api/logout',
            ],
        ], JSON_UNESCAPED_UNICODE);
        return true;
    }
    require $routes[$method][$path];
    return true;
}

return false;
