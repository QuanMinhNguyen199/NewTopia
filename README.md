# Tra cứu và tổng hợp văn bản

Giao diện React tra cứu văn bản tiếng Việt cho lãnh đạo thành phố: hỏi đáp có trích dẫn nguồn và báo cáo tổng hợp. Chạy trên máy tính, máy tính bảng, điện thoại, và nhúng được vào khung chat GeoAgent.

> **Đây là bản frontend.** Chưa kết nối Keycloak, Adapter phân quyền, kho văn bản hay LLM. Mọi nội dung là dữ liệu mẫu chép từ PDF (`src/data.js`), không phải kết quả tra cứu thật. Câu hỏi mới chỉ lọc lại dữ liệu mẫu; câu trả lời không thay đổi.

## Chạy cục bộ

Cần Node.js 20.19+ hoặc 22.12+ (yêu cầu của Vite 8).

```sh
npm install
npm run dev
```

Mở http://127.0.0.1:5173.

| Lệnh | Việc |
|---|---|
| `npm run dev` | Dev server ở cổng 5173 |
| `npm run build` | Đóng gói vào `dist/` (base `/NewTopia/`) |
| `npm run preview` | Chạy thử bản đã build |
| `npm run format` | Định dạng code bằng Prettier |
| `npm run lint` | Kiểm tra code bằng ESLint |
| `npm run check` | Kiểm tra hành vi bằng Playwright (cần dev server đang chạy) |

Trước khi gửi thay đổi: `npm run format`, `npm run lint`, `npm run build`, rồi `npm run check`.

## Cấu trúc

```
src/
  main.jsx            Điểm vào: nạp font, CSS, render App
  App.jsx             Ghép các phần, giữ state dùng chung
  components/         Thanh câu hỏi, form sửa, ô Hỏi tiếp, câu trả lời, bằng chứng, hộp văn bản…
  hooks/              Sửa câu hỏi, cột/panel bằng chứng, ẩn thanh khi cuộn, hộp văn bản, media query
  lib/
    api.js            searchDocuments(filters): điểm nối backend
    fixture.js        Dữ liệu mẫu chuyển sang object có tên trường
    documents.js      Nhóm ý theo đơn vị, quan hệ, nguồn được trích
    config.js         Mốc bề rộng, chế độ nhúng
  styles/             tokens.css (màu, font, bo góc, bóng) và CSS theo từng phần
  style.css           Chỉ @import theo đúng thứ tự cascade
  data.js             Dữ liệu mẫu chép từ PDF, giữ nguyên làm bản gốc
public/               Manifest PWA và icon
```

Thiết kế (màu, chữ, bố cục, chuyển động) được ghi trong [DESIGN.md](DESIGN.md); mục đích và ràng buộc sản phẩm trong [PRODUCT.md](PRODUCT.md); hướng dẫn cho agent trong [AGENTS.md](AGENTS.md).

## Nối backend

Toàn bộ dữ liệu đi qua `src/lib/`. Component không đọc thẳng `data.js`.

- **Tra cứu:** thay thân hàm `searchDocuments({ keyword, kind, from, to })` trong `src/lib/api.js` bằng lời gọi API. Hàm trả về `Promise` của mảng `{ code, date, description }`, ngày dạng `dd/mm/yyyy`.
- **Câu trả lời, nguồn, quan hệ:** hiện lấy từ `src/lib/fixture.js`. Backend trả về cùng hình dạng thì component không phải sửa:
  - ý trả lời: `{ id, text, src }` (`src` là số nguồn `[n]`);
  - nguồn: `{ n, code, text, kind, date, pages, unit, issuer }`;
  - quan hệ: `{ label, rows: [{ name, ref, external }] }`.

## Nhúng vào GeoAgent

Trang tự chuyển sang chế độ nhúng khi nằm trong iframe, hoặc khi mở với `?embed=1`. Thêm `&mode=report` để mở thẳng báo cáo tổng hợp.

```html
<iframe src="https://<máy chủ>/NewTopia/?embed=1" title="Tra cứu văn bản"></iframe>
```

Ở chế độ nhúng, trang:

- bỏ đầu trang và thanh câu hỏi (câu hỏi đã là tin nhắn trong chat);
- bố trí theo bề rộng khung: từ 720px chia hai cột câu trả lời và bằng chứng, hẹp hơn thì một cột;
- không tự cuộn, mà gửi chiều cao cho trang cha mỗi khi thay đổi:

```js
window.addEventListener('message', e => {
  if (e.data?.type === 'van-ban/resize') iframe.style.height = `${e.data.height}px`;
});
```

Đặt `VITE_GEOAGENT_ORIGIN` khi build để chỉ gửi tin nhắn tới đúng origin của GeoAgent; nếu không đặt, trang gửi tới `*` (tin nhắn chỉ chứa chiều cao). Phía GeoAgent cần cho phép nhúng trang này (`frame-ancestors` / `X-Frame-Options`).

## Cài như ứng dụng (PWA)

Trên điện thoại, chọn "Thêm vào Màn hình chính" để mở toàn màn hình, không có thanh địa chỉ. Manifest và icon nằm trong `public/`. Trong trình duyệt thường, trang không tự ẩn được khung trình duyệt.

## Kiểm tra

| Script | Kiểm |
|---|---|
| `check.mjs` | Hành vi ở desktop, tablet, điện thoại và chế độ nhúng: thanh câu hỏi, sửa tại chỗ, Hỏi tiếp, cột và panel bằng chứng, trích dẫn hai chiều, bộ lọc, báo cáo, không cuộn ngang |
| `tests/visual.mjs` | So ảnh chụp ở 1440px và 375px |
| `check-touch.mjs` | Thao tác chạm trên WebKit (iOS) và Chromium (Android) |

`check.mjs` và `tests/visual.mjs` dùng Microsoft Edge trên Windows. Đặt `CHECK_URL` để kiểm một địa chỉ khác dev server, ví dụ bản build:

```powershell
npm run build
npm run preview
# Trong PowerShell khác:
$env:CHECK_URL = 'http://127.0.0.1:4173/NewTopia/'
node check.mjs
```

## GitHub Pages

Website: https://quanminhnguyen199.github.io/NewTopia/

Workflow `.github/workflows/deploy.yml` tự cài dependencies, build và triển khai thư mục `dist/` mỗi khi push lên `main`. Trong Settings → Pages, Source cần là **GitHub Actions**.

Vite dùng base `/NewTopia/` khi build để JavaScript, CSS và font tải đúng trên GitHub Pages. Máy local vẫn dùng đường dẫn `/` khi chạy `npm run dev`.

## Giới hạn hiện tại

- Câu trả lời, nguồn và quan hệ là dữ liệu mẫu cố định; bộ lọc chỉ lọc danh sách văn bản mẫu.
- "Xem toàn bộ" mở trích đoạn có trong PDF mẫu, vì chưa có tệp văn bản gốc.
- Quan hệ bước 2 cần dữ liệu từ backend.
- "Tự nhận bộ lọc trong câu hỏi" chưa có tác dụng khi chưa có API. Bỏ chọn "Viết câu trả lời (LLM)" chỉ ẩn phần câu trả lời, để lại danh sách bằng chứng.
- Thời gian truy vấn hiển thị giữ theo PDF mẫu.
