import React from 'react';
import { reportItems } from '../lib/documents.js';
import { Bullet } from './Bullet.jsx';
import { Icon } from './Icon.jsx';
export function ReportSection({ behind, result, bulletProps, downloadReport }) {
  return (
    <section className="answer" aria-labelledby="report-title" inert={behind}>
      <div className="section-head">
        <h2 id="report-title">Báo cáo tổng hợp</h2>
      </div>
      <p className="report-lead">
        Tổng hợp {result.length} văn bản mẫu về triển khai Nghị quyết 57.
      </p>
      <ul className="report-list">
        {reportItems.map(item => (
          <Bullet key={item.id} {...bulletProps(item)} />
        ))}
      </ul>
      <button type="button" className="btn" onClick={downloadReport}>
        <Icon name="download" />
        Tải báo cáo
      </button>
    </section>
  );
}
