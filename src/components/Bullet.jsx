import React from 'react';
import { sourceAt } from '../lib/fixture.js';
import { sourceLine } from '../lib/documents.js';
import { SourceHead, SourceMeta } from './SourceMetadata.jsx';

// Số chú thích: từ 768px chuyển phần bằng chứng sang nguồn (bấm lại để bỏ chọn); màn hẹp mở đoạn trích tại chỗ.
function Cite({ item, open, onToggle, split, active }) {
  const title = sourceAt(item.src).code;
  return split ? (
    <button
      type="button"
      className={`cite ${active ? 'is-active' : ''}`}
      aria-controls={`source-${item.src}`}
      aria-label={`${active ? 'Bỏ chọn' : 'Xem'} nguồn ${item.src}: ${title}, ở phần bằng chứng`}
      title={`Nguồn ${item.src}: ${title}`}
      onClick={onToggle}
    >
      [{item.src}]
    </button>
  ) : (
    <button
      type="button"
      className="cite"
      aria-expanded={open}
      aria-controls={`cite-${item.id}`}
      aria-label={`${open ? 'Ẩn' : 'Xem'} nguồn ${item.src}: ${title}`}
      onClick={onToggle}
    >
      [{item.src}]
    </button>
  );
}
export function Bullet(props) {
  const { item, open, split, active, openDocument } = props;
  const source = sourceAt(item.src);
  return (
    <li
      id={`point-${item.id}`}
      data-src={item.src}
      tabIndex={-1}
      className={active ? 'active' : undefined}
    >
      {item.text}
      <Cite {...props} />
      {open && !split && (
        <div className="excerpt inline" id={`cite-${item.id}`}>
          <SourceHead n={item.src} title={source.code} />
          <SourceMeta source={source} />
          <p className="excerpt-text">
            <span className="clamp">{source.text}</span>
          </p>
          <button
            type="button"
            className="link-btn"
            onClick={() => openDocument(source.code, source.text, sourceLine(source))}
          >
            Xem toàn bộ
          </button>
        </div>
      )}
    </li>
  );
}
