import React from 'react';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border border-default bg-[var(--sidebar-bg)]/90 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/80 focus:outline-none focus:ring-2 focus:ring-purple-500/60 transition-shadow ${className}`}
      {...props}
    />
  );
}

export default Textarea;
