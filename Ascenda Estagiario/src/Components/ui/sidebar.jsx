import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext({ isOpen: true, toggle: () => {} });

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen((prev) => !prev);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className = "", children }) {
  const { isOpen } = useContext(SidebarContext);
  return (
    <aside className={`${className} ${isOpen ? '' : 'hidden md:block'}`}>
      {children}
    </aside>
  );
}

export function SidebarContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroup({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroupContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarGroupLabel({ className = "", children }) {
  return <p className={className}>{children}</p>;
}

export function SidebarMenu({ className = "", children }) {
  return <nav className={className}>{children}</nav>;
}

export function SidebarMenuItem({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarMenuButton({ className = "", active = false, children, ...props }) {
  const stateClass = active ? 'bg-purple-600/20 text-white' : 'hover:bg-purple-600/10 text-slate-300';
  return (
    <button className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${stateClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SidebarHeader({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarFooter({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

export function SidebarTrigger({ className = "" }) {
  const { toggle } = useContext(SidebarContext);
  return (
    <button onClick={toggle} className={`rounded-md border border-slate-600 bg-slate-900 p-2 text-slate-200 ${className}`}>
      ☰
    </button>
  );
}

export default Sidebar;
