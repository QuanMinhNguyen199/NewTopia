import { useState, useEffect } from 'react';
import { EMBED } from '../lib/config.js';
export function useReadingViewport({ editing, mobile }) {
  // Thanh câu hỏi (và ô Hỏi tiếp trên mobile): cuộn xuống để đọc thì trượt khuất, cuộn lên thì hiện lại.
  // Luôn hiện ở đầu trang, ở cuối trang (lúc thường muốn hỏi tiếp) và khi đang thao tác trong thanh.
  const [barHidden, setBarHidden] = useState(false);
  useEffect(() => {
    if (EMBED || editing) {
      setBarHidden(false);
      return;
    }
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY,
        delta = y - last;
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 40;
      const busyHere = document.activeElement?.closest?.('.query-bar, .follow-up');
      if (y < 80 || atEnd) setBarHidden(false);
      else if (delta > 8 && !busyHere) setBarHidden(true);
      else if (delta < -8) setBarHidden(false);
      if (Math.abs(delta) > 8 || y < 80) last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [editing]);
  // Ô Hỏi tiếp trên mobile bám ngay trên bàn phím: đo phần màn hình bàn phím che (visualViewport).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!mobile || !vv) return;
    const update = () =>
      document.documentElement.style.setProperty(
        '--kb',
        `${Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))}px`,
      );
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.removeProperty('--kb');
    };
  }, [mobile]);

  return { barHidden, setBarHidden };
}
