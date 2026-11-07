CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL
);
