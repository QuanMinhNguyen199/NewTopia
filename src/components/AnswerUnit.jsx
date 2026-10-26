import React from 'react';
import { sourceAt } from '../lib/fixture.js';
import { Icon } from './Icon.jsx';
import { Bullet } from './Bullet.jsx';
export function AnswerUnit({ group, expanded, readingAt, setReadingAt, toggleGroup, bulletProps }) {
  const open = expanded.includes(group.unit),
    panel = `unit-${group.items[0].id}`,
    srcs = [...new Set(group.items.map(i => i.src))];
  const reading = readingAt?.unit === group.unit ? readingAt.src : null;
  const pick = e => {
    const li = e.target.closest?.('li[data-src]');
    if (li) setReadingAt({ unit: group.unit, src: Number(li.dataset.src) });
  };
  return (
    <section className={`unit ${open ? 'open' : ''}`} key={group.unit}>
      {/* Nhãn nguồn giữ nguyên ở cả hai trạng thái; chi tiết chỉ mở bên dưới. */}
      <div className="unit-margin">
        <div className="margin-inner">
          <p className="margin-label">Nguồn {srcs.join(', ')}</p>
          {open && (
            <ul className="margin-srcs">
              {srcs.map(n => (
                <li key={n} className={reading === n ? 'is-current' : undefined}>
                  <span className="m-n">[{n}]</span>
                  <span className="m-doc">{sourceAt(n).code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="unit-main">
        <h3>
          <button
            type="button"
            className="unit-row"
            aria-expanded={open}
            aria-controls={panel}
            onClick={() => toggleGroup(group.unit)}
          >
            <span className="unit-label">
              <span className="unit-name">{group.unit}</span>
              <span className="unit-sub">
                {group.items.length} ý<span className="unit-src">, nguồn {srcs.join(', ')}</span>
              </span>
            </span>
            <Icon name="down" />
          </button>
        </h3>
        <div className="unit-body" id={panel} inert={!open} aria-hidden={!open}>
          <div className="unit-inner">
            <ul onMouseOver={pick} onFocus={pick} onMouseLeave={() => setReadingAt(null)}>
              {group.items.map(item => (
                <Bullet key={item.id} {...bulletProps(item)} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
