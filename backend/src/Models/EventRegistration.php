<?php
declare(strict_types=1);

namespace VibeCheck\Models;

use VibeCheck\Services\Database;
use Throwable;

class EventRegistration
{
    private const ACTIVE_STATUSES = ['registered', 'confirmed', 'approved'];
    private const CANCELLED_STATUSES = ['cancelled', 'canceled'];

    public static function all(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            "SELECT records.reg_id,
                    records.user_id,
                    u.name AS user_name,
                    records.event_id,
                    e.title AS event_title,
                    records.registration_time,
                    records.status,
                      records.record_type,
                      records.waitlist_position
             FROM (
                 SELECT er.reg_id,
                        er.user_id,
                        er.event_id,
                        er.registration_time,
                        er.status,
                       'registration' AS record_type,
                       NULL AS waitlist_position
                 FROM event_registrations er

                 UNION ALL

                 SELECT -ew.waitlist_id AS reg_id,
                        ew.user_id,
                        ew.event_id,
                        ew.waitlist_time AS registration_time,
                        'waitlisted' AS status,
                        'waitlist' AS record_type,
                        (
                            SELECT COUNT(*)
                            FROM event_waitlist prior
                            WHERE prior.event_id = ew.event_id
                              AND (
                                  prior.waitlist_time < ew.waitlist_time
                                  OR (
                                      prior.waitlist_time = ew.waitlist_time
                                      AND prior.waitlist_id <= ew.waitlist_id
                                  )
                              )
                        ) AS waitlist_position
                 FROM event_waitlist ew
             ) records
             JOIN users u ON u.user_id = records.user_id
             JOIN events e ON e.event_id = records.event_id
             ORDER BY records.registration_time DESC"
        );

        return $stmt->fetchAll();
    }

    public static function create(int $userId, int $eventId, string $status): array
    {
        $normalizedStatus = self::normalizeStatus($status);
        $pdo = Database::connection();
        $pdo->beginTransaction();

        try {
            if (self::isWaitlistStatus($normalizedStatus)) {
                $waitlisted = self::upsertWaitlist($userId, $eventId);
                self::deleteRegistrationByUserEvent($userId, $eventId);
                $pdo->commit();
                return $waitlisted;
            }

            if (self::isActiveStatus($normalizedStatus) && self::eventAtCapacity($eventId)) {
                $waitlisted = self::upsertWaitlist($userId, $eventId);
                self::deleteRegistrationByUserEvent($userId, $eventId);
                $pdo->commit();
                return $waitlisted;
            }

            $stmt = $pdo->prepare(
                'INSERT INTO event_registrations (user_id, event_id, status)
                 VALUES (:user_id, :event_id, :status)
                 ON DUPLICATE KEY UPDATE
                    status = VALUES(status),
                    registration_time = CURRENT_TIMESTAMP'
            );
            $stmt->execute([
                ':user_id' => $userId,
                ':event_id' => $eventId,
                ':status' => $normalizedStatus,
            ]);

            self::deleteWaitlistByUserEvent($userId, $eventId);
            $registration = self::findRegistrationByUserEvent($userId, $eventId);

            if ($registration === false) {
                throw new \RuntimeException('Unable to load saved registration.');
            }

            $pdo->commit();
            return $registration;
        } catch (Throwable $throwable) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $throwable;
        }
    }

    public static function updateStatus(int $regId, string $status): array|false
    {
        $normalizedStatus = self::normalizeStatus($status);

        if ($regId < 0) {
            return self::updateWaitlistStatus(abs($regId), $normalizedStatus);
        }

        $pdo = Database::connection();
        $pdo->beginTransaction();

        try {
            $existing = self::findRegistrationRow($regId);
            if ($existing === false) {
                $pdo->rollBack();
                return false;
            }

            $userId = (int) $existing['user_id'];
            $eventId = (int) $existing['event_id'];
            $previousStatus = self::normalizeStatus((string) ($existing['status'] ?? ''));
            $wasActive = self::isActiveStatus($previousStatus);

            if (self::isWaitlistStatus($normalizedStatus)) {
                self::deleteRegistrationById($regId);
                $waitlisted = self::upsertWaitlist($userId, $eventId);
                $pdo->commit();
                return $waitlisted;
            }

            if (self::isActiveStatus($normalizedStatus) && self::eventAtCapacity($eventId, $regId)) {
                self::deleteRegistrationById($regId);
                $waitlisted = self::upsertWaitlist($userId, $eventId);
                $pdo->commit();
                return $waitlisted;
            }

            $stmt = $pdo->prepare(
                'UPDATE event_registrations
                 SET status = :status
                 WHERE reg_id = :reg_id'
            );
            $stmt->execute([
                ':status' => $normalizedStatus,
                ':reg_id' => $regId,
            ]);

            if (self::isActiveStatus($normalizedStatus)) {
                self::deleteWaitlistByUserEvent($userId, $eventId);
            }

            // If an active seat is released (e.g., cancelled), promote next waitlisted user.
            if ($wasActive && !self::isActiveStatus($normalizedStatus)) {
                self::promoteNextWaitlistedUser($eventId);
            }

            $updatedRegistration = self::find($regId);
            $pdo->commit();

            return $updatedRegistration;
        } catch (Throwable $throwable) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $throwable;
        }
    }

    public static function find(int $regId): array|false
    {
        if ($regId < 0) {
            return self::findWaitlistRow(abs($regId));
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT er.reg_id, er.user_id, u.name AS user_name,
                    er.event_id, e.title AS event_title,
                    er.registration_time, er.status,
                    \'registration\' AS record_type
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
        if ($regId < 0) {
            return self::deleteWaitlistById(abs($regId));
        }

        $pdo = Database::connection();
        $pdo->beginTransaction();

        try {
            $existing = self::findRegistrationRow($regId);
            if ($existing === false) {
                $pdo->rollBack();
                return false;
            }

            $eventId = (int) $existing['event_id'];
            $deletedStatus = self::normalizeStatus((string) ($existing['status'] ?? ''));

            $stmt = $pdo->prepare('DELETE FROM event_registrations WHERE reg_id = :reg_id');
            $stmt->execute([':reg_id' => $regId]);

            $deleted = $stmt->rowCount() > 0;
            if ($deleted && self::isActiveStatus($deletedStatus)) {
                self::promoteNextWaitlistedUser($eventId);
            }

            $pdo->commit();
            return $deleted;
        } catch (Throwable $throwable) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            throw $throwable;
        }
    }

    private static function normalizeStatus(string $status): string
    {
        return strtolower(trim($status));
    }

    private static function isCancelledStatus(string $status): bool
    {
        return in_array($status, self::CANCELLED_STATUSES, true);
    }

    private static function updateWaitlistStatus(int $waitlistId, string $normalizedStatus): array|false
    {
        $waitlistEntry = self::findWaitlistRow($waitlistId);
        if ($waitlistEntry === false) {
            return false;
        }

        if (self::isCancelledStatus($normalizedStatus)) {
            self::deleteWaitlistById($waitlistId);
            $waitlistEntry['status'] = 'cancelled';
            return $waitlistEntry;
        }

        if (self::isWaitlistStatus($normalizedStatus)) {
            return $waitlistEntry;
        }

        return false;
    }

    private static function isWaitlistStatus(string $status): bool
    {
        return in_array($status, ['waitlisted', 'waitlist'], true);
    }

    private static function isActiveStatus(string $status): bool
    {
        return in_array($status, self::ACTIVE_STATUSES, true);
    }

    private static function eventAtCapacity(int $eventId, ?int $excludeRegId = null): bool
    {
        $capacity = Event::capacityFor($eventId);
        if ($capacity === null) {
            return false;
        }

        $activeCount = self::activeRegistrationCount($eventId, $excludeRegId);
        return $activeCount >= $capacity;
    }

    private static function activeRegistrationCount(int $eventId, ?int $excludeRegId = null): int
    {
        $pdo = Database::connection();
        $query =
            "SELECT COUNT(*) AS total
             FROM event_registrations
             WHERE event_id = :event_id
               AND LOWER(status) IN ('registered', 'confirmed', 'approved')";

        $params = [':event_id' => $eventId];
        if ($excludeRegId !== null) {
            $query .= ' AND reg_id <> :exclude_reg_id';
            $params[':exclude_reg_id'] = $excludeRegId;
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $row = $stmt->fetch();
        return (int) ($row['total'] ?? 0);
    }

    private static function upsertWaitlist(int $userId, int $eventId): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO event_waitlist (user_id, event_id)
             VALUES (:user_id, :event_id)
             ON DUPLICATE KEY UPDATE waitlist_time = CURRENT_TIMESTAMP'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
        ]);

        $waitlisted = self::findWaitlistByUserEvent($userId, $eventId);
        if ($waitlisted === false) {
            throw new \RuntimeException('Unable to load waitlist entry.');
        }

        return $waitlisted;
    }

    private static function findRegistrationByUserEvent(int $userId, int $eventId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT reg_id, user_id, event_id, registration_time, status
             FROM event_registrations
             WHERE user_id = :user_id AND event_id = :event_id
             LIMIT 1'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
        ]);

        return $stmt->fetch();
    }

    private static function findWaitlistByUserEvent(int $userId, int $eventId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT -ew.waitlist_id AS reg_id,
                    ew.user_id,
                    u.name AS user_name,
                    ew.event_id,
                    e.title AS event_title,
                    ew.waitlist_time AS registration_time,
                    \'waitlisted\' AS status,
                    \'waitlist\' AS record_type,
                    (
                        SELECT COUNT(*)
                        FROM event_waitlist prior
                        WHERE prior.event_id = ew.event_id
                          AND (
                              prior.waitlist_time < ew.waitlist_time
                              OR (
                                  prior.waitlist_time = ew.waitlist_time
                                  AND prior.waitlist_id <= ew.waitlist_id
                              )
                          )
                    ) AS waitlist_position
             FROM event_waitlist ew
             JOIN users u ON u.user_id = ew.user_id
             JOIN events e ON e.event_id = ew.event_id
             WHERE ew.user_id = :user_id AND ew.event_id = :event_id
             LIMIT 1'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
        ]);

        return $stmt->fetch();
    }

    private static function findRegistrationRow(int $regId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT reg_id, user_id, event_id, registration_time, status
             FROM event_registrations
             WHERE reg_id = :reg_id
             LIMIT 1'
        );
        $stmt->execute([':reg_id' => $regId]);

        return $stmt->fetch();
    }

    private static function findWaitlistRow(int $waitlistId): array|false
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT -ew.waitlist_id AS reg_id,
                    ew.user_id,
                    u.name AS user_name,
                    ew.event_id,
                    e.title AS event_title,
                    ew.waitlist_time AS registration_time,
                    \'waitlisted\' AS status,
                    \'waitlist\' AS record_type,
                    (
                        SELECT COUNT(*)
                        FROM event_waitlist prior
                        WHERE prior.event_id = ew.event_id
                          AND (
                              prior.waitlist_time < ew.waitlist_time
                              OR (
                                  prior.waitlist_time = ew.waitlist_time
                                  AND prior.waitlist_id <= ew.waitlist_id
                              )
                          )
                    ) AS waitlist_position
             FROM event_waitlist ew
             JOIN users u ON u.user_id = ew.user_id
             JOIN events e ON e.event_id = ew.event_id
             WHERE ew.waitlist_id = :waitlist_id
             LIMIT 1'
        );
        $stmt->execute([':waitlist_id' => $waitlistId]);

        return $stmt->fetch();
    }

    private static function deleteRegistrationByUserEvent(int $userId, int $eventId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'DELETE FROM event_registrations
             WHERE user_id = :user_id AND event_id = :event_id'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
        ]);
    }

    private static function deleteRegistrationById(int $regId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM event_registrations WHERE reg_id = :reg_id');
        $stmt->execute([':reg_id' => $regId]);
    }

    private static function deleteWaitlistByUserEvent(int $userId, int $eventId): void
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'DELETE FROM event_waitlist
             WHERE user_id = :user_id AND event_id = :event_id'
        );
        $stmt->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
        ]);
    }

    private static function deleteWaitlistById(int $waitlistId): bool
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('DELETE FROM event_waitlist WHERE waitlist_id = :waitlist_id');
        $stmt->execute([':waitlist_id' => $waitlistId]);

        return $stmt->rowCount() > 0;
    }

    private static function promoteNextWaitlistedUser(int $eventId): void
    {
        if (self::eventAtCapacity($eventId)) {
            return;
        }

        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'SELECT waitlist_id, user_id, event_id
             FROM event_waitlist
             WHERE event_id = :event_id
             ORDER BY waitlist_time ASC, waitlist_id ASC
             LIMIT 1'
        );
        $stmt->execute([':event_id' => $eventId]);
        $nextWaitlisted = $stmt->fetch();

        if ($nextWaitlisted === false) {
            return;
        }

        $userId = (int) $nextWaitlisted['user_id'];
        $waitlistId = (int) $nextWaitlisted['waitlist_id'];

        $insert = $pdo->prepare(
            'INSERT INTO event_registrations (user_id, event_id, status)
             VALUES (:user_id, :event_id, :status)
             ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                registration_time = CURRENT_TIMESTAMP'
        );
        $insert->execute([
            ':user_id' => $userId,
            ':event_id' => $eventId,
            ':status' => 'registered',
        ]);

        self::deleteWaitlistById($waitlistId);
    }
}
