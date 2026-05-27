import React from 'react';
import { cn } from '@padrinho/utils';

export const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn('flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  );
});

