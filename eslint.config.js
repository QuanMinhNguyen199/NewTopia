import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist', 'node_modules', 'public', '.impeccable', '.hallmark'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      // Hai luật hooks kinh điển. Các luật của React Compiler trong bộ "recommended" của plugin bản 7
      // (set-state-in-effect, immutability, refs) chưa bật: cần một đợt viết lại luồng state riêng.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // JSX dùng biến qua thẻ (<Bullet/>), rule gốc không thấy nên bỏ qua biến viết hoa.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^_' }],
      // try { localStorage } catch {} là có chủ ý: trang phải chạy khi bộ nhớ trình duyệt bị chặn.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Script kiểm thử chạy trên Node, nhưng phần page.evaluate(...) chạy trong trình duyệt.
    files: ['*.mjs', 'tests/**/*.mjs', 'eslint.config.js', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: js.configs.recommended.rules,
  },
];
