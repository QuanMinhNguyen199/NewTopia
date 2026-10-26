import { useState, useEffect } from 'react';

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  // Nghe thêm resize: sự kiện change của matchMedia có thể bị bỏ lỡ khi kích thước đổi liên tiếp.
  useEffect(() => {
    const media = window.matchMedia(query),
      update = () => setMatch(media.matches);
    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    update();
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, [query]);
  return match;
}
