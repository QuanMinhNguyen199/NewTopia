import { documents } from './fixture.js';
import { normalize } from './documents.js';

// Độ trễ giả lập để trạng thái "Đang tìm…" vẫn hiện như khi gọi API thật.
const SIMULATED_LATENCY = 250;

const KIND_PREFIX = { 'Báo cáo': 'BC', 'Công văn': 'CV', 'Nghị quyết': 'NQ' };
// "dd/mm/yyyy" → "yyyy-mm-dd" để so với giá trị của <input type="date">.
const toIsoDate = date => date.split('/').reverse().join('-');

/**
 * Tra cứu văn bản theo bộ lọc. Hiện lọc dữ liệu mẫu chép từ PDF.
 * Khi có backend: thay thân hàm bằng lời gọi API tra cứu, giữ nguyên tham số
 * và hình dạng kết quả (mảng { code, date, description }).
 * @param {{ keyword?: string, kind?: string, from?: string, to?: string }} filters
 * @returns {Promise<Array<{ code: string, date: string, description: string }>>}
 */
export function searchDocuments({ keyword, kind, from, to }) {
  const matches = doc => {
    const date = toIsoDate(doc.date);
    const text = [doc.code, doc.date, doc.description].join(' ');
    return (
      (!keyword || normalize(text).includes(normalize(keyword))) &&
      (!kind || doc.code.includes(KIND_PREFIX[kind])) &&
      (!from || date >= from) &&
      (!to || date <= to)
    );
  };
  return new Promise(resolve =>
    setTimeout(() => resolve(documents.filter(matches)), SIMULATED_LATENCY),
  );
}
