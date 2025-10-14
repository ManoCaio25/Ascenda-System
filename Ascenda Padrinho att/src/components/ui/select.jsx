import React from 'react';
import { cn } from '@padrinho/utils';

const SelectContext = React.createContext(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within <Select>');
  }
  return context;
}

const getTextFromChildren = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return String(child);
      if (React.isValidElement(child)) {
        return getTextFromChildren(child.props.children);
      }
      return '';
    })
    .join(' ')
    .trim();
};

export function Select({ value, defaultValue, onValueChange, children, className }) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? null);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  const [options, setOptions] = React.useState({});

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const registerOption = React.useCallback((optionValue, label) => {
    setOptions((prev) => ({ ...prev, [optionValue]: label }));
  }, []);

  React.useEffect(() => {
    if (currentValue != null && options[currentValue]) {
      setSelectedLabel(options[currentValue]);
    }
  }, [currentValue, options]);

  const selectValue = React.useCallback(
    (nextValue, label) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setSelectedLabel(label ?? options[nextValue] ?? '');
      onValueChange?.(nextValue);
      setOpen(false);
    },
    [isControlled, onValueChange, options],
  );

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      value: currentValue,
      selectedLabel,
      registerOption,
      selectValue,
    }),
    [open, currentValue, selectedLabel, registerOption, selectValue],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn('relative w-full', className)}>{children}</div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef(function SelectTrigger({ className, children, ...props }, ref) {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => setOpen(!open)}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary transition-colors hover:bg-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        className,
      )}
      aria-expanded={open}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2 overflow-hidden">{children}</div>
      <span className="ml-2 text-xs text-muted">▾</span>
    </button>
  );
});

export const SelectValue = ({ placeholder, className }) => {
  const { selectedLabel } = useSelectContext();
  const hasValue = Boolean(selectedLabel);
  return (
    <span className={cn('truncate', !hasValue && 'text-muted', className)}>
      {hasValue ? selectedLabel : placeholder || 'Selecione'}
    </span>
  );
};

export function SelectContent({ className, children }) {
  const { open } = useSelectContext();
  if (!open) return null;

  return (
    <div className={cn('absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-e2', className)}>
      <div className="max-h-60 overflow-auto py-1">{children}</div>
    </div>
  );
}

export function SelectItem({ className, value, children }) {
  const { value: selected, selectValue, registerOption } = useSelectContext();
  const label = React.useMemo(() => getTextFromChildren(children), [children]);

  React.useEffect(() => {
    registerOption(value, label);
  }, [registerOption, value, label]);

  const isSelected = selected === value;

  return (
    <button
      type="button"
      onClick={() => selectValue(value, label)}
      className={cn(
        'flex w-full items-center justify-start px-3 py-2 text-sm text-secondary hover:bg-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        isSelected && 'bg-surface2 text-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}

