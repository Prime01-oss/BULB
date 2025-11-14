import React from 'react';

// --- Elegant Minimal Icons ---
const MinimizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M1 6H11" strokeLinecap="round" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
    <rect x="1.5" y="1.5" width="9" height="9" rx="1" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M1 1L11 11M1 11L11 1" strokeLinecap="round" />
  </svg>
);

export function WindowControls() {
  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => window.electronAPI.maximizeWindow();
  const handleClose = () => window.electronAPI.closeWindow();

  // --- Base button styles ---
  const baseBtn =
    'no-drag w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150 ' +
    'text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95';

  return (
    <div
      className="flex items-center space-x-2 px-2 py-1 rounded-xl 
                 backdrop-blur-md bg-white/60 dark:bg-zinc-800/60 
                 border border-gray-200/60 dark:border-zinc-700/50 shadow-sm"
    >
      {/* Minimize */}
      <button
        onClick={handleMinimize}
        className={`${baseBtn} hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600`}
        title="Minimize"
      >
        <MinimizeIcon />
      </button>

      {/* Maximize */}
      <button
        onClick={handleMaximize}
        className={`${baseBtn} hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600`}
        title="Maximize"
      >
        <MaximizeIcon />
      </button>

      {/* Close */}
      <button
        onClick={handleClose}
        className={`${baseBtn} hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600`}
        title="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
