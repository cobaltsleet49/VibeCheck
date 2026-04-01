<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

use VibeCheck\Models\User;

class UserController
{
    public function index(): array
    {
        return User::all();
    }

    public function show(int $userId): array
    {
        $user = User::find($userId);
        if ($user === false) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }

        return $user;
    }

    public function store(): array
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');

        if ($name === '' || $email === '') {
            http_response_code(422);
            return ['error' => 'name and email are required'];
        }

        return User::create($name, $email);
    }

    public function destroy(int $userId): array
    {
        if (!User::delete($userId)) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }

        return ['deleted' => true, 'user_id' => $userId];
    }
}
