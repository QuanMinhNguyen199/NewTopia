import { answers, documents, relations, sources, sourceAt } from './fixture.js';

export const DOC_PREVIEW = 5;
export const NO_CONTENT = 'PDF mẫu chỉ hiển thị số hiệu văn bản này, chưa có nội dung chi tiết.';
export const normalize = s =>
  s.toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
export const compact = s => s.replace(/\s+/g, '');

// Gom các ý theo đơn vị ban hành nguồn, giữ thứ tự xuất hiện.
export const groups = answers.reduce((list, item) => {
  const { unit } = sourceAt(item.src);
  let group = list.find(g => g.unit === unit);
  if (!group) list.push((group = { unit, items: [] }));
  group.items.push(item);
  return list;
}, []);
export const reportItems = [0, 1, 4, 8, 14, 15].map(id => answers[id]);

// Gộp quan hệ theo văn bản đích: một văn bản có thể vừa là căn cứ vừa được dẫn chiếu.
export const relationRows = [
  ...relations
    .reduce((map, { rows }, kind) => {
      rows.forEach(({ name, ref, external }) => {
        const row = map.get(name) || { name, external: false, basis: '', cited: '' };
        row.external ||= external;
        row[kind === 0 ? 'basis' : 'cited'] = ref;
        map.set(name, row);
      });
      return map;
    }, new Map())
    .values(),
];

/** Dòng mô tả nguồn cho hộp xem văn bản: "<nơi ban hành>. <loại> ngày <ngày>, <trang>." */
export const sourceLine = source =>
  `${source.issuer}. ${source.kind} ngày ${source.date}, ${source.pages}.`;
/** Các số nguồn [n] trích từ văn bản có số hiệu này. */
export const citedBy = code => sources.filter(s => compact(s.code) === compact(code)).map(s => s.n);
export const findDocument = code => documents.find(d => compact(d.code) === compact(code));
/** Các ý trả lời dùng nguồn [n], theo thứ tự xuất hiện. */
export const pointsUsing = n => answers.filter(a => a.src === n);
