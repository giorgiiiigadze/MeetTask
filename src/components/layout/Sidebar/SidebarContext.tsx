"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SidebarContextValue {
  isHovered: boolean;
  isOpen: boolean;
  toggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <SidebarContext.Provider value={{ isHovered, isOpen, toggle, onMouseEnter, onMouseLeave }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return ctx;
}