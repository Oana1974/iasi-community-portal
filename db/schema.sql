PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS areas;

CREATE TABLE areas (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT,
  is_featured INTEGER DEFAULT 0,
  image TEXT
);

CREATE TABLE faqs (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  date_submitted TEXT DEFAULT (datetime('now'))
);
