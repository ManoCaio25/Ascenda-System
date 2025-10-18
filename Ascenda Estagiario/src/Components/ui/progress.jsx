import React from "react";

export function Progress({ value = 0, className = "" }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tokens = className.split(/\s+/).filter(Boolean);
  const hasCustomBackground = tokens.some(
    (token) => token.startsWith('bg-') || token.startsWith('!bg-') || token.startsWith('bg[') || token.startsWith('!bg['),
  );

  const containerClasses = ['w-full', 'rounded-full'];
  if (!hasCustomBackground) {
    containerClasses.push('bg-slate-800');
  }
  if (className) {
    containerClasses.push(className);
  }

  return (
    <div className={containerClasses.join(' ')}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-orange-400"
        style={{ width: `${clamped}%`, minHeight: '0.5rem' }}
      />
    </div>
  );
}

export default Progress;
