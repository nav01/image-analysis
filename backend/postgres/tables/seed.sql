BEGIN TRANSACTION;

INSERT INTO users (name, email, entries, joined) VALUES ('nav', 'nav@gmail.com', 1, '2018-9-20');
INSERT INTO login (hash, email) VALUES ('$2a$10$PlCJAOrZUG8QugDdffkqsuT9nPokH9/.LAy/d/55NtWzWKNsumaU2', 'nav@gmail.com');

COMMIT;
