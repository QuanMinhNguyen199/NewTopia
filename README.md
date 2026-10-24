# Tra cứu và tổng hợp văn bản

Giao diện React dựng theo hai trang của PDF mẫu, hỗ trợ màn hình máy tính và điện thoại.

## Chạy cục bộ

```sh
npm install
npm run dev
```

Mở http://127.0.0.1:5173. Đóng gói bản production bằng `npm run build`; kết quả nằm trong `dist/`.

## Nội dung

- `src/main.jsx`: giao diện và các tương tác React.
- `src/style.css`: bố cục, màu sắc, typography và responsive.
- `src/data.js`: nội dung mẫu chép lại từ PDF.
- `check.mjs`: kiểm tra giao diện desktop/mobile và tương tác bằng Playwright, sử dụng Microsoft Edge trên Windows.

Các thao tác lọc văn bản, mở/đóng danh sách, chuyển tab, xem trích đoạn và tải danh sách báo cáo hoạt động cục bộ. Đây là bản frontend: chưa kết nối Keycloak, Adapter phân quyền, kho văn bản hoặc LLM. Nội dung và thời gian truy vấn ban đầu giữ theo PDF; không phải kết quả tra cứu trực tiếp. “Xem toàn bộ” mở trích đoạn có trong mẫu vì chưa có tệp văn bản gốc. Quan hệ bước 2 cần dữ liệu từ backend.
