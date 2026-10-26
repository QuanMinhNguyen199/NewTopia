import React from 'react';

// Biểu tượng vẽ tay, cùng nét 1.75px, theo màu chữ.
const ICONS = {
  down: <path d="M4 6l4 4 4-4" />,
  download: (
    <>
      <path d="M8 2.5v8M4.75 7.5L8 10.75l3.25-3.25" />
      <path d="M3 13.5h10" />
    </>
  ),
};
export const Icon = ({ name }) => (
  <svg
    className="icon"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);
