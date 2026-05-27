import React from 'react';
import { cn } from '@padrinho/utils';

const variants = {
  default: 'inline-flex items-center rounded-full border border-transparent bg-surface2 px-2.5 py-1 text-xs font-medium text-secondary',
  outline: 'inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-secondary',
};

export const Badge = ({ className, variant = 'default', ...props }) => (
  <span
    className={cn(variants[variant] ?? variants.default, className)}
    {...props}
  />
);

