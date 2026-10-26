import { useState, useLayoutEffect } from 'react';

export function useTabIndicator({
  evidenceTablist,
  evidence,
  wide,
  result,
  expanded,
  evidenceAll,
  evidenceShown,
}) {
  // Vạch mực dưới tab bằng chứng: đo tab đang chọn để vạch trượt tới đúng vị trí và độ rộng.
  const [ink, setInk] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const tab = evidenceTablist.current?.querySelector('[aria-selected="true"]');
      if (tab) setInk({ x: tab.offsetLeft, w: tab.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [evidenceTablist, evidence, wide, result.length, expanded, evidenceAll, evidenceShown]);

  return { ink };
}
