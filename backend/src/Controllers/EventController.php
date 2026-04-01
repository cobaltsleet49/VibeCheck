<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

use VibeCheck\Models\Event;

class EventController
{
    public function index(): array
    {
        return Event::all();
    }

    public function show(int $eventId): array
    {
        $event = Event::find($eventId);
        if ($event === false) {
            http_response_code(404);
            return ['error' => 'Event not found'];
        }

        return $event;
    }

    public function store(): array
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $creatorId = (int) ($body['creator_id'] ?? 0);
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $startTime = trim($body['start_time'] ?? '');
        $endTime = trim($body['end_time'] ?? '');
        $location = isset($body['location']) ? trim((string) $body['location']) : null;
        $capacity = isset($body['capacity']) ? (int) $body['capacity'] : null;
        $registrationType = isset($body['registration_type']) ? trim((string) $body['registration_type']) : null;
        $eventType = isset($body['event_type']) ? trim((string) $body['event_type']) : null;

        if ($creatorId === 0 || $title === '' || $startTime === '' || $endTime === '') {
            http_response_code(422);
            return ['error' => 'creator_id, title, start_time, and end_time are required'];
        }

        return Event::create(
            $creatorId,
            $title,
            $description,
            $startTime,
            $endTime,
            $location,
            $capacity,
            $registrationType,
            $eventType
        );
    }

    public function destroy(int $eventId): array
    {
        if (!Event::delete($eventId)) {
            http_response_code(404);
            return ['error' => 'Event not found'];
        }

        return ['deleted' => true, 'event_id' => $eventId];
    }
}
