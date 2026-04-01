-- VibeCheck Seed Data
-- Populates the database with sample users and vibes for development.

USE vibecheck;

-- Sample users (passwords are bcrypt of "password")
INSERT INTO users (username, email, password) VALUES
    ('alice',   'alice@example.com',   '$2y$12$exampleHashForAlice000000000000000000000000000000000'),
    ('bob',     'bob@example.com',     '$2y$12$exampleHashForBob0000000000000000000000000000000000'),
    ('charlie', 'charlie@example.com', '$2y$12$exampleHashForCharlie0000000000000000000000000000000');

-- Sample vibes
INSERT INTO vibes (user_id, label, emoji) VALUES
    (1, 'Happy',    '😊'),
    (1, 'Excited',  '🎉'),
    (2, 'Chill',    '😎'),
    (2, 'Anxious',  '😬'),
    (3, 'Grateful', '🙏');

-- Sample reactions
INSERT INTO reactions (vibe_id, user_id, emoji) VALUES
    (1, 2, '❤️'),
    (1, 3, '🔥'),
    (2, 2, '🎉'),
    (3, 1, '😎'),
    (4, 3, '🤗');
