import React from 'react';
import { cn } from '@padrinho/utils';

export const Card = ({ className, ...props }) => (
  <div className={cn('rounded-2xl border border-border bg-surface shadow-e1', className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1 p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-primary', className)} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

