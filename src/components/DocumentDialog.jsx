import React from 'react';

export function DocumentDialog({ dialog, reportHeight, selected }) {
  return (
    <dialog
      aria-labelledby="document-title"
      ref={dialog}
      onClose={() => reportHeight.current?.()}
      onClick={e => {
        if (e.target === dialog.current) dialog.current.close();
      }}
    >
      <div className="dialog-heading">
        <h2 id="document-title">{selected?.title}</h2>
        <button type="button" className="btn" onClick={() => dialog.current.close()}>
          Đóng
        </button>
      </div>
      <p className="dialog-meta">
        {selected?.meta ? `${selected.meta} ` : ''}Trích đoạn được hiển thị trong PDF mẫu.
      </p>
      <div id="dialog-content">{selected?.content}</div>
      <p className="dialog-foot">Bản giao diện mẫu chưa kết nối kho văn bản gốc.</p>
    </dialog>
  );
}
