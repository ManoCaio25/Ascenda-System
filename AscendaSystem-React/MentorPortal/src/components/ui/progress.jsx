import React from 'react';
import { cn } from '@padrinho/utils';

export const Progress = React.forwardRef(function Progress({ className, value = 0, max = 100, ...props }, ref) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-surface2', className)}
      {...props}
    >
      <div
        className="h-full bg-brand transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

