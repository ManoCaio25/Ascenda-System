import React from 'react';
import { cn } from '@padrinho/utils';

const SidebarContext = React.createContext({ isOpen: false, toggle: () => {}, setOpen: () => {} });

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = React.useMemo(
    () => ({
      isOpen,
      toggle: () => setIsOpen((prev) => !prev),
      setOpen: setIsOpen,
    }),
    [isOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar components must be used within <SidebarProvider>');
  }
  return context;
}

export function Sidebar({ className, children }) {
  const { isOpen, setOpen } = useSidebar();

  const content = (
    <nav className={cn('flex h-full w-72 flex-col bg-surface', className)}>{children}</nav>
  );

  return (
    <>
      <div className="hidden h-screen w-72 flex-shrink-0 md:flex">{content}</div>
      <div className={cn('fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden', isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')} onClick={() => setOpen(false)} />
      <div className={cn('fixed inset-y-0 left-0 z-50 w-72 max-w-full transform bg-surface shadow-e3 transition-transform md:hidden', isOpen ? 'translate-x-0' : '-translate-x-full')}>
        {content}
      </div>
    </>
  );
}

export const SidebarHeader = ({ className, ...props }) => (
  <div className={cn('p-4', className)} {...props} />
);

export const SidebarFooter = ({ className, ...props }) => (
  <div className={cn('mt-auto p-4', className)} {...props} />
);

export const SidebarContent = ({ className, ...props }) => (
  <div className={cn('flex-1 overflow-y-auto', className)} {...props} />
);

export const SidebarGroup = ({ className, ...props }) => (
  <div className={cn('mb-4', className)} {...props} />
);

export const SidebarGroupLabel = ({ className, ...props }) => (
  <div className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted', className)} {...props} />
);

export const SidebarGroupContent = ({ className, ...props }) => (
  <div className={cn('space-y-1', className)} {...props} />
);

export const SidebarMenu = ({ className, ...props }) => (
  <ul className={cn('space-y-1', className)} {...props} />
);

export const SidebarMenuItem = ({ className, ...props }) => (
  <li className={cn('list-none', className)} {...props} />
);

export const SidebarMenuButton = React.forwardRef(function SidebarMenuButton(
  { className, asChild = false, children, onClick, ...props },
  ref,
) {
  const { setOpen } = useSidebar();

  const handleClick = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: (event) => {
        children.props.onClick?.(event);
        handleClick(event);
      },
      className: cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-surface2 hover:text-primary',
        children.props.className,
        className,
      ),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn('flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-surface2 hover:text-primary', className)}
      {...props}
    >
      {children}
    </button>
  );
});

export function SidebarTrigger({ className, children, ...props }) {
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn('inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-sm text-secondary hover:bg-surface2', className)}
      {...props}
    >
      {children ?? <span className="text-lg" aria-hidden="true">☰</span>}
      <span className="sr-only">Abrir menu</span>
    </button>
  );
}

export function SidebarTriggerIcon(props) {
  return <span className="text-lg" {...props}>☰</span>;
}

