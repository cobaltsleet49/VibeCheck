<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

use VibeCheck\Models\Vibe;

class VibeController
{
    public function index(): array
    {
        return Vibe::all();
    }

    public function store(): array
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $label   = trim($body['label'] ?? '');
        $emoji   = trim($body['emoji'] ?? '');
        $userId  = (int) ($body['user_id'] ?? 0);

        if ($label === '' || $emoji === '' || $userId === 0) {
            http_response_code(422);
            return ['error' => 'label, emoji, and user_id are required'];
        }

        return Vibe::create($label, $emoji, $userId);
    }
}
