import React, { useState, useRef } from 'react';
import { useTabIndicator } from './hooks/useTabIndicator.js';
import { useQueryEditor } from './hooks/useQueryEditor.js';
import { useReadingViewport } from './hooks/useReadingViewport.js';
import { useDocumentPreview } from './hooks/useDocumentPreview.js';
import { useEvidenceDrawer } from './hooks/useEvidenceDrawer.js';
import { documents, sources, sourceAt } from './lib/fixture.js';
import { searchDocuments } from './lib/api.js';
import {
  groups,
  NO_CONTENT,
  citedBy,
  pointsUsing,
  relationRows,
  DOC_PREVIEW,
} from './lib/documents.js';
import {
  WIDE,
  SPLIT,
  EMBED,
  START_TAB,
  EMBED_WIDE,
  MOBILE,
  HOST_ORIGIN,
  DOCKED_KEY,
} from './lib/config.js';
import { moveTab } from './lib/navigation.js';
import { useMedia } from './hooks/useMedia.js';
import { QueryForm } from './components/QueryForm.jsx';
import { QueryBar } from './components/QueryBar.jsx';
import { FollowUpForm } from './components/FollowUpForm.jsx';
import { DocumentDialog } from './components/DocumentDialog.jsx';
import { AnswerSection } from './components/AnswerSection.jsx';
import { ReportSection } from './components/ReportSection.jsx';
import { EvidenceDrawer } from './components/EvidenceDrawer.jsx';

export function App() {
  const [tab, setTab] = useState(START_TAB),
    [user, setUser] = useState('leader');
  const [showAnswer, setShowAnswer] = useState(true),
    [second, setSecond] = useState(false);
  const [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(documents);
  const [expanded, setExpanded] = useState([groups[0].unit]),
    [openCite, setOpenCite] = useState(null),
    [evidence, setEvidence] = useState('docs'),
    [allDocs, setAllDocs] = useState(false);
  const [activeSource, setActiveSource] = useState(null),
    [pull, setPull] = useState(0),
    [evidenceAll, setEvidenceAll] = useState(true),
    [docFocus, setDocFocus] = useState(null),
    [announce, setAnnounce] = useState('');
  const wideScreen = useMedia(WIDE),
    splitScreen = useMedia(SPLIT),
    wideEmbed = useMedia(EMBED_WIDE),
    narrowScreen = useMedia(MOBILE);
  // Mobile (không nhúng): ô "Hỏi tiếp" ghim ở đáy màn hình để hỏi câu mới; sửa câu hỏi hiện tại vẫn dùng thanh trên đầu.
  const mobile = !EMBED && narrowScreen;
  const [followUp, setFollowUp] = useState(''),
    followField = useRef(null);
  const wide = EMBED ? wideEmbed : wideScreen,
    split = EMBED ? wideEmbed : splitScreen;
  const {
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
  } = useQueryEditor({ wide, setNotice, hasResults: !!result });
  const evidenceTablist = useRef(null);
  const { selected, dialog, reportHeight, openDocument, openCode } = useDocumentPreview();
  const solo = tab === 'qa' && !showAnswer;
  const {
    docking,
    setDocking,
    panel,
    evidenceShown,
    behind,
    railButton,
    setPanelOpen,
    openEvidence,
    closePanel,
    collapseEvidence,
  } = useEvidenceDrawer({ wide, solo });
  const { ink } = useTabIndicator({
    evidenceTablist,
    evidence,
    wide,
    result,
    expanded,
    evidenceAll,
    evidenceShown,
  });
  const { barHidden, setBarHidden } = useReadingViewport({ editing, mobile });
  // Đang đọc ý nào (trỏ chuột hoặc focus): tô sáng nguồn tương ứng ở lề của đơn vị đó.
  const [readingAt, setReadingAt] = useState(null);
  const allOpen = expanded.length === groups.length;

  // Trái → phải: [n] chuyển phần bằng chứng sang nguồn n (mở lại nếu đang thu gọn); chỉ cuộn bên trong phần đó. Bấm lại để bỏ chọn.
  function showSource(n, fromAnswer = true) {
    if (activeSource === n && evidenceShown) {
      setActiveSource(null);
      setAnnounce(`Đã bỏ chọn nguồn ${n}.`);
      return;
    }
    openEvidence();
    setEvidence('sources');
    setActiveSource(n);
    setPull(p => p + 1);
    setEvidenceAll(!fromAnswer);
    setDocFocus(null);
    setAnnounce(`Đang hiển thị nguồn ${n}: ${sourceAt(n).code}, ở phần bằng chứng.`);
    requestAnimationFrame(() => {
      const slip = document.getElementById(`source-${n}`);
      if (!slip) return;
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      if (wide || panel) {
        const column = document.querySelector('.evidence'),
          head = column.querySelector('.evidence-head');
        column.scrollTo({ top: slip.offsetTop - head.offsetHeight - 12, behavior });
      } else slip.scrollIntoView({ block: 'start', behavior });
    });
  }
  // Phải → trái: mở các đơn vị dùng nguồn n, đánh dấu và chuyển focus tới ý đầu tiên. Panel (dưới 1100px) đóng lại để thấy ý.
  function showPoints(n) {
    setActiveSource(n);
    if (panel) setPanelOpen(false);
    const units = groups.filter(g => g.items.some(i => i.src === n)).map(g => g.unit),
      points = pointsUsing(n);
    setExpanded([...new Set([...expanded, ...units])]);
    setAnnounce(`Đã mở ${points.length} ý dùng nguồn ${n}.`);
    if (points.length)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.getElementById(`point-${points[0].id}`)?.focus()),
      );
  }
  const toggleCite = (id, src) =>
    split ? showSource(src) : setOpenCite(openCite === id ? null : id);
  const bulletProps = item => ({
    item,
    split,
    open: openCite === item.id,
    active: split && evidenceShown && activeSource === item.src,
    onToggle: () => toggleCite(item.id, item.src),
    openDocument,
  });
  const toggleGroup = unit => {
    if (!expanded.includes(unit)) {
      setEvidenceAll(false);
      setDocFocus(null);
    }
    setExpanded(expanded.includes(unit) ? expanded.filter(u => u !== unit) : [...expanded, unit]);
  };

  // Từ danh sách văn bản: mở tab Đoạn nguồn, chỉ hiện các tờ trích của văn bản đó và rút tờ đầu tiên.
  function showDocSources(code, list) {
    setDocFocus({ code, list });
    setEvidence('sources');
    setActiveSource(list[0]);
    setPull(p => p + 1);
    setAnnounce(`Đang xem ${list.length} đoạn trích của ${code}.`);
    requestAnimationFrame(() => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      if (wide || panel) document.querySelector('.evidence').scrollTo({ top: 0, behavior });
      else document.getElementById('evidence')?.scrollIntoView({ block: 'start', behavior });
    });
  }
  const showAllEvidence = () => {
    setEvidenceAll(true);
    setDocFocus(null);
  };
  function clearFilters() {
    setDocFocus(null);
    setKeyword('');
    setKind('');
    setFrom('');
    setTo('');
    setApplied(a => ({ ...a, keyword: '', kind: '', from: '', to: '' }));
    setResult(documents);
    setNotice('Đã xóa bộ lọc.');
  }
  // Bấm Hỏi là thu đầu trang ngay, không đợi kết quả; focus về nút Sửa câu hỏi để không mất vị trí bàn phím.
  function search(event) {
    event.preventDefault();
    runSearch(question, floating);
  }
  // Hỏi tiếp (mobile): câu mới chạy như một lượt tìm mới với bộ lọc đang áp dụng, thay kết quả hiện tại và đưa người đọc về đầu kết quả.
  function askFollowUp(event) {
    event.preventDefault();
    const q = followUp.trim();
    if (!q) {
      followField.current?.focus();
      return;
    }
    draft.current = null;
    setQuestion(q);
    setFollowUp('');
    followField.current?.blur();
    runSearch(q, true);
  }
  function runSearch(q, toResults) {
    if (from && to && from > to) {
      setNotice('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
      return;
    }
    setBusy(true);
    setNotice('Đang lọc dữ liệu mẫu…');
    setApplied({ question: q, keyword, kind, from, to });
    setEditing(false);
    // Hỏi từ giữa trang: đưa người đọc về đầu kết quả mới.
    requestAnimationFrame(() => {
      if (toResults) {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth';
        document.getElementById('results')?.scrollIntoView({ block: 'start', behavior });
      }
      editButton.current?.focus({ preventScroll: true });
    });
    searchDocuments({ keyword, kind, from, to }).then(filtered => {
      setResult(filtered);
      setShowAnswer(llm && tab === 'qa');
      setBusy(false);
      setNotice(
        'Đang hiển thị dữ liệu mẫu từ PDF. Chưa kết nối API tra cứu hoặc LLM để trả lời câu hỏi mới.',
      );
    });
  }
  function downloadReport() {
    const url = URL.createObjectURL(
        new Blob(
          [
            'BÁO CÁO TỔNG HỢP — DỮ LIỆU MẪU TỪ PDF\n\n' +
              result.map(d => [d.code, d.date, d.description].join(' — ')).join('\n\n'),
          ],
          { type: 'text/plain;charset=utf-8' },
        ),
      ),
      a = document.createElement('a');
    a.href = url;
    a.download = 'bao-cao-tong-hop.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function selectMode(id) {
    setTab(id);
    setNotice(id === 'report' ? 'Báo cáo tổng hợp từ các văn bản mẫu trong PDF.' : '');
  }
  // Khớp hai cột: khi có cột bằng chứng (desktop) hoặc panel (dưới 1100px), sau khi người dùng mở một đơn vị, bằng chứng chỉ hiện nguồn của các đơn vị đang mở.
  const openGroups = groups.filter(g => expanded.includes(g.unit));
  const unitMatching =
    (wide || panel) &&
    tab === 'qa' &&
    showAnswer &&
    !evidenceAll &&
    openGroups.length > 0 &&
    !allOpen;
  const matching = !!docFocus || unitMatching;
  const contextSources = new Set(
    docFocus ? docFocus.list : openGroups.flatMap(g => g.items.map(i => i.src)),
  );
  const shownSources = sources.map(s => s.n).filter(n => !matching || contextSources.has(n));
  const shownDocs =
    unitMatching && !docFocus
      ? result.filter(d => citedBy(d.code).some(n => contextSources.has(n)))
      : result;
  const contextName =
    openGroups.length > 2
      ? `${openGroups[0].unit} và ${openGroups.length - 1} đơn vị khác`
      : openGroups.map(g => g.unit).join(' và ');
  const tabCount = (shown, total) => (matching && shown !== total ? `${shown}/${total}` : total);
  const evidenceTabs = [
    ['docs', 'Văn bản', tabCount(shownDocs.length, result.length)],
    ['sources', 'Đoạn nguồn', tabCount(shownSources.length, sources.length)],
    ['relations', 'Quan hệ', relationRows.length],
  ];
  // Số trên dải theo đúng bộ lọc của bằng chứng: "đang hiện/tổng" khi đang khớp với các ý đang mở hoặc một văn bản.
  const railCount = tabCount(shownDocs.length, result.length);
  const railContext = matching ? ` của ${docFocus ? docFocus.code : contextName}` : '';
  const railSummary = matching
    ? `${shownDocs.length}/${result.length} văn bản, ${shownSources.length}/${sources.length} đoạn nguồn`
    : `${result.length} văn bản, ${sources.length} đoạn nguồn`;
  const visibleDocs = allDocs ? shownDocs : shownDocs.slice(0, DOC_PREVIEW);

  // Mỗi đơn vị là một dòng sổ: lề trái ghi các nguồn mà đơn vị dùng (dữ liệu thật), cột chính là tên và các ý.
  // Nội dung đơn vị đang đóng vẫn được render để mở/đóng có chuyển động, nhưng bị inert và ẩn khỏi trình đọc màn hình.

  const identity =
    user === 'leader'
      ? 'lanh_dao_tp: 177 đơn vị, mức mật tối đa tuyet_mat'
      : user === 'staff'
        ? 'chuyen_vien: người dùng giả lập — chưa kết nối phân quyền'
        : 'lanh_dao_don_vi: người dùng giả lập — chưa kết nối phân quyền';
  const userSelect = (
    <select value={user} onChange={e => setUser(e.target.value)}>
      <option value="leader">Lãnh đạo thành phố</option>
      <option value="staff">Chuyên viên</option>
      <option value="unit">Lãnh đạo đơn vị</option>
    </select>
  );
  const modeNav = (
    <nav aria-label="Chế độ tra cứu" inert={behind}>
      <div
        role="tablist"
        aria-label="Chế độ tra cứu"
        onKeyDown={e => moveTab(e, ['qa', 'report'], tab, selectMode)}
      >
        {[
          ['qa', 'Hỏi đáp'],
          ['report', 'Báo cáo tổng hợp'],
        ].map(([id, title]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls="results"
            tabIndex={tab === id ? 0 : -1}
            className="tab"
            onClick={() => selectMode(id)}
          >
            {title}
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <main
      className={
        EMBED
          ? `embed ${wide ? 'embed-wide' : ''}`
          : `${editing ? '' : `compact ${barHidden ? 'bar-hidden' : ''}`} ${mobile ? 'mobile' : ''}`
      }
    >
      {/* Khi đang sửa câu hỏi: đầu trang đầy đủ. Khi đang tìm hoặc đã có kết quả: gộp vào thanh câu hỏi. */}
      {EMBED ? (
        <>
          <h1 className="sr-only">Tra cứu và tổng hợp văn bản</h1>
          <p className="embed-note">Dữ liệu mẫu chép từ PDF, chưa kết nối API tra cứu hoặc LLM.</p>
        </>
      ) : editing && !floating ? (
        <>
          <header inert={behind}>
            <div className="brand">
              <h1>Tra cứu và tổng hợp văn bản</h1>
              <p>
                Bản demo. Chưa có Keycloak nên chọn người dùng giả lập, mọi lượt vẫn qua Adapter
                quyền.
              </p>
              <p id="identity">{identity}</p>
            </div>
            <label className="user">Người dùng giả lập{userSelect}</label>
          </header>
          {modeNav}
        </>
      ) : (
        <h1 className="sr-only">Tra cứu và tổng hợp văn bản</h1>
      )}

      {!EMBED &&
        (editing ? (
          <QueryForm
            search={search}
            behind={behind}
            floating={floating}
            cancelEdit={cancelEdit}
            questionField={questionField}
            question={question}
            setQuestion={setQuestion}
            busy={busy}
            auto={auto}
            setAuto={setAuto}
            setNotice={setNotice}
            llm={llm}
            setLlm={setLlm}
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            filterCount={filterCount}
            keyword={keyword}
            setKeyword={setKeyword}
            kind={kind}
            setKind={setKind}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            clearFilters={clearFilters}
          />
        ) : (
          // Thanh câu hỏi: chế độ tra cứu, câu hỏi đang được trả lời, người dùng giả lập; bám đầu trang khi cuộn.
          <QueryBar
            barHidden={barHidden}
            behind={behind}
            setBarHidden={setBarHidden}
            modeNav={modeNav}
            applied={applied}
            editQuestion={editQuestion}
            appliedFilters={appliedFilters}
            clearFilters={clearFilters}
            busy={busy}
            editButton={editButton}
            identity={identity}
            userSelect={userSelect}
          />
        ))}
      {/* Hỏi tiếp (mobile): ô hỏi câu mới ghim đáy màn hình; ẩn khi đang sửa câu hỏi hoặc mở panel bằng chứng. */}
      {mobile && !editing && (
        <FollowUpForm
          barHidden={barHidden}
          askFollowUp={askFollowUp}
          behind={behind}
          setBarHidden={setBarHidden}
          followField={followField}
          followUp={followUp}
          setFollowUp={setFollowUp}
          busy={busy}
        />
      )}
      {notice && (
        <p id="notice" role="status" inert={behind}>
          {notice}
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <div
        id="results"
        role={EMBED ? undefined : 'tabpanel'}
        aria-labelledby={EMBED ? undefined : `tab-${tab}`}
        aria-busy={busy || undefined}
        className={`results ${solo ? 'solo' : ''} ${wide && !evidenceShown ? 'railed' : ''}`}
      >
        {!panel && evidenceShown && (
          <a className="skip-link" href="#evidence">
            Chuyển tới phần bằng chứng
          </a>
        )}
        {tab === 'qa' && showAnswer && (
          <AnswerSection
            behind={behind}
            allOpen={allOpen}
            setExpanded={setExpanded}
            expanded={expanded}
            readingAt={readingAt}
            setReadingAt={setReadingAt}
            toggleGroup={toggleGroup}
            bulletProps={bulletProps}
          />
        )}

        {tab === 'report' && (
          <ReportSection
            behind={behind}
            result={result}
            bulletProps={bulletProps}
            downloadReport={downloadReport}
          />
        )}

        {behind && <div className="scrim" aria-hidden="true" onClick={closePanel} />}
        <EvidenceDrawer
          behind={behind}
          docking={docking}
          wide={wide}
          setDocking={setDocking}
          evidenceShown={evidenceShown}
          panel={panel}
          closePanel={closePanel}
          solo={solo}
          collapseEvidence={collapseEvidence}
          evidenceTablist={evidenceTablist}
          evidence={evidence}
          setEvidence={setEvidence}
          evidenceTabs={evidenceTabs}
          ink={ink}
          matching={matching}
          docFocus={docFocus}
          contextName={contextName}
          showAllEvidence={showAllEvidence}
          contextSources={contextSources}
          shownDocs={shownDocs}
          visibleDocs={visibleDocs}
          openDocument={openDocument}
          showDocSources={showDocSources}
          allDocs={allDocs}
          setAllDocs={setAllDocs}
          unitMatching={unitMatching}
          result={result}
          openGroups={openGroups}
          clearFilters={clearFilters}
          shownSources={shownSources}
          activeSource={activeSource}
          pull={pull}
          tab={tab}
          showAnswer={showAnswer}
          showPoints={showPoints}
          second={second}
          setSecond={setSecond}
          openCode={openCode}
        />
        {/* Dải bằng chứng: ≥1100px (hoặc khung nhúng ≥720px) khi đã thu gọn; dưới 1100px khi panel đóng. */}
        {!evidenceShown && (
          <button
            type="button"
            ref={railButton}
            className="evidence-rail"
            aria-expanded="false"
            aria-controls="evidence"
            aria-label={`Mở bằng chứng${railContext}: ${railSummary}`}
            title={railSummary}
            onClick={() => {
              openEvidence();
              if (wide)
                requestAnimationFrame(() =>
                  document.getElementById('evidence')?.focus({ preventScroll: true }),
                );
            }}
          >
            <span className="rail-label">Bằng chứng</span>
            <span className="count" key={railCount}>
              {railCount}
            </span>
          </button>
        )}
      </div>

      <DocumentDialog dialog={dialog} reportHeight={reportHeight} selected={selected} />
    </main>
  );
}
