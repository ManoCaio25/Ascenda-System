import React from 'react';
import { cn } from '@padrinho/utils';

const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  default: 'bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand',
  outline: 'border border-border text-primary hover:bg-surface2 focus-visible:ring-brand',
  ghost: 'text-secondary hover:bg-surface2 focus-visible:ring-border',
};

const sizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', size = 'default', asChild = false, children, ...props },
  ref,
) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: cn(
        children.props.className,
        baseStyles,
        variants[variant] ?? variants.default,
        sizes[size] ?? sizes.default,
        className,
      ),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant] ?? variants.default, sizes[size] ?? sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
});

