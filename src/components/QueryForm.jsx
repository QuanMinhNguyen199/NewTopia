import React from 'react';
import { Icon } from './Icon.jsx';
export function QueryForm({
  search,
  behind,
  floating,
  cancelEdit,
  questionField,
  question,
  setQuestion,
  busy,
  auto,
  setAuto,
  setNotice,
  llm,
  setLlm,
  filtersOpen,
  setFiltersOpen,
  filterCount,
  keyword,
  setKeyword,
  kind,
  setKind,
  from,
  setFrom,
  to,
  setTo,
  clearFilters,
}) {
  return (
    <form
      onSubmit={search}
      inert={behind}
      className={`query ${floating ? 'floating' : ''}`}
      aria-label={floating ? 'Sửa câu hỏi' : undefined}
      onKeyDown={e => {
        if (e.key === 'Escape' && e.target.tagName !== 'SELECT') {
          e.preventDefault();
          cancelEdit();
        }
      }}
    >
      <div className="search-row">
        <label className="sr-only" htmlFor="question">
          Câu hỏi tra cứu
        </label>
        <textarea
          id="question"
          ref={questionField}
          rows="1"
          value={question}
          required
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form.requestSubmit();
            }
          }}
        />
        {/* Đang sửa một câu hỏi đã có kết quả: Hủy (phụ) cạnh Xác nhận (chính). */}
        <div className="search-actions">
          <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
            Hủy
          </button>
          <button className="primary" disabled={busy}>
            {busy ? 'Đang tìm…' : 'Xác nhận'}
          </button>
        </div>
      </div>
      <div className="query-options">
        <label className="check">
          <input
            type="checkbox"
            checked={auto}
            onChange={e => {
              setAuto(e.target.checked);
              setNotice(
                'Tự nhận bộ lọc cần kết nối API. Bạn có thể sử dụng Bộ lọc để lọc dữ liệu mẫu.',
              );
            }}
          />{' '}
          Tự nhận bộ lọc trong câu hỏi
        </label>
        <label className="check">
          <input type="checkbox" checked={llm} onChange={e => setLlm(e.target.checked)} /> Viết câu
          trả lời (LLM)
        </label>
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="query-filter-panel"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          Bộ lọc{filterCount > 0 && <span className="filter-count">({filterCount})</span>}
          <Icon name="down" />
        </button>
        <span className="timing" title="Thời gian được hiển thị trong PDF mẫu">
          Tìm 0.522s, LLM 8.927s
        </span>
      </div>
      <div id="query-filter-panel" className="filters" hidden={!filtersOpen}>
        <div className="filter-grid">
          <label>
            Từ khóa văn bản
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Số hiệu hoặc nội dung"
            />
          </label>
          <label>
            Loại văn bản
            <select value={kind} onChange={e => setKind(e.target.value)}>
              <option value="">Tất cả</option>
              <option>Báo cáo</option>
              <option>Công văn</option>
              <option>Nghị quyết</option>
            </select>
          </label>
          <label>
            Từ ngày
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label>
            Đến ngày
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
        <button type="button" className="btn" onClick={clearFilters}>
          Xóa bộ lọc
        </button>
      </div>
    </form>
  );
}
