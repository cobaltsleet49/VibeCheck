USE vibecheck;

DELETE FROM event_registrations;
DELETE FROM events;
DELETE FROM users;


INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com');

INSERT INTO events (
    creator_id,
    title,
    description,
    start_time,
    end_time,
    location,
    capacity,
    registration_type,
    event_type
) VALUES
    (
        1,
        'Campus Coding Night',
        'An evening of collaborative coding and project demos.',
        '2026-04-15 18:00:00',
        '2026-04-15 21:00:00',
        'Engineering Building Room 210',
        80,
        'Open',
        'Tech'
    ),
    (
        2,
        'Sunset Yoga Session',
        'Guided yoga session for all levels at sunset.',
        '2026-04-20 18:30:00',
        '2026-04-20 19:30:00',
        'South Lawn',
        40,
        'Approval',
        'Wellness'
    );

INSERT INTO event_registrations (user_id, event_id, status) VALUES
    (1, 1, 'registered'),
    (2, 1, 'registered'),
    (3, 1, 'waitlisted'),
    (1, 2, 'registered'),
    (3, 2, 'registered');
