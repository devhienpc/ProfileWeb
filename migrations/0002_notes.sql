-- ============================================================
-- Migration 0002: Bảng ghi chú (Corkboard / Sticky notes)
-- ============================================================

CREATE TABLE IF NOT EXISTS notes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name     TEXT    NOT NULL,
  content         TEXT    NOT NULL,
  color           TEXT    NOT NULL DEFAULT 'yellow',  -- yellow | pink | blue | purple
  x_percent       REAL    NOT NULL DEFAULT 50,        -- vị trí x (0 - 100%)
  y_percent       REAL    NOT NULL DEFAULT 50,        -- vị trí y (0 - 100%)
  rotation        REAL    NOT NULL DEFAULT 0,         -- góc nghiêng (-6 đến 6 độ)
  edit_token_hash TEXT    NOT NULL,                   -- SHA-256 của edit_token
  ip_hash         TEXT    NOT NULL,                   -- SHA-256 của IP (không lưu IP thô)
  is_hidden       INTEGER NOT NULL DEFAULT 0,         -- 0 = hiển thị, 1 = ẩn
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_ip_hash ON notes(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_notes_visible ON notes(is_hidden, created_at);

-- Dữ liệu seed mẫu ban đầu để bảng ghi chú sống động ngay khi mở
INSERT OR IGNORE INTO notes (id, author_name, content, color, x_percent, y_percent, rotation, edit_token_hash, ip_hash, is_hidden, created_at)
VALUES
  (1, 'Huyền Trang', 'Portfolio đẹp và mượt mà quá! Chúc bạn đạt được nhiều thành công hơn nữa nha ✨', 'yellow', 12, 10, -3.2, 'seed_token_hash_1', 'seed_ip_hash_1', 0, datetime('now', '-3 days')),
  (2, 'Minh Khoa', 'Thiết kế theme đêm sao với mặt trăng nhìn cuốn thật sự, animation rất mượt 🌙🚀', 'blue', 55, 32, 2.8, 'seed_token_hash_2', 'seed_ip_hash_2', 0, datetime('now', '-1 days')),
  (3, 'Anh Quân (K20)', 'Chúc Hiền năm 3 gặt hái nhiều kết quả tốt và đồ án xịn sò nhé! 🎓🔥', 'pink', 18, 58, -1.5, 'seed_token_hash_3', 'seed_ip_hash_3', 0, datetime('now', '-5 hours')),
  (4, 'Thảo Nhi', 'Ghé thăm portfolio thấy ấn tượng ghê, UI sang và có phong cách riêng lắm! 👏', 'purple', 50, 75, 3.5, 'seed_token_hash_4', 'seed_ip_hash_4', 0, datetime('now', '-30 minutes'));
