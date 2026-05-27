import React from 'react';
import { cn } from '@padrinho/utils';

export const Switch = React.forwardRef(function Switch({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) {
  const [value, setValue] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const current = isControlled ? checked : value;

  const toggle = (event) => {
    const next = event.target.checked;
    if (!isControlled) {
      setValue(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <label className={cn('inline-flex cursor-pointer items-center', className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={current}
        onChange={toggle}
        className="peer sr-only"
        {...props}
      />
      <span className="relative h-5 w-9 rounded-full border border-border bg-surface transition-colors peer-checked:bg-brand">
        <span className="absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
});

