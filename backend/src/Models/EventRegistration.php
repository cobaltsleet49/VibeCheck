<?php
declare(strict_types=1);

namespace VibeCheck\Models;

use VibeCheck\Services\Database;

class EventRegistration
{
    public static function all(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT er.reg_id, er.user_id, u.name AS user_name,
                    er.event_id, e.title AS event_title,
                    er.registration_time, er.status
             FROM event_registrations er
             JOIN users u ON u.user_id = er.user_id
             JOIN events e ON e.event_id = er.event_id
             ORDER BY er.registration_time DESC'
        );

        return $stmt->fetchAll();
    }

    public static function create(int $userId, int $eventId, string $status): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO event_registrations (user_id, event_id, status)
             VALUES (:user_id, :event_id, :status)'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
            ':status' => $status,
        ]);

        $id = (int) $pdo->lastInsertId();
        $fetched = $pdo->prepare(
            'SELECT reg_id, user_id, event_id, registration_time, status
             FROM event_registrations
             WHERE reg_id = :reg_id'
        );
        $fetched->execute([':reg_id' => $id]);

        return $fetched->fetch();
    }

    public static function find(int $regId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT er.reg_id, er.user_id, u.name AS user_name,
                    er.event_id, e.title AS event_title,
                    er.registration_time, er.status
             FROM event_registrations er
             JOIN users u ON u.user_id = er.user_id
             JOIN events e ON e.event_id = er.event_id
             WHERE er.reg_id = :reg_id'
        );
        $stmt->execute([':reg_id' => $regId]);

        return $stmt->fetch();
    }

    public static function delete(int $regId): bool
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM event_registrations WHERE reg_id = :reg_id');
        $stmt->execute([':reg_id' => $regId]);

        return $stmt->rowCount() > 0;
    }
}
