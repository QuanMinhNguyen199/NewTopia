# AGENTS.md — Tra cứu và tổng hợp văn bản

Hướng dẫn cho agent (Claude Code, Codex, Cursor…) khi làm việc trong thư mục này.

## Dự án

- Giao diện React + Vite tra cứu văn bản tiếng Việt (hỏi đáp RAG và báo cáo tổng hợp), dựng lại từ PDF mẫu `../screencapture-docs-search-dev-thehegeo-2026-10-23-22_05_48.pdf`.
- Chỉ có frontend: chưa có backend, Keycloak, Adapter phân quyền, kho văn bản hay LLM. Nội dung trong `src/data.js` là dữ liệu mẫu chép từ PDF, **không phải** kết quả tra cứu thật. Không tạo câu trả lời, số liệu hay văn bản mới rồi trình bày như dữ liệu thật.

| File | Vai trò |
|---|---|
| `PRODUCT.md` | Mục đích sản phẩm, ràng buộc, bằng chứng đang có |
| `DESIGN.md` | Token màu, typography, spacing, component (nguồn sự thật về visual) |
| `src/main.jsx` | Điểm vào: nạp font, CSS, render `App` |
| `src/App.jsx` | Ghép các phần và giữ state dùng chung (tìm kiếm, khớp bằng chứng, chế độ hiển thị) |
| `src/components/` | Thành phần giao diện: `QueryBar`, `QueryForm`, `FollowUpForm`, `AnswerSection`/`AnswerUnit`/`Bullet`, `EvidenceDrawer`, `ReportSection`, `DocumentDialog`… |
| `src/hooks/` | Hành vi tách riêng: `useQueryEditor` (sửa câu hỏi), `useEvidenceDrawer` (cột/panel bằng chứng), `useReadingViewport` (ẩn thanh khi cuộn, bàn phím), `useDocumentPreview` (hộp văn bản, báo chiều cao khi nhúng), `useMedia`, `useTabIndicator` |
| `src/lib/api.js` | `searchDocuments(filters)`: hiện lọc dữ liệu mẫu. **Nối backend: thay thân hàm này**, giữ hình dạng kết quả |
| `src/lib/fixture.js` | Chuyển dữ liệu mẫu sang object có tên trường (`{ code, date, description }`, `{ n, code, text, kind, date, pages, unit, issuer }`…) |
| `src/lib/documents.js` | Phép tính trên dữ liệu: nhóm ý theo đơn vị, quan hệ, `citedBy`, `pointsUsing`, `sourceLine` |
| `src/lib/config.js` | Mốc bề rộng, chế độ nhúng, khóa `localStorage` |
| `src/style.css`, `src/styles/` | `style.css` chỉ `@import` theo thứ tự cascade; token ở `styles/tokens.css`, responsive ở cuối |
| `src/data.js` | Dữ liệu mẫu chép từ PDF, giữ nguyên làm bản gốc. Chỉ `lib/fixture.js` đọc file này |
| `check.mjs` | Kiểm tra hành vi desktop/tablet/mobile/nhúng bằng Playwright (Edge trên Windows) |
| `tests/visual.mjs`, `check-touch.mjs` | So ảnh chụp 1440/375; thao tác chạm trên WebKit (iOS) và Chromium (Android) |

Lệnh (chạy được từ `Replica/` hoặc `van-ban/`): `npm run dev` (http://127.0.0.1:5173), `npm run build`, `npm run preview`. Từ `Replica/`: `npm run check`, `npm run install:app`. Trong `van-ban/`: `npm run format` (Prettier), `npm run lint` (ESLint), `npm run check`.

Trước khi bàn giao một thay đổi: `npm run format`, `npm run lint`, `npm run build`, rồi `npm run check` với dev server đang chạy ở cổng 5173. Component đọc dữ liệu qua `lib/fixture.js` hoặc `lib/documents.js`, không đọc thẳng `data.js` và không truy cập theo chỉ số (`d[0]`).

Hướng dẫn chung cho mọi dự án và cách dùng skill nằm ở `~/.claude/CLAUDE.md` (Claude Code) và `~/.codex/AGENTS.md` (Codex). File này chỉ ghi phần riêng của dự án.

## Quy trình

Theo `c:\Users\admin\Desktop\CLAUDE.md`: Bài toán → Bối cảnh → Bằng chứng → Insight → Câu hỏi thiết kế → Phương án → Kiểm chứng → Quyết định tiếp theo. Gắn nhãn **bằng chứng / diễn giải / giả định / đề xuất** cho mọi lập luận. Chỉ chọn visual sau khi đã có flow và các trạng thái.

Thứ tự ưu tiên khi mâu thuẫn: ràng buộc sản phẩm và bằng chứng đã xác nhận → yêu cầu người dùng/business → logic UX → token trong `DESIGN.md` → gợi ý của skill.

## Skill

| Skill | Dùng khi | Cách gọi |
|---|---|---|
| `ui-ux-pro-max` | Rà soát UX, information architecture, accessibility, responsive; tra guideline theo domain | `/ui-ux-pro-max` hoặc chạy script bên dưới |
| `impeccable` | Định hình, critique, audit, polish giao diện | `/impeccable shape`, `critique`, `audit`, `polish` |
| `frontend-design` | Chọn hướng thị giác (chỉ ở bước 6, sau khi có flow) | `/frontend-design` |

### ui-ux-pro-max

Đã cài ở `~/.claude/skills/ui-ux-pro-max` (Claude Code) và `~/.agents/skills/ui-ux-pro-max` (agent khác). Cần Python 3; trên Windows dùng `python`.

```sh
# Một câu hỏi, 2–5 từ khóa, một domain
python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "keyboard focus modal" --domain ux
python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "list virtualization" --stack react
```

Cách dùng trong dự án này:

- **Không** chạy `--design-system` để thay bảng màu hay font. `DESIGN.md` đã chốt token; skill chỉ dùng cho cấu trúc, tương tác, accessibility.
- Ưu tiên checklist Quick Reference: §1 Accessibility, §5 Layout (`content-priority`, `visual-hierarchy`), §8 `progressive-disclosure`, §9 `deep-linking`, `state-preservation`.
- Kiểm tra kết quả search có đúng chủ đề không; lệch thì thử lại một lần với từ khóa hẹp hơn, vẫn lệch thì ghi "không có kết quả xác nhận" và dùng Quick Reference.
- Kết quả của skill là khuyến nghị, không phải bằng chứng về người dùng.

## Bố trí trang kết quả

**Đã triển khai ngày 24/10/2026: "Đọc theo lớp"**, mô tả trong `DESIGN.md` › Layout. Bố cục này chưa được kiểm chứng với người dùng. Phần dưới là phân tích ban đầu dẫn tới quyết định đó.

Vấn đề quan sát được (bằng chứng: `../reference.png`, `../reference-page2.png`, `src/main.jsx`): câu trả lời, 15 văn bản, bản đồ quan hệ và 8 đoạn nguồn đều mở sẵn trong một cột dài khoảng 3 màn hình. Câu trả lời có 16 ý ngang hàng nhau. Nhãn "Hiệu lực chưa xác định" lặp lại trên mọi dòng. Bấm trích dẫn `[n]` sẽ nhảy xuống cuối trang, người đọc mất vị trí đang đọc.

Nguyên tắc khi sửa phần kết quả:

1. **Câu trả lời trước, bằng chứng sau.** Chỉ câu trả lời mở sẵn. Văn bản, đoạn nguồn và quan hệ gộp vào một vùng bằng chứng có tab, kèm số lượng.
2. **Nhóm các ý của câu trả lời** theo cấp/đơn vị ban hành (dựa vào số nguồn trong `answers`). Mỗi nhóm hiện vài ý đầu, có "Xem thêm".
3. **Trích dẫn mở tại chỗ**: desktop dùng panel bên cạnh, mobile dùng bottom sheet. Không cuộn người đọc rời khỏi câu đang đọc.
4. **Bỏ nhãn lặp**: một trạng thái đúng với mọi dòng thì nói một lần ở đầu danh sách, chỉ gắn nhãn cho dòng khác biệt.
5. **Gộp quan hệ theo văn bản đích** (ví dụ 57-NQ/TW đang xuất hiện ở cả Căn cứ và Dẫn chiếu).
6. **Đẩy thông tin kỹ thuật xuống dòng trạng thái nhỏ**: thời gian truy vấn, "1 ý bị bỏ", ghi chú về Adapter.
7. Giữ nguyên token của `DESIGN.md`; chỉ đổi cấu trúc và mức độ hiển thị mặc định.

Thay đổi này đi ngược mục tiêu "giống PDF nhất có thể" trong `PRODUCT.md`. Cần xác nhận với người phụ trách trước khi triển khai, và cập nhật `PRODUCT.md` nếu được duyệt.

## Quy tắc chống thiết kế AI và chuyển động (bắt buộc)

Chi tiết nằm trong `DESIGN.md` › "Anti-AI rules" và "Motion". Kiểm tra mọi thay đổi giao diện theo danh sách sau trước khi bàn giao:

- **Không** dùng:
  - ô biểu tượng trang trí cạnh tiêu đề;
  - nhãn hay số đếm bo tròn;
  - thẻ có bóng đổ, lưới thẻ giống nhau, nền xám với thẻ trắng;
  - tab dạng phân đoạn, công tắc bật/tắt, nút nằm trong ô tìm;
  - bo góc lớn đồng loạt;
  - gradient, kính mờ, viền phát sáng;
  - chuỗi metadata nối bằng "·", nhãn in hoa ở đầu mục, "→" cuối link;
  - số thứ tự không phải trình tự thật.
- **Chỉ** bo 2px (giấy, nhãn), 4px (nút, ô nhập), 6px (hộp xem văn bản).
- **Biểu tượng** chỉ dùng khi mang chức năng (mũi tên mở/đóng, tải về).
- **Nội dung** giữ nguyên văn PDF; không thêm tóm tắt, diễn giải hay câu khẳng định mà dữ liệu không có.
- **Chuyển động** chỉ dùng cho các khoảnh khắc trong bảng Motion:
  - Khoảnh khắc chính: bấm `[n]` thì "rút" tờ trích ra khỏi ngăn hồ sơ.
  - Còn lại là phản hồi trạng thái ngắn: mở/đóng đơn vị, mở đoạn trích, đổi tab, hộp xem văn bản, rê chuột.
  - Không dùng hiệu ứng xuất hiện cho từng khối, không nâng thẻ khi rê chuột, không hiệu ứng khi cuộn.
  - Mọi chuyển động phải có phương án `prefers-reduced-motion`.

## Kiểm tra trước khi bàn giao

- `npm run build` chạy được; `node check.mjs` qua ở desktop và mobile (≤640px).
- Focus bàn phím nhìn thấy được; các khối thu gọn dùng `<details>` gốc hoặc có `aria-expanded`.
- Không có cuộn ngang ở 375px; chữ tiếng Việt có dấu không bị cắt.
- Ghi rõ phần nào còn là dữ liệu mẫu hoặc chưa kiểm chứng.
