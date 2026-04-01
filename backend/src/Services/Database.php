<?php
declare(strict_types=1);

namespace VibeCheck\Services;

use PDO;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    private static function env(string $key): string
    {
        $value = $_ENV[$key] ?? getenv($key);

        if ($value === false || $value === null || $value === '') {
            throw new RuntimeException("Missing required environment variable: {$key}");
        }

        return (string) $value;
    }

    public static function connection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                self::env('DB_HOST'),
                self::env('DB_PORT'),
                self::env('DB_NAME')
            );

            self::$instance = new PDO(
                $dsn,
                self::env('DB_USER'),
                self::env('DB_PASSWORD'),
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        }

        return self::$instance;
    }
}
