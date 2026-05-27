import React from 'react';
import { cn } from '@padrinho/utils';

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn('flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  );
});

