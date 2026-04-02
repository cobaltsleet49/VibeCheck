<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

$envFile = __DIR__ . '/../.env';
if (is_file($envFile) && is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            continue;
        }

        [$key, $value] = $parts;
        $key = trim($key);
        $value = trim($value);

        if ($key === '') {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        if (getenv($key) === false) {
            putenv($key . '=' . $value);
        }

        if (!isset($_ENV[$key])) {
            $_ENV[$key] = $value;
        }
    }
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$requestUri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];
$routeParams = [];

// Simple router
$routes = [
    'GET'  => [
        '/api/users' => 'VibeCheck\\Controllers\\UserController@index',
        '/api/events' => 'VibeCheck\\Controllers\\EventController@index',
        '/api/registrations' => 'VibeCheck\\Controllers\\EventRegistrationController@index',
        '/api/users/{id}' => 'VibeCheck\\Controllers\\UserController@show',
        '/api/events/{id}' => 'VibeCheck\\Controllers\\EventController@show',
        '/api/registrations/{id}' => 'VibeCheck\\Controllers\\EventRegistrationController@show',
    ],
    'POST' => [
        '/api/users' => 'VibeCheck\\Controllers\\UserController@store',
        '/api/events' => 'VibeCheck\\Controllers\\EventController@store',
        '/api/registrations' => 'VibeCheck\\Controllers\\EventRegistrationController@store',
    ],
    'PUT' => [
        '/api/events/{id}' => 'VibeCheck\\Controllers\\EventController@update',
    ],
    'DELETE' => [
        '/api/users/{id}' => 'VibeCheck\\Controllers\\UserController@destroy',
        '/api/events/{id}' => 'VibeCheck\\Controllers\\EventController@destroy',
        '/api/registrations/{id}' => 'VibeCheck\\Controllers\\EventRegistrationController@destroy',
    ],
];

$handler = $routes[$requestMethod][$requestUri] ?? null;

if ($handler === null && $requestMethod === 'GET') {
    if (preg_match('#^/api/users/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\UserController@show';
        $routeParams[] = (int) $matches[1];
    } elseif (preg_match('#^/api/events/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\EventController@show';
        $routeParams[] = (int) $matches[1];
    } elseif (preg_match('#^/api/registrations/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\EventRegistrationController@show';
        $routeParams[] = (int) $matches[1];
    }
}

if ($handler === null && $requestMethod === 'DELETE') {
    if (preg_match('#^/api/users/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\UserController@destroy';
        $routeParams[] = (int) $matches[1];
    } elseif (preg_match('#^/api/events/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\EventController@destroy';
        $routeParams[] = (int) $matches[1];
    } elseif (preg_match('#^/api/registrations/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\EventRegistrationController@destroy';
        $routeParams[] = (int) $matches[1];
    }
}

if ($handler === null && $requestMethod === 'PUT') {
    if (preg_match('#^/api/events/(\d+)$#', $requestUri, $matches) === 1) {
        $handler = 'VibeCheck\\Controllers\\EventController@update';
        $routeParams[] = (int) $matches[1];
    }
}

if ($handler === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
    exit;
}

[$class, $method] = explode('@', $handler);

if (!class_exists($class)) {
    http_response_code(500);
    echo json_encode(['error' => 'Controller not found']);
    exit;
}

$controller = new $class();
echo json_encode($controller->$method(...$routeParams));
