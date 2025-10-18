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
  const tokens = className.split(/\s+/).filter(Boolean);
  const hasCustomMaxWidth = tokens.some((token) =>
    token.startsWith('max-w-') || token.startsWith('!max-w-') || token.startsWith('max-w[') || token.startsWith('!max-w['),
  );

  const classes = ['max-h-full', 'w-full', 'overflow-y-auto', 'rounded-xl', 'bg-slate-900', 'shadow-xl'];
  if (!hasCustomMaxWidth) {
    classes.push('max-w-2xl');
  }
  if (className) {
    classes.push(className);
  }

  return <div className={classes.join(' ')}>{children}</div>;
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
