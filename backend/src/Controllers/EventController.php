<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

use VibeCheck\Models\Event;
use VibeCheck\Models\User;

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

        $creatorName = trim((string) ($body['creator_name'] ?? ''));
        $creatorEmail = trim((string) ($body['creator_email'] ?? ''));
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $startTime = trim($body['start_time'] ?? '');
        $endTime = trim($body['end_time'] ?? '');
        $location = trim((string) ($body['location'] ?? ''));
        $capacityRaw = $body['capacity'] ?? null;
        $capacity = is_numeric($capacityRaw) ? (int) $capacityRaw : 0;
        $registrationType = trim((string) ($body['registration_type'] ?? ''));
        $eventType = trim((string) ($body['event_type'] ?? ''));

        if (
            $creatorName === '' ||
            $creatorEmail === '' ||
            $title === '' ||
            $description === '' ||
            $startTime === '' ||
            $endTime === '' ||
            $location === '' ||
            $capacity <= 0 ||
            $registrationType === '' ||
            $eventType === ''
        ) {
            http_response_code(422);
            return [
                'error' => 'creator_name, creator_email, title, description, start_time, end_time, location, capacity, registration_type, and event_type are required',
            ];
        }

        $creatorId = User::findOrCreateByEmail($creatorName, $creatorEmail);

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

    public function update(int $eventId): array
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $creatorName = trim((string) ($body['creator_name'] ?? ''));
        $creatorEmail = trim((string) ($body['creator_email'] ?? ''));
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $startTime = trim($body['start_time'] ?? '');
        $endTime = trim($body['end_time'] ?? '');
        $location = trim((string) ($body['location'] ?? ''));
        $capacityRaw = $body['capacity'] ?? null;
        $capacity = is_numeric($capacityRaw) ? (int) $capacityRaw : 0;
        $registrationType = trim((string) ($body['registration_type'] ?? ''));
        $eventType = trim((string) ($body['event_type'] ?? ''));

        if (
            $creatorName === '' ||
            $creatorEmail === '' ||
            $title === '' ||
            $description === '' ||
            $startTime === '' ||
            $endTime === '' ||
            $location === '' ||
            $capacity <= 0 ||
            $registrationType === '' ||
            $eventType === ''
        ) {
            http_response_code(422);
            return [
                'error' => 'creator_name, creator_email, title, description, start_time, end_time, location, capacity, registration_type, and event_type are required',
            ];
        }

        $creatorId = User::findOrCreateByEmail($creatorName, $creatorEmail);
        $updated = Event::update(
            $eventId,
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

        if ($updated === false) {
            http_response_code(404);
            return ['error' => 'Event not found'];
        }

        return $updated;
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
