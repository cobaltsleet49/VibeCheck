<?php
declare(strict_types=1);

namespace VibeCheck\Models;

class Vibe
{
    public static function all(): array
    {
        $pdo  = Database::connection();
        $stmt = $pdo->query(
            'SELECT v.id, v.label, v.emoji, v.created_at, u.username
             FROM vibes v
             JOIN users u ON u.id = v.user_id
             ORDER BY v.created_at DESC'
        );

        return $stmt->fetchAll();
    }

    public static function create(string $label, string $emoji, int $userId): array
    {
        $pdo  = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO vibes (label, emoji, user_id) VALUES (:label, :emoji, :user_id)'
        );
        $stmt->execute([
            ':label'   => $label,
            ':emoji'   => $emoji,
            ':user_id' => $userId,
        ]);

        $id      = (int) $pdo->lastInsertId();
        $fetched = $pdo->prepare('SELECT id, label, emoji, user_id, created_at FROM vibes WHERE id = :id');
        $fetched->execute([':id' => $id]);

        return $fetched->fetch();
    }
}
