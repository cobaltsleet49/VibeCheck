<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

use VibeCheck\Models\EventRegistration;

class EventRegistrationController
{
    public function index(): array
    {
        return EventRegistration::all();
    }

    public function show(int $regId): array
    {
        $registration = EventRegistration::find($regId);
        if ($registration === false) {
            http_response_code(404);
            return ['error' => 'Registration not found'];
        }

        return $registration;
    }

    public function store(): array
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $userId = (int) ($body['user_id'] ?? 0);
        $eventId = (int) ($body['event_id'] ?? 0);
        $status = trim($body['status'] ?? '');

        if ($userId === 0 || $eventId === 0 || $status === '') {
            http_response_code(422);
            return ['error' => 'user_id, event_id, and status are required'];
        }

        return EventRegistration::create($userId, $eventId, $status);
    }

    public function destroy(int $regId): array
    {
        if (!EventRegistration::delete($regId)) {
            http_response_code(404);
            return ['error' => 'Registration not found'];
        }

        return ['deleted' => true, 'reg_id' => $regId];
    }
}
