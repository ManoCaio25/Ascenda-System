import React, { createContext, useContext } from "react";

const DialogContext = createContext({ onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        {children}
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ className = "", children }) {
  return <div className={`max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-slate-900 shadow-xl ${className}`}>{children}</div>;
}

export function DialogHeader({ className = "", children }) {
  return <div className={`border-b border-slate-700 p-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ className = "", children }) {
  return <h2 className={`text-xl font-semibold text-white ${className}`}>{children}</h2>;
}

export function DialogDescription({ className = "", children }) {
  return <p className={`text-sm text-slate-400 ${className}`}>{children}</p>;
}

export default Dialog;
