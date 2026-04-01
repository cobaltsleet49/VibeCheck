<?php
declare(strict_types=1);

namespace VibeCheck\Models;

use VibeCheck\Services\Database;

class Event
{
    public static function all(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT e.event_id, e.creator_id, u.name AS creator_name, e.title, e.description,
                    e.start_time, e.end_time, e.location, e.capacity, e.created_at,
                    e.registration_type, e.event_type
             FROM events e
             JOIN users u ON u.user_id = e.creator_id
             ORDER BY e.start_time ASC'
        );

        return $stmt->fetchAll();
    }

    public static function create(
        int $creatorId,
        string $title,
        string $description,
        string $startTime,
        string $endTime,
        ?string $location,
        ?int $capacity,
        ?string $registrationType,
        ?string $eventType
    ): array {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO events (
                creator_id, title, description, start_time, end_time,
                location, capacity, registration_type, event_type
             ) VALUES (
                :creator_id, :title, :description, :start_time, :end_time,
                :location, :capacity, :registration_type, :event_type
             )'
        );

        $stmt->execute([
            ':creator_id' => $creatorId,
            ':title' => $title,
            ':description' => $description,
            ':start_time' => $startTime,
            ':end_time' => $endTime,
            ':location' => $location,
            ':capacity' => $capacity,
            ':registration_type' => $registrationType,
            ':event_type' => $eventType,
        ]);

        $id = (int) $pdo->lastInsertId();
        $fetched = $pdo->prepare(
            'SELECT event_id, creator_id, title, description, start_time, end_time,
                    location, capacity, created_at, registration_type, event_type
             FROM events
             WHERE event_id = :event_id'
        );
        $fetched->execute([':event_id' => $id]);

        return $fetched->fetch();
    }

    public static function find(int $eventId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT e.event_id, e.creator_id, u.name AS creator_name, e.title, e.description,
                    e.start_time, e.end_time, e.location, e.capacity, e.created_at,
                    e.registration_type, e.event_type
             FROM events e
             JOIN users u ON u.user_id = e.creator_id
             WHERE e.event_id = :event_id'
        );
        $stmt->execute([':event_id' => $eventId]);

        return $stmt->fetch();
    }

    public static function delete(int $eventId): bool
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM events WHERE event_id = :event_id');
        $stmt->execute([':event_id' => $eventId]);

        return $stmt->rowCount() > 0;
    }
}
