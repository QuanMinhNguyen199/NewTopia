import React from 'react';
import { answers } from '../lib/fixture.js';
import { groups } from '../lib/documents.js';
import { AnswerUnit } from './AnswerUnit.jsx';
export function AnswerSection({
  behind,
  allOpen,
  setExpanded,
  expanded,
  readingAt,
  setReadingAt,
  toggleGroup,
  bulletProps,
}) {
  return (
    <section className="answer" aria-labelledby="answer-title" inert={behind}>
      <div className="section-head">
        <h2 id="answer-title">Câu trả lời</h2>
        <button
          type="button"
          className="link-btn"
          aria-expanded={allOpen}
          onClick={() => setExpanded(allOpen ? [groups[0].unit] : groups.map(g => g.unit))}
        >
          {allOpen ? 'Thu gọn tất cả' : `Mở cả ${answers.length} ý`}
        </button>
      </div>
      <div className="unit-list">
        {groups.map(group => (
          <AnswerUnit
            key={group.unit}
            group={group}
            expanded={expanded}
            readingAt={readingAt}
            setReadingAt={setReadingAt}
            toggleGroup={toggleGroup}
            bulletProps={bulletProps}
          />
        ))}
      </div>
      <p className="footnote">1 ý bị bỏ vì không có nguồn hợp lệ.</p>
    </section>
  );
}
