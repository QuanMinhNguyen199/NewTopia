import React from 'react';

export function QueryBar({
  barHidden,
  behind,
  setBarHidden,
  modeNav,
  applied,
  editQuestion,
  appliedFilters,
  clearFilters,
  busy,
  editButton,
  identity,
  userSelect,
}) {
  return (
    <div
      className={`query-bar ${barHidden ? 'is-hidden' : ''}`}
      inert={behind}
      onFocus={() => setBarHidden(false)}
    >
      {modeNav}
      <p className="query-text" title={applied.question} onClick={editQuestion}>
        <span className="sr-only">Câu hỏi đang xem: </span>
        {applied.question}
      </p>
      {appliedFilters > 0 && (
        <p className="query-filters">
          Bộ lọc ({appliedFilters})
          <button type="button" className="link-btn" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </p>
      )}
      {busy ? (
        <span className="timing">Đang tìm…</span>
      ) : (
        <span className="timing" title="Thời gian được hiển thị trong PDF mẫu">
          Tìm 0.522s, LLM 8.927s
        </span>
      )}
      <button
        type="button"
        className="btn btn-primary"
        ref={editButton}
        aria-label="Sửa câu hỏi"
        onClick={editQuestion}
      >
        Sửa
      </button>
      <label className="user-compact" title={identity}>
        <span className="sr-only">Người dùng giả lập</span>
        {userSelect}
      </label>
    </div>
  );
}
