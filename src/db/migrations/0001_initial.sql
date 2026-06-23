CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  date INTEGER NOT NULL,
  tags TEXT,
  author TEXT,
  reading_time INTEGER,
  content TEXT NOT NULL,
  draft BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
