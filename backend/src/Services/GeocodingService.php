<?php
declare(strict_types=1);

namespace VibeCheck\Services;

class GeocodingService
{
    public static function geocode(string $address): ?array
    {
        $apiKey = trim((string) getenv('POSITIONSTACK_API_KEY'));
        $query = trim($address);

        if ($apiKey === '' || $query === '') {
            return null;
        }

        $url = sprintf(
            'http://api.positionstack.com/v1/forward?access_key=%s&query=%s&limit=1',
            rawurlencode($apiKey),
            rawurlencode($query)
        );

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            return null;
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded) || !isset($decoded['data'][0])) {
            return null;
        }

        $firstMatch = $decoded['data'][0];
        $latitude = $firstMatch['latitude'] ?? null;
        $longitude = $firstMatch['longitude'] ?? null;

        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            return null;
        }

        return [
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
        ];
    }
}
