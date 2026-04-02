CREATE DATABASE IF NOT EXISTS vibecheck
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vibecheck;

CREATE TABLE IF NOT EXISTS users (
    user_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
    event_id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    creator_id          INT UNSIGNED NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    start_time          TIMESTAMP    NOT NULL,
    end_time            TIMESTAMP    NOT NULL,
    location            VARCHAR(255),
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    capacity            INT,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registration_type   VARCHAR(50),
    event_type          VARCHAR(50),

    PRIMARY KEY (event_id),
    KEY idx_events_creator_id (creator_id),
    CONSTRAINT fk_events_creator
        FOREIGN KEY (creator_id) REFERENCES users (user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_registrations (
    reg_id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id              INT UNSIGNED NOT NULL,
    event_id             INT UNSIGNED NOT NULL,
    registration_time    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status               VARCHAR(50)  NOT NULL,

    PRIMARY KEY (reg_id),
    UNIQUE KEY uq_event_registrations_user_event (user_id, event_id),
    KEY idx_event_registrations_event_id (event_id),

    CONSTRAINT fk_event_registrations_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_event_registrations_event
        FOREIGN KEY (event_id) REFERENCES events (event_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
