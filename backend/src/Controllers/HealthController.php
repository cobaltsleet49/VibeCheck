<?php
declare(strict_types=1);

namespace VibeCheck\Controllers;

class HealthController
{
    public function index(): array
    {
        return [
            'status' => 'ok',
            'timestamp' => date('c'),
        ];
    }
}
