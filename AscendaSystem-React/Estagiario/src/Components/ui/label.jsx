import React from "react";

export function Label({ className = "", htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-slate-300 ${className}`}>
      {children}
    </label>
  );
}

export default Label;
