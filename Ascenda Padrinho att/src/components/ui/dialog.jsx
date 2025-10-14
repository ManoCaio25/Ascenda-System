import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@padrinho/utils';

const DialogContext = React.createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  const value = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);
  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const container = typeof document !== 'undefined' ? document.body : null;

  if (!open || !container) return null;

  const handleBackdropClick = () => {
    onOpenChange?.(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={handleBackdropClick} />
      <div
        role="dialog"
        className={cn('relative z-10 w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-e3', className)}
        {...props}
      >
        {children}
      </div>
    </div>,
    container,
  );
}

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 border-b border-border p-6', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse gap-2 border-t border-border p-6 pt-4 sm:flex-row sm:justify-end', className)} {...props} />
);

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn('text-xl font-semibold text-primary', className)} {...props} />
);

export const DialogDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted', className)} {...props} />
);

