// Dữ liệu mẫu chép từ PDF (data.js, giữ nguyên làm bản gốc) chuyển sang object có tên trường.
// Khi có API, backend trả về đúng các hình dạng dưới đây thì component không phải sửa.
import {
  answers as rawAnswers,
  documents as rawDocuments,
  relations as rawRelations,
  sources as rawSources,
  sourceOrigins,
} from '../data.js';

const KIND = { bao_cao: 'Báo cáo', cong_van: 'Công văn' };

/** Văn bản tìm thấy: { code, date ("dd/mm/yyyy"), description } */
export const documents = rawDocuments.map(([code, date, description]) => ({
  code,
  date,
  description,
}));

/** Đoạn nguồn được trích, đánh số từ 1 như [n] trong câu trả lời. */
export const sources = rawSources.map(([code, meta, text], i) => {
  const [kind, date, , pages] = meta.split(' · ');
  const [unit, issuer] = sourceOrigins[i];
  return { n: i + 1, code, text, kind: KIND[kind] || kind, date, pages, unit, issuer };
});

/** Ý trả lời: { id, text, src } với src là số thứ tự nguồn [n]. */
export const answers = rawAnswers.map(([text, src], id) => ({ id, text, src }));

/** Nhóm quan hệ (căn cứ, dẫn chiếu), mỗi dòng { name, ref, external }. */
export const relations = rawRelations.map(([label, rows]) => ({
  label,
  rows: rows.map(([name, ref, external]) => ({ name, ref, external })),
}));

/** Nguồn theo số thứ tự [n]. */
export const sourceAt = n => sources[n - 1];
