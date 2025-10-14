import React from 'react';
import { cn } from '@padrinho/utils';

const TabsContext = React.createContext(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
}

export function Tabs({ value, defaultValue, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (nextValue) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({ value: currentValue, setValue }),
    [currentValue, setValue],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export const TabsList = ({ className, ...props }) => (
  <div className={cn('inline-flex w-full items-center justify-start rounded-xl bg-surface2 p-1', className)} {...props} />
);

export const TabsTrigger = React.forwardRef(function TabsTrigger({ className, value, ...props }, ref) {
  const { value: active, setValue } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      ref={ref}
      onClick={() => setValue(value)}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        isActive ? 'bg-surface text-primary shadow-e1' : 'text-muted hover:text-primary',
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = ({ className, value, ...props }) => {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return <div className={cn('mt-4', className)} {...props} />;
};

