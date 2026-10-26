import React from 'react';

export function SourceHead({ n, title }) {
  return (
    <div className="source-head">
      <span className="source-no">[{n}]</span>
      <strong className="doc-no">{title}</strong>
    </div>
  );
}
export function SourceMeta({ source }) {
  const { kind, date, pages, issuer } = source;
  return (
    <div className="source-meta">
      <span className="issuer">{issuer}</span>
      <span>
        {kind} ngày {date}, {pages}
      </span>
    </div>
  );
}
