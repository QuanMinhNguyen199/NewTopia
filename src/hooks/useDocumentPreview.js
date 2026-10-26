import { useState, useRef, useEffect } from 'react';
import { EMBED, HOST_ORIGIN } from '../lib/config.js';
import { findDocument, NO_CONTENT } from '../lib/documents.js';
export function useDocumentPreview() {
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null),
    reportHeight = useRef(null);
  // Khi nhúng, khung iframe cao bằng nội dung nên hộp văn bản phải mở cạnh chỗ vừa bấm, không phải giữa khung.
  function openDocument(title, content, meta) {
    setSelected({ title, content, meta });
    if (EMBED) {
      const r = document.activeElement?.getBoundingClientRect();
      dialog.current.style.top = `${Math.max(8, Math.round((r?.top ?? 0) + window.scrollY - 24))}px`;
    }
    dialog.current.showModal();
    reportHeight.current?.();
  }
  useEffect(() => {
    if (!EMBED || window.parent === window) return;
    let last = 0;
    const report = () => {
      const d = dialog.current,
        h = Math.ceil(
          Math.max(
            document.body.getBoundingClientRect().height,
            d?.open ? d.offsetTop + d.offsetHeight + 16 : 0,
          ),
        );
      if (h !== last) {
        last = h;
        window.parent.postMessage({ type: 'van-ban/resize', version: 1, height: h }, HOST_ORIGIN);
      }
    };
    reportHeight.current = report;
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    observer.observe(dialog.current);
    report();
    return () => observer.disconnect();
  }, []);
  function openCode(code) {
    const doc = findDocument(code);
    openDocument(code, doc?.description || NO_CONTENT, doc ? `Ngày ${doc.date}` : '');
  }

  return { selected, dialog, reportHeight, openDocument, openCode };
}
