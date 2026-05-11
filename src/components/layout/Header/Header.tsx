"use client";

import { useSidebar } from "../Sidebar/SidebarContext";

import { ThemeToggle } from "../../theming/ThemeToggle";

import { RxHamburgerMenu } from "react-icons/rx";

export default function Header(){
    const { onMouseEnter, onMouseLeave, toggle } = useSidebar();

    return (
        <header className="w-full h-11 flex items-center justify-between pl-3 pr-2.5">
            <button
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={toggle}
                className="cursor-pointer p-1 rounded-md hover:bg-[var(--color-state-hover)]"
            >
                <RxHamburgerMenu />
            </button>

            <ThemeToggle />
        </header>
    )
}