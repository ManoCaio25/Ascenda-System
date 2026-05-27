import React from "react";

export function Switch({ checked = false, onCheckedChange, className = "", ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        {...props}
      />
      <span
        className={`flex h-5 w-9 items-center rounded-full border border-slate-600 px-1 transition-colors ${
          checked ? 'bg-purple-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </span>
    </label>
  );
}

export default Switch;
