import { useState, useRef, useEffect } from 'react';
import { EMBED, DOCKED_KEY, readDocked } from '../lib/config.js';
export function useEvidenceDrawer({ wide, solo }) {
  const [docking, setDocking] = useState(false),
    [docked, setDocked] = useState(readDocked),
    [panelOpen, setPanelOpen] = useState(false);
  const railButton = useRef(null),
    opener = useRef(null);
  // Dưới 1100px (không nhúng): bằng chứng là panel trượt từ phải, mở bằng dải bám mép phải. Trang không có câu trả lời thì để bằng chứng nằm trong trang.
  const panel = !EMBED && !wide && !solo;
  const evidenceShown = wide ? docked || solo : panel ? panelOpen : true;
  const behind = panel && panelOpen;
  // Panel bằng chứng (dưới 1100px): mở thì đưa focus vào panel.
  useEffect(() => {
    if (behind) document.getElementById('evidence')?.focus({ preventScroll: true });
  }, [behind]);
  function dock(open) {
    setDocked(open);
    setDocking(open);
    try {
      localStorage.setItem(DOCKED_KEY, open ? '1' : '0');
    } catch {}
  }
  function openEvidence() {
    if (wide && !docked) dock(true);
    if (panel && !panelOpen) {
      opener.current =
        document.activeElement instanceof HTMLElement && document.activeElement !== document.body
          ? document.activeElement
          : railButton.current;
      setPanelOpen(true);
    }
  }
  function closePanel() {
    setPanelOpen(false);
    requestAnimationFrame(() =>
      (opener.current?.isConnected ? opener.current : railButton.current)?.focus({
        preventScroll: true,
      }),
    );
  }
  function collapseEvidence() {
    dock(false);
    requestAnimationFrame(() => railButton.current?.focus());
  }

  return {
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
  };
}
