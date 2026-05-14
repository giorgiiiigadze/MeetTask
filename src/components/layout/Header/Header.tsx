"use client";

import { useSidebar } from "../Sidebar/SidebarContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "../../ui/Button";

import { RxHamburgerMenu } from "react-icons/rx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuEmailHeader, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/DropdownMenu";
import { Download, Globe, HelpCircle, Info, Moon, Sun, Zap } from "lucide-react";

export default function Header() {
    const { onMouseEnter, onMouseLeave, toggle } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = mounted && theme === "dark";

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

            {/* <DropdownMenu>
                <DropdownMenuTrigger className="flex-1 min-w-0">
                    <div className="
                        flex items-center gap-1.5 px-1.5 py-1 rounded-md
                        hover:bg-[var(--color-state-hover)]
                        transition-colors duration-100
                        cursor-pointer
                    ">
                        Trigger
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" minWidth={240}>
                    <DropdownMenuItem
                        icon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                    >
                        {isDark ? "Light mode" : "Dark mode"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem icon={<Globe className="w-4 h-4" />} hasSubmenu>
                        Language
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={<HelpCircle className="w-4 h-4" />}>
                        Get help
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={<Zap className="w-4 h-4" />}>
                        Upgrade plan
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={<Download className="w-4 h-4" />}>
                        Get apps and extensions
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={<Info className="w-4 h-4" />} hasSubmenu>
                        Learn more
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu> */}

            <Button>New</Button>
        </header>
    );
}
