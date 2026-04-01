<?php
declare(strict_types=1);

namespace VibeCheck\Models;

use PDO;

class Database
{
    private static ?PDO $instance = null;

    public static function connection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $_ENV['DB_HOST']     ?? 'db',
                $_ENV['DB_PORT']     ?? '3306',
                $_ENV['DB_NAME']     ?? 'vibecheck'
            );

            self::$instance = new PDO(
                $dsn,
                $_ENV['DB_USER']     ?? 'vibecheck',
                $_ENV['DB_PASSWORD'] ?? 'secret',
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        }

        return self::$instance;
    }
}
