# Tra cứu và tổng hợp văn bản

Frontend tra cứu văn bản (hỏi đáp có trích dẫn, báo cáo tổng hợp). Dữ liệu là mẫu chép từ PDF, chưa nối backend.

## Chạy

Cần Node.js 20.19+ hoặc 22.12+.

```sh
npm install
npm run dev      # http://127.0.0.1:5173
```

| Lệnh | Việc |
|---|---|
| `npm run build` | Đóng gói vào `dist/` (base `/NewTopia/`) |
| `npm run format` / `npm run lint` | Prettier / ESLint |
| `npm run check` | Kiểm tra hành vi bằng Playwright (cần dev server đang chạy) |

## Cấu trúc

- `src/components/`, `src/hooks/`: giao diện và hành vi.
- `src/lib/api.js`: `searchDocuments()`, chỗ nối backend.
- `src/lib/fixture.js`: dữ liệu mẫu (`src/data.js`) dạng object.
- `src/styles/tokens.css`: màu, font, bo góc, bóng.

Thiết kế: [DESIGN.md](DESIGN.md). Quy ước cho agent: [AGENTS.md](AGENTS.md).

## Nhúng GeoAgent

Mở với `?embed=1` hoặc đặt trong iframe. Trang gửi `{ type: 'van-ban/resize', height }` qua `postMessage` để khung chat chỉnh chiều cao. Đặt `VITE_GEOAGENT_ORIGIN` khi build.

## Triển khai

GitHub Pages: https://quanminhnguyen199.github.io/NewTopia/ (workflow `deploy.yml`, push lên `main`).
