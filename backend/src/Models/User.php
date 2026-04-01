<?php
declare(strict_types=1);

namespace VibeCheck\Models;

use VibeCheck\Services\Database;

class User
{
    public static function all(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT user_id, name, email, created_at
             FROM users
             ORDER BY created_at DESC'
        );

        return $stmt->fetchAll();
    }

    public static function create(string $name, string $email): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email) VALUES (:name, :email)'
        );
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
        ]);

        $id = (int) $pdo->lastInsertId();
        $fetched = $pdo->prepare(
            'SELECT user_id, name, email, created_at FROM users WHERE user_id = :user_id'
        );
        $fetched->execute([':user_id' => $id]);

        return $fetched->fetch();
    }

    public static function find(int $userId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT user_id, name, email, created_at
             FROM users
             WHERE user_id = :user_id'
        );
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetch();
    }

    public static function delete(int $userId): bool
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM users WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }
}
