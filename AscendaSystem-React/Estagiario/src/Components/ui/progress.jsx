import React from "react";

export function Progress({ value = 0, className = "" }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full rounded-full bg-slate-800 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-orange-400"
        style={{ width: `${clamped}%`, minHeight: "0.5rem" }}
      />
    </div>
  );
}

export default Progress;
