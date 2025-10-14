import React from 'react';
import { cn } from '@padrinho/utils';

export const Checkbox = React.forwardRef(function Checkbox(
  { className, checked, defaultChecked, onCheckedChange, ...props },
  ref,
) {
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
    <label className={cn('relative inline-flex items-center', className)}>
      <input
        type="checkbox"
        ref={ref}
        checked={current}
        onChange={toggle}
        className="peer h-4 w-4 rounded border border-border bg-surface text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        {...props}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-white peer-checked:opacity-100 opacity-0">✓</span>
    </label>
  );
});

