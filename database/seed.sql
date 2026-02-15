-- Clear existing data
TRUNCATE TABLE posts CASCADE;

TRUNCATE TABLE users CASCADE;

-- Insert test users (change "password" to "password_hash")
INSERT INTO
    users (username, email, password_hash)
VALUES
    (
        'john_doe',
        'john@test.com',
        '$2b$10$abcdefghijklmnopqrstuvwxyz123456789'
    ),
    (
        'jane_smith',
        'jane@test.com',
        '$2b$10$abcdefghijklmnopqrstuvwxyz123456789'
    ),
    (
        'test_user',
        'test@test.com',
        '$2b$10$abcdefghijklmnopqrstuvwxyz123456789'
    );

-- Insert test posts (now users exist, so this will work)
INSERT INTO
    posts (user_id, title, content)
VALUES
    (1, 'First Post', 'This is John''s first post'),
    (1, 'Second Post', 'Another post by John'),
    (2, 'Jane''s Post', 'Hello from Jane!'),
    (3, 'Test Post', 'Testing the blog API');