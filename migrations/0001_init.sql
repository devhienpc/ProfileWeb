-- ============================================================
-- Migration 0001: Initial schema + seed data
-- Apply: wrangler d1 migrations apply portfolio-db --local
--        wrangler d1 migrations apply portfolio-db --remote
-- ============================================================

-- ── profile (singleton) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  full_name   TEXT    NOT NULL,
  display_name TEXT   NOT NULL,
  badge       TEXT    NOT NULL DEFAULT '',
  location    TEXT    NOT NULL DEFAULT '',
  age         INTEGER NOT NULL DEFAULT 0,
  school      TEXT    NOT NULL DEFAULT '',
  major       TEXT    NOT NULL DEFAULT '',
  year_level  TEXT    NOT NULL DEFAULT '',
  birthday    TEXT    NOT NULL DEFAULT '',
  quote       TEXT    NOT NULL DEFAULT '',
  avatar_url  TEXT    NOT NULL DEFAULT '',
  cv_url      TEXT    NOT NULL DEFAULT '#'
);

-- ── socials ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS socials (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  platform   TEXT    NOT NULL,   -- github | linkedin | facebook | email | zalo
  url        TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ── skills ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  category   TEXT    NOT NULL,   -- language | tool
  name       TEXT    NOT NULL,
  icon_key   TEXT    NOT NULL DEFAULT '',
  color      TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ── projects ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  tech_tags   TEXT    NOT NULL DEFAULT '[]',  -- JSON array string
  icon_key    TEXT    NOT NULL DEFAULT '',    -- e.g. 'manga' | 'room' | ...
  repo_url    TEXT    NOT NULL DEFAULT '',
  demo_url    TEXT    NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_visible  INTEGER NOT NULL DEFAULT 1      -- 0 = hidden
);

-- ============================================================
-- SEED DATA (lấy từ nội dung web hiện tại)
-- ============================================================

-- Profile
INSERT OR IGNORE INTO profile (id, full_name, display_name, badge, location, age,
  school, major, year_level, birthday, quote, avatar_url, cv_url)
VALUES (1,
  'Trương Văn Hiền',
  'Truong Van Hien',
  'Third Year • Information Technology',
  'Khánh Hòa, Việt Nam',
  20,
  'Đại học Giao Thông Vận Tải TP.HCM (UTH)',
  'Công nghệ Thông tin',
  'Năm 3',
  '',
  'Học hỏi mỗi ngày, tiến gần hơn tới mục tiêu!',
  '',
  '#'
);

-- Socials
INSERT OR IGNORE INTO socials (platform, url, sort_order) VALUES
  ('github',   'https://github.com/devhienpc',     1),
  ('linkedin', '#',                                 2),
  ('facebook', '#',                                 3),
  ('email',    'mailto:hienpc@example.com',         4),
  ('zalo',     'https://zalo.me/0325855034',        5);

-- Skills – language
INSERT OR IGNORE INTO skills (category, name, icon_key, color, sort_order) VALUES
  ('language', 'C++',        'SiCplusplus', '#00599C', 1),
  ('language', 'Python',     'SiPython',    '#3776AB', 2),
  ('language', 'PHP',        'SiPhp',       '#777BB4', 3),
  ('language', 'JavaScript', 'SiJavascript','#F7DF1E', 4),
  ('language', 'SQL',        'SiMysql',     '#4479A1', 5);

-- Skills – tool
INSERT OR IGNORE INTO skills (category, name, icon_key, color, sort_order) VALUES
  ('tool', 'Git',     'SiGit',    '#F05032', 1),
  ('tool', 'GitHub',  'SiGithub', '#E6EDF3', 2),
  ('tool', 'VS Code', 'vscode',   '#007ACC', 3),
  ('tool', 'Linux',   'SiLinux',  '#FCC624', 4),
  ('tool', 'Docker',  'SiDocker', '#2496ED', 5);

-- Projects
INSERT OR IGNORE INTO projects (title, description, tech_tags, icon_key, repo_url, demo_url, sort_order, is_visible) VALUES
  (
    'Manga-Creation-Workflow-and-Publishing-Management-System',
    'Hệ thống quản lý quy trình tạo và xuất bản truyện tranh.',
    '["PHP","MySQL","JavaScript","Git"]',
    'manga',
    'https://github.com/devhienpc',
    '',
    1, 1
  ),
  (
    'Room Rental Management (Zalo Bot)',
    'Bot hỗ trợ tìm phòng trọ qua Zalo, tích hợp Google Sheets.',
    '["Google Apps Script","Zalo Bot","Google Sheets"]',
    'room',
    'https://github.com/devhienpc',
    '',
    2, 1
  ),
  (
    'Telegram Room Bot',
    'Bot quản lý phòng, tìm kiếm và xử lý dữ liệu qua Telegram.',
    '["Python","Telegram Bot","Google Sheets"]',
    'telegram',
    'https://github.com/devhienpc',
    '',
    3, 1
  ),
  (
    'Website Profile (Personal Portfolio)',
    'Website cá nhân giới thiệu bản thân, kỹ năng và dự án.',
    '["HTML","CSS","JavaScript"]',
    'portfolio',
    'https://github.com/devhienpc',
    '',
    4, 1
  ),
  (
    'Bài tập & Đồ án C++',
    'Các bài tập OOP, cấu trúc dữ liệu và thuật toán.',
    '["C++","OOP","DSA"]',
    'cpp',
    'https://github.com/devhienpc',
    '',
    5, 1
  );
