import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { EMBED } from '../lib/config.js';
export function useQueryEditor({ wide, setNotice, hasResults }) {
  const [question, setQuestion] = useState('việc triển khai Nghị quyết 57 như thế nào');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keyword, setKeyword] = useState(''),
    [kind, setKind] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState('');
  const [auto, setAuto] = useState(true),
    [llm, setLlm] = useState(true);
  // Đã có kết quả thì khối câu hỏi thu thành một thanh; "applied" là câu hỏi và bộ lọc của kết quả đang hiện.
  const [editing, setEditing] = useState(false),
    [applied, setApplied] = useState({ question, keyword, kind, from, to });
  const questionField = useRef(null),
    editButton = useRef(null),
    draft = useRef(null);
  // Ô câu hỏi tự giãn theo nội dung, mặc định một dòng bằng chiều cao nút Hỏi.
  useEffect(() => {
    const el = questionField.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [question, wide, editing]);
  // Sửa tại chỗ: đang đọc giữa trang thì form mở thành khung bám đầu màn hình (không kèm đầu trang),
  // và giữ nguyên chỗ đang đọc bằng cách đo một phần tử mốc trước và sau khi đổi bố cục.
  const [floating, setFloating] = useState(false),
    anchor = useRef(null);
  function keepPlace() {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.6);
    if (el && !el.closest('.query, .query-bar'))
      anchor.current = { el, top: el.getBoundingClientRect().top };
  }
  useLayoutEffect(() => {
    const a = anchor.current;
    anchor.current = null;
    if (a?.el.isConnected) {
      const d = a.el.getBoundingClientRect().top - a.top;
      if (Math.abs(d) > 1) window.scrollBy(0, d);
    }
  }, [editing]);
  // Mở lại form: nếu lần trước bấm ra ngoài khi đang gõ dở thì khôi phục bản gõ dở.
  function editQuestion() {
    setFiltersOpen(false);
    const d = draft.current;
    draft.current = null;
    if (d) {
      setQuestion(d.question);
      setKeyword(d.keyword);
      setKind(d.kind);
      setFrom(d.from);
      setTo(d.to);
    }
    const inPlace = window.scrollY > 80;
    setFloating(inPlace);
    if (inPlace) keepPlace();
    setEditing(true);
    requestAnimationFrame(() => {
      const el = questionField.current;
      if (el) {
        el.focus({ preventScroll: true });
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  }
  // Trả câu hỏi và bộ lọc về đúng những gì kết quả đang hiện dựa trên; người đọc ở lại đúng chỗ.
  function restoreApplied() {
    if (floating) keepPlace();
    setQuestion(applied.question);
    setKeyword(applied.keyword);
    setKind(applied.kind);
    setFrom(applied.from);
    setTo(applied.to);
    setEditing(false);
    setNotice('');
  }
  // Hủy (nút hoặc Esc): bỏ hẳn bản gõ dở, focus về nút Sửa câu hỏi.
  function cancelEdit() {
    draft.current = null;
    restoreApplied();
    requestAnimationFrame(() => editButton.current?.focus());
  }
  // Bấm ra ngoài khối tìm kiếm khi đang sửa: thu form lại như Hủy, nhưng giữ bản gõ dở cho lần mở sau và không giành focus.
  // Nghe sự kiện click (sau khi thả chuột) để form thu lại không làm lệch chỗ người dùng vừa bấm.
  useEffect(() => {
    if (!editing || EMBED || !hasResults) return;
    const onClick = e => {
      const t = e.target;
      if (!(t instanceof Element) || !t.isConnected || t.closest('.query, header, nav, dialog'))
        return;
      const current = { question, keyword, kind, from, to };
      draft.current = Object.keys(current).some(k => current[k] !== applied[k]) ? current : null;
      restoreApplied();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });
  const filterCount = [keyword, kind, from, to].filter(Boolean).length;
  const appliedFilters = [applied.keyword, applied.kind, applied.from, applied.to].filter(
    Boolean,
  ).length;

  return {
    question,
    setQuestion,
    keyword,
    setKeyword,
    kind,
    setKind,
    from,
    setFrom,
    to,
    setTo,
    auto,
    setAuto,
    llm,
    setLlm,
    filtersOpen,
    setFiltersOpen,
    editing,
    setEditing,
    applied,
    setApplied,
    floating,
    draft,
    questionField,
    editButton,
    filterCount,
    appliedFilters,
    editQuestion,
    cancelEdit,
  };
}
