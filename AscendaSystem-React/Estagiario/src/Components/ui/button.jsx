import React from "react";

const variantClasses = {
  solid: "bg-purple-600 text-white shadow-lg shadow-purple-500/25 hover:bg-purple-500", 
  outline: "border border-purple-500 text-purple-200 hover:bg-purple-500/10",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-slate-800/40 light:hover:bg-slate-100",
  gradient: "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-400/60",
};

const sizeClasses = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({ className = "", variant = "solid", size = "md", ...props }) {
  const resolvedVariant = variant === "default" ? "solid" : variant;
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/60 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyle = variantClasses[resolvedVariant] || variantClasses.solid;
  const sizeStyle = sizeClasses[size] || sizeClasses.md;

  return <button className={`${base} ${variantStyle} ${sizeStyle} ${className}`} {...props} />;
}

export default Button;
