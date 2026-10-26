import React from 'react';
import { sources } from '../lib/fixture.js';
import {
  DOC_PREVIEW,
  NO_CONTENT,
  citedBy,
  pointsUsing,
  sourceLine,
  relationRows,
} from '../lib/documents.js';
import { moveTab } from '../lib/navigation.js';
import { SourceHead, SourceMeta } from './SourceMetadata.jsx';
export function EvidenceDrawer({
  behind,
  docking,
  wide,
  setDocking,
  evidenceShown,
  panel,
  closePanel,
  solo,
  collapseEvidence,
  evidenceTablist,
  evidence,
  setEvidence,
  evidenceTabs,
  ink,
  matching,
  docFocus,
  contextName,
  showAllEvidence,
  contextSources,
  shownDocs,
  visibleDocs,
  openDocument,
  showDocSources,
  allDocs,
  setAllDocs,
  unitMatching,
  result,
  openGroups,
  clearFilters,
  shownSources,
  activeSource,
  pull,
  tab,
  showAnswer,
  showPoints,
  second,
  setSecond,
  openCode,
}) {
  return (
    <aside
      className={`evidence ${behind ? 'is-open' : ''} ${docking && wide ? 'docking' : ''}`}
      onAnimationEnd={e => {
        if (e.target === e.currentTarget) setDocking(false);
      }}
      id="evidence"
      tabIndex={-1}
      aria-labelledby="evidence-title"
      hidden={wide && !evidenceShown}
      role={panel ? 'dialog' : undefined}
      aria-modal={behind || undefined}
      onKeyDown={e => {
        if (panel && e.key === 'Escape') {
          e.stopPropagation();
          closePanel();
        }
      }}
    >
      <div className="evidence-head">
        <div className="section-head">
          <h2 id="evidence-title">Bằng chứng</h2>
          {wide && !solo && (
            <button
              type="button"
              className="link-btn"
              aria-expanded="true"
              aria-controls="evidence"
              onClick={collapseEvidence}
            >
              Thu gọn
            </button>
          )}
          {panel && (
            <button type="button" className="btn" onClick={closePanel}>
              Đóng
            </button>
          )}
        </div>
        <div
          className="drawer-tabs"
          ref={evidenceTablist}
          role="tablist"
          aria-label="Loại bằng chứng"
          onKeyDown={e => moveTab(e, ['docs', 'sources', 'relations'], evidence, setEvidence)}
        >
          {evidenceTabs.map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={evidence === id}
              aria-controls={`panel-${id}`}
              tabIndex={evidence === id ? 0 : -1}
              onClick={() => setEvidence(id)}
            >
              {label} <span className="count">{count}</span>
            </button>
          ))}
          <span
            className="tab-ink"
            aria-hidden="true"
            style={{ transform: `translateX(${ink.x}px) scaleX(${ink.w / 100})` }}
          />
        </div>
        {matching && (
          <p className="context-line" role="status">
            <span>
              {docFocus ? (
                <>
                  Đang xem đoạn trích của <strong>{docFocus.code}</strong>
                </>
              ) : (
                <>
                  Đang xem nguồn của <strong>{contextName}</strong>
                </>
              )}
            </span>
            <button type="button" className="link-btn" onClick={showAllEvidence}>
              Hiện tất cả
            </button>
          </p>
        )}
      </div>

      <div
        className="drawer"
        key={`${evidence}-${matching ? [...contextSources].join(',') : 'all'}`}
      >
        {evidence === 'docs' && (
          <div role="tabpanel" id="panel-docs" aria-labelledby="tab-docs">
            {shownDocs.length > 0 && <p className="panel-note">Hiệu lực chưa xác định</p>}
            {shownDocs.length > 0 && (
              <div className="doc-list">
                {visibleDocs.map(({ code, date, description }) => {
                  const cited = citedBy(code);
                  return (
                    <div className="document" key={code}>
                      <div className="doc-top">
                        <button
                          type="button"
                          className="doc-open doc-no"
                          onClick={() =>
                            openDocument(code, description || NO_CONTENT, `Ngày ${date}`)
                          }
                        >
                          {code}
                        </button>
                        <time>{date}</time>
                      </div>
                      {description && <p className="doc-description">{description}</p>}
                      {cited.length > 0 && (
                        <button
                          type="button"
                          className="btn cited-btn"
                          aria-label={`Xem ${cited.length} đoạn trích của ${code}: nguồn ${cited.join(', ')}`}
                          onClick={() => showDocSources(code, cited)}
                        >
                          Xem {cited.length} đoạn trích
                        </button>
                      )}
                    </div>
                  );
                })}
                {shownDocs.length > DOC_PREVIEW && (
                  <button
                    type="button"
                    className="show-all"
                    aria-expanded={allDocs}
                    onClick={() => setAllDocs(!allDocs)}
                  >
                    {allDocs ? 'Thu gọn danh sách' : `Hiện tất cả ${shownDocs.length} văn bản`}
                  </button>
                )}
              </div>
            )}
            {unitMatching && !docFocus && result.length > 0 && !shownDocs.length && (
              <div className="empty">
                <p>
                  Nguồn của {openGroups.length > 1 ? 'các đơn vị đang mở' : 'đơn vị này'} không có
                  trong danh sách văn bản tìm thấy.
                </p>
              </div>
            )}
            {!result.length && (
              <div className="empty">
                <p>Không tìm thấy văn bản trong dữ liệu mẫu. Hãy đổi từ khóa hoặc xóa bộ lọc.</p>
                <button type="button" className="btn" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}

        {evidence === 'sources' && (
          <div role="tabpanel" id="panel-sources" aria-labelledby="tab-sources">
            {sources.map(source => {
              const { n, code, text } = source;
              if (!shownSources.includes(n)) return null;
              const uses = pointsUsing(n).length;
              return (
                <article
                  id={`source-${n}`}
                  aria-current={activeSource === n ? 'true' : undefined}
                  className={`excerpt ${activeSource === n ? 'active pulled' : ''}`}
                  key={activeSource === n ? `s${n}-${pull}` : `s${n}`}
                >
                  <SourceHead n={n} title={code} />
                  <SourceMeta source={source} />
                  <p className="excerpt-text">
                    <span className="clamp">{text}</span>
                  </p>
                  <div className="excerpt-actions">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => openDocument(code, text, sourceLine(source))}
                    >
                      Xem toàn bộ
                    </button>
                    {tab === 'qa' && showAnswer && uses > 0 && (
                      <button type="button" className="link-btn" onClick={() => showPoints(n)}>
                        Xem {uses} ý dùng nguồn này
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {evidence === 'relations' && (
          <div role="tabpanel" id="panel-relations" aria-labelledby="tab-relations">
            {matching && (
              <p className="panel-note">Quan hệ không gắn với từng đơn vị nên luôn hiện tất cả.</p>
            )}
            <label className="relation-toggle">
              <input type="checkbox" checked={second} onChange={e => setSecond(e.target.checked)} />{' '}
              Hiện cả quan hệ bước 2{' '}
              <span className="muted">107 văn bản chỉ xuất hiện qua quan hệ.</span>
            </label>
            {second && (
              <p className="muted" role="status">
                PDF không có dữ liệu chi tiết quan hệ bước 2. Cần kết nối kho văn bản để hiển thị.
              </p>
            )}
            <div className="relation-list">
              {relationRows.map(row => (
                <div className="relation-row" key={row.name}>
                  <div className="relation-top">
                    <button
                      type="button"
                      className="relation-name"
                      onClick={() => openCode(row.name)}
                    >
                      {row.name}
                    </button>
                    {row.external && <span className="badge">ngoài kho</span>}
                  </div>
                  {[
                    ['Căn cứ vào văn bản này', row.basis],
                    ['Dẫn chiếu văn bản này', row.cited],
                  ]
                    .filter(([, refs]) => refs)
                    .map(([label, refs]) => (
                      <p key={label}>
                        {label}:{' '}
                        {refs.split(', ').map((code, k) => (
                          <React.Fragment key={code}>
                            {k > 0 && ', '}
                            <button type="button" className="ref" onClick={() => openCode(code)}>
                              {code}
                            </button>
                          </React.Fragment>
                        ))}
                      </p>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
