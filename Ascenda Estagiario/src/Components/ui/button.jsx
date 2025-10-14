import React from "react";

export function Button({ className = "", variant = "solid", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/60";
  const styles = variant === "outline"
    ? "border border-purple-500 text-purple-300 hover:bg-purple-500/10"
    : "bg-purple-600 text-white hover:bg-purple-500";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export default Button;
