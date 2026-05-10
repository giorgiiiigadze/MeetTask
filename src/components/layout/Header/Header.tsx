"use client";

import { useSidebar } from "../Sidebar/SidebarContext";

import { ThemeToggle } from "../../theming/ThemeToggle";

export default function Header(){
    const { onMouseEnter, onMouseLeave, toggle } = useSidebar();

    return (
        <header className="w-full h-11 flex items-center justify-between pl-3 pr-2.5">
            <button
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={toggle}
            >
                Toggle
            </button>

            <ThemeToggle />
        </header>
    )
}