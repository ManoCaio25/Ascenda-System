import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60 transition-shadow ${className}`}
      {...props}
    />
  );
}

export default Textarea;
