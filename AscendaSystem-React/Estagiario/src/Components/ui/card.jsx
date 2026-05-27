import React from "react";

export function Card({ className = "", children }) {
  return <div className={`rounded-xl border border-slate-700 bg-slate-900 ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }) {
  return <div className={`border-b border-slate-700 p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ className = "", children }) {
  return <p className={`text-sm text-slate-400 ${className}`}>{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export default Card;
