USE vibecheck;

DELETE FROM event_waitlist;
DELETE FROM event_registrations;
DELETE FROM events;
DELETE FROM users;

ALTER TABLE event_waitlist AUTO_INCREMENT = 1;
ALTER TABLE event_registrations AUTO_INCREMENT = 1;
ALTER TABLE events AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;


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
    latitude,
    longitude,
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
        29.63606305,
        -82.35474462,
        80,
        'Public',
        'Study Group'
    ),
    (
        2,
        'Sunset Yoga Session',
        'Guided yoga session for all levels at sunset.',
        '2026-04-20 18:30:00',
        '2026-04-20 19:30:00',
        'South Lawn',
        29.57000958,
        -82.31799321,
        40,
        'RSVP',
        'Mixer'
    ),
    (
        3,
        'Intramural Soccer',
        'Pickup-style league night; bring shin guards and water. Teams formed on the field.',
        '2026-04-22 19:00:00',
        '2026-04-22 21:00:00',
        'Southwest Recreation Center',
        29.64704773,
        -82.31264643,
        22,
        'Public',
        'Club Meeting'
    ),
    (
        1,
        'Friendship Bracelet Making',
        'Coffee shop vibes with beads, string, and patterns for beginners. Supplies provided while they last.',
        '2026-04-24 15:00:00',
        '2026-04-24 17:00:00',
        'Marston Makerspace',
        29.64305445,
        -82.32744660,
        25,
        'RSVP',
        'Mixer'
    ),
    (
        2,
        'Tote Bag Workshop',
        'Screen-print and decorate your own tote; wear clothes you can get paint on.',
        '2026-04-26 11:00:00',
        '2026-04-26 14:00:00',
        'Plaza of the Americas',
        29.61305786,
        -82.25968161,
        30,
        'RSVP',
        'Professional Development'
    ),
    (
        3,
        'Slacklining at the Plaza',
        'Learn balance on a slackline with crash pads; helmets optional. Hosted by the outdoor rec club.',
        '2026-04-27 16:00:00',
        '2026-04-27 18:00:00',
        'Plaza of the Americas',
        29.66503271,
        -82.33359495,
        20,
        'Public',
        'Other'
    ),
    (
        1,
        'End of Year Party',
        'DJ, photo booth, and light snacks. Campus ID required at the door.',
        '2026-05-02 20:00:00',
        '2026-05-02 23:00:00',
        'J. Wayne Reitz Union Grand Ballroom',
        29.71005638,
        -82.35047690,
        500,
        'RSVP',
        'Party'
    ),
    (
        2,
        'Chinese Potluck',
        'Bring a dish to share (label ingredients). Vegetarian table in the back corner.',
        '2026-04-28 18:00:00',
        '2026-04-28 21:00:00',
        'Matherly Hall Room 300',
        29.63188883,
        -82.37156420,
        45,
        'Public',
        'Mixer'
    ),
    (
        3,
        'Casual Coding',
        'Open laptops, soft background playlist, and peer help on side projects or homework.',
        '2026-04-25 14:00:00',
        '2026-04-25 17:00:00',
        'CISE Building Room A101',
        29.65333953,
        -82.30205057,
        35,
        'Public',
        'Study Group'
    ),
    (
        1,
        'Math Tutoring (Calc & Linear)',
        'Peer tutors on rotation; sign-in sheet at the door. No appointment needed.',
        '2026-04-23 16:00:00',
        '2026-04-23 18:00:00',
        'Little Hall Room 109',
        29.65737481,
        -82.32689551,
        15,
        'Public',
        'Study Group'
    ),
    (
        2,
        'Sarah''s Birthday Bash',
        'Cake at eight; BYOB snacks. Gift table optional—Sarah prefers handwritten cards.',
        '2026-05-10 19:00:00',
        '2026-05-10 22:00:00',
        'Broward Hall',
        29.62332451,
        -82.35394312,
        40,
        'RSVP',
        'Party'
    ),
    (
        3,
        'Adriana''s Sign Night',
        'Poster boards, markers, glitter glue, and mock election booth selfies. Theme: semester survival.',
        '2026-05-08 19:00:00',
        '2026-05-08 21:00:00',
        'Hume Hall',
        29.67040955,
        -82.23865365,
        50,
        'RSVP',
        'Club Meeting'
    ),
    (
        1,
        'Pickup Basketball',
        'Full court if numbers allow; call next on the sideline. BYO ball optional.',
        '2026-04-21 18:00:00',
        '2026-04-21 20:00:00',
        'Flavet Field',
        29.66197968,
        -82.38552831,
        24,
        'Public',
        'Other'
    ),
    (
        2,
        'Pickleball Open Play',
        'Rotating partners; paddles available to borrow. Tennis shoes strongly recommended.',
        '2026-04-29 17:00:00',
        '2026-04-29 19:00:00',
        'Southwest Recreation Center Pickleball Courts',
        29.66074210,
        -82.32263983,
        16,
        'Public',
        'Other'
    );

INSERT INTO event_registrations (user_id, event_id, status) VALUES
    (1, 1, 'registered'),
    (2, 1, 'registered'),
    (1, 2, 'registered'),
    (3, 2, 'registered');

INSERT INTO event_waitlist (user_id, event_id) VALUES
    (3, 1);
