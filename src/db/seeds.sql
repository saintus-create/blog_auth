INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at)
VALUES ('admin-001', 'admin', 'admin@example.com', '$2b$10$dummy.hash.for.development', 'admin', strftime('%s', 'now') * 1000);
