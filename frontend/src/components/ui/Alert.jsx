import React from 'react';

const Alert = ({ type = 'info', message, className = '', onClose }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: '⚠️',
    success: '✅',
    warning: '⚡',
    info: 'ℹ️',
  };

  return (
    <div
      className={`flex items-start justify-between p-3.5 border rounded-lg text-sm ${styles[type]} ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-2.5">
        <span className="text-base leading-none">{icons[type]}</span>
        <span className="leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-slate-600 font-semibold"
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
