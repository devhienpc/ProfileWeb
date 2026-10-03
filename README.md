# Trương Văn Hiền - Personal Portfolio Website 🚀

Website portfolio cá nhân được xây dựng với kiến trúc hiện đại, giao diện Glassmorphism chủ đề bầu trời đêm sao (Starry Night), tích hợp Cloudflare D1 Database và hệ thống Serverless Pages Functions.

![Portfolio Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20%26%20D1-orange?logo=cloudflare)
![Motion](https://img.shields.io/badge/Motion-React-purple)

---

## ✨ Tính Năng Nổi Bật

### 1. Giao diện & Hiệu ứng (Frontend Design)
- **Glassmorphism Theme**: Nền thẻ trong suốt `backdrop-filter: blur`, viền mảnh ánh sáng gradient, tối ưu tương phản trên cả Dark mode và Light mode.
- **Bầu trời đêm sao động (`AnimatedBackground`)**:
  - Mặt trăng lớn ở góc trên với các hố mờ, hiệu ứng thở ánh sáng (glow pulse), mây mỏng trôi ngang và parallax theo chuyển động chuột.
  - Canvas hàng trăm ngôi sao lấp lánh, sao băng rực rỡ và hạt bụi sáng chuyển động lơ lửng.
- **Bảng ghi chú (Corkboard / Sticky Notes)**:
  - Khách ghé thăm có thể để lại lời chúc dưới dạng giấy dán note pastel (Vàng, Hồng, Xanh, Tím) kèm ghim tròn 3D và font chữ viết tay tiếng Việt.
  - Hỗ trợ **kéo thả vị trí (drag-and-drop)** lưu theo phần trăm responsive.
  - **Phân quyền sở hữu**: Khách chỉ có thể kéo và xoá note của chính mình thông qua `edit_token` lưu trong `localStorage`.
  - Nút **Phóng to / Thu nhỏ** toàn màn hình tiện lợi.
- **Bảo vệ chống spam**: Giới hạn tần suất IP (3 note/giờ, 10 note/ngày), Honeypot ẩn chặn bot, lọc URL/liên kết và lọc từ ngữ không phù hợp.

### 2. Backend & Cơ sở dữ liệu (Cloudflare Pages Functions + D1)
- **Cơ sở dữ liệu Cloudflare D1 (SQLite Edge)**:
  - `profile`: Thông tin cá nhân, chức danh, trường học, giới thiệu.
  - `socials`: Danh sách mạng xã hội và liên kết.
  - `skills`: Phân loại ngôn ngữ lập trình và công cụ.
  - `projects`: Dự án cá nhân, danh sách tech tags, icon, link GitHub và Demo.
  - `notes`: Lưu trữ ghi chú khách ghé thăm, mã hóa SHA-256 IP và edit token.
- **Cloudflare Pages Functions API (`/functions/api/`)**:
  - `GET /api/profile`: API công khai trả về toàn bộ dữ liệu kèm cache.
  - `GET /api/notes`, `POST /api/notes`, `PATCH /api/notes/:id`, `DELETE /api/notes/:id`.
  - `POST /api/admin/login`: Đăng nhập admin với cookie bảo mật `HttpOnly`, mã hóa HMAC-SHA256 và chống brute-force.

### 3. Trang Quản trị (Admin Panel - `/admin.html`)
- Giao diện Admin quản lý độc lập với noindex:
  - **Hồ sơ**: Chỉnh sửa thông tin cá nhân và câu châm ngôn.
  - **Mạng xã hội**: Quản lý liên kết mạng xã hội.
  - **Kỹ năng**: Thêm, sửa, xoá các kỹ năng và màu sắc nhận diện.
  - **Dự án**: Thêm mới, chỉnh sửa, đổi thứ tự hiển thị (lên/xuống), bật/tắt hiển thị ẩn/hiện dự án.
  - **Ghi chú**: Quản lý tất cả ghi chú của khách, duyệt ẩn/hiện và xoá vĩnh viễn.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Vite, Motion (`motion/react`), Lucide React.
- **Backend**: Cloudflare Pages Functions, Cloudflare D1 Database (Serverless SQLite).
- **Styling**: Vanilla CSS tokens + Glassmorphism, Google Fonts (`Inter`, `Caveat`, `Patrick Hand`).
- **Tooling**: Wrangler CLI, Oxlint.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ (Local)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.dev.vars` ở thư mục gốc (không commit lên git):
```env
ADMIN_PASSWORD=your_admin_password_here
ADMIN_SECRET=your_super_secret_hmac_key_here
```

### 3. Khởi tạo Database D1 Local
Chạy các file migration để khởi tạo bảng và dữ liệu mẫu vào D1 local:
```bash
npx wrangler d1 migrations apply portfolio-db --local
```

### 4. Chạy server phát triển
- Chạy Vite dev server thông thường:
  ```bash
  npm run dev
  ```
- Hoặc chạy đầy đủ kèm Cloudflare Pages Functions & D1 Local:
  ```bash
  npm run pages:dev
  ```
  Truy cập:
  - Trang chủ: `http://localhost:8788/`
  - Trang quản trị: `http://localhost:8788/admin.html`

---

## 📦 Đóng Gói (Build) & Triển Khai (Deploy)

### Build dự án
```bash
npm run build
```

### Triển khai lên Cloudflare Pages
1. Tạo database D1 trên Cloudflare:
   ```bash
   npx wrangler d1 create portfolio-db
   ```
2. Cập nhật `database_id` vào file `wrangler.toml`.
3. Chạy migration lên Cloudflare D1 remote:
   ```bash
   npx wrangler d1 migrations apply portfolio-db --remote
   ```
4. Thiết lập biến môi trường `ADMIN_PASSWORD` và `ADMIN_SECRET` trên Cloudflare Pages Settings.
5. Deploy:
   ```bash
   npx wrangler pages deploy dist
   ```

---

## 👤 Tác Giả

**Trương Văn Hiền**
- Sinh viên Công nghệ Thông tin - Trường Đại học Giao Thông Vận Tải TP.HCM (UTH)
- GitHub: [@devhienpc](https://github.com/devhienpc)
