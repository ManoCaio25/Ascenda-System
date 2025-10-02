import React from 'react';
import { cn } from '@/utils';

export const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-medium text-secondary', className)}
      {...props}
    />
  );
});

