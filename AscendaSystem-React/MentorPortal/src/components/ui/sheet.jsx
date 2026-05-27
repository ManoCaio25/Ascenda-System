import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@padrinho/utils';

const SheetContext = React.createContext({ open: false, onOpenChange: () => {} });

export function Sheet({ open, onOpenChange, children }) {
  const value = React.useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within <Sheet>');
  }
  return context;
}

export function SheetContent({ className, children, side = 'right', ...props }) {
  const { open, onOpenChange } = useSheetContext();
  const container = typeof document !== 'undefined' ? document.body : null;

  if (!open || !container) return null;

  const close = () => onOpenChange?.(false);

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={close} />
      <div
        className={cn(
          'relative z-10 h-full w-full max-w-lg bg-surface shadow-e3 transition-transform',
          side === 'right' ? 'ml-auto' : 'mr-auto',
          className,
        )}
        role="dialog"
        {...props}
      >
        {children}
      </div>
    </div>,
    container,
  );
}

export const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 border-b border-border p-6', className)} {...props} />
);

export const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn('text-lg font-semibold text-primary', className)} {...props} />
);

export const SheetDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted', className)} {...props} />
);

