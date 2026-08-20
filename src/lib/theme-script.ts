/**
 * Chạy trước khi trình duyệt vẽ khung hình đầu tiên để tránh nháy màu.
 * Modern Gold Ledger lấy chế độ tối làm mặc định; lựa chọn đã lưu luôn thắng.
 */
export const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem('kim-tai-theme');
      if (saved !== 'dark' && saved !== 'light') saved = null;
      var dark = saved !== 'light';
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    } catch (_) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
`;
