<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

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

// Simple router
$routes = [
    'GET'  => [
        '/api/health'  => 'VibeCheck\\Controllers\\HealthController@index',
        '/api/vibes'   => 'VibeCheck\\Controllers\\VibeController@index',
    ],
    'POST' => [
        '/api/vibes'   => 'VibeCheck\\Controllers\\VibeController@store',
    ],
];

$handler = $routes[$requestMethod][$requestUri] ?? null;

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
echo json_encode($controller->$method());
