export const WIDE = '(min-width: 1100px)',
  SPLIT = '(min-width: 768px)';
// Chế độ nhúng: trang nằm trong khung chat GeoAgent (iframe), hoặc mở với ?embed. Không có đầu trang và thanh câu hỏi
// vì câu hỏi đã là tin nhắn trong chat; bố cục tính theo bề rộng khung nhúng. ?mode=report mở thẳng báo cáo tổng hợp.
const params = new URLSearchParams(location.search);
export const EMBED = params.has('embed') || window.self !== window.top;
export const START_TAB = params.get('mode') === 'report' ? 'report' : 'qa';
export const EMBED_WIDE = '(min-width: 720px)',
  MOBILE = '(max-width: 767px)';
// Chiều cao nội dung gửi cho GeoAgent để khung iframe co giãn theo. Nên đặt VITE_GEOAGENT_ORIGIN khi có địa chỉ thật.
export const HOST_ORIGIN = import.meta.env.VITE_GEOAGENT_ORIGIN || '*';
export const DOCKED_KEY = 'van-ban:evidence-docked';
export const readDocked = () => {
  try {
    return localStorage.getItem(DOCKED_KEY) !== '0';
  } catch {
    return true;
  }
};
