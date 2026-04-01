-- VibeCheck Database Schema
-- Creates all tables required by the application.

CREATE DATABASE IF NOT EXISTS vibecheck
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vibecheck;

-- -------------------------
-- Users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username   VARCHAR(64)  NOT NULL,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email    (email),
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Vibes
-- -------------------------
CREATE TABLE IF NOT EXISTS vibes (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    INT UNSIGNED NOT NULL,
    label      VARCHAR(128) NOT NULL COMMENT 'e.g. "Happy", "Anxious"',
    emoji      VARCHAR(8)   NOT NULL COMMENT 'Unicode emoji representing the vibe',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_vibes_user_id    (user_id),
    KEY idx_vibes_created_at (created_at),

    CONSTRAINT fk_vibes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Reactions
-- -------------------------
CREATE TABLE IF NOT EXISTS reactions (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    vibe_id    INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,
    emoji      VARCHAR(8)   NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_reactions_vibe_user (vibe_id, user_id),

    CONSTRAINT fk_reactions_vibe
        FOREIGN KEY (vibe_id) REFERENCES vibes (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reactions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
