"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { useSidebar } from "./SidebarContext"

import SidebarHeader from "./SidebarHeader"
import SidebarItem from "./SidebarItem"

import {
    HomeIcon,
    SearchIcon,
    StarIcon,
    CalendarIcon,
    InboxIcon,
} from "lucide-react"

const SIDEBAR_WIDTH = 341
const TRIGGER_WIDTH = SIDEBAR_WIDTH / 5

const NAV_ITEMS = [
    { label: "Home", icon: <HomeIcon />, url: "/" },
    { label: "Search", icon: <SearchIcon />, url: "/search" },
    { label: "Inbox", icon: <InboxIcon />, url: "/inbox" },
    { label: "Calendar", icon: <CalendarIcon />, url: "/calendar" },
    { label: "Favorites", icon: <StarIcon />, url: "/favorites" },
]

const LIBRARY_ITEMS = [
    { label: "Documents", url: "/documents" },
    { label: "Projects", url: "/projects" },
    { label: "Profile", url: "/profile" },
    { label: "Notifications", url: "/notifications" },
    { label: "Settings", url: "/settings" },
]

export default function Sidebar() {
    const { isOpen, isHovered } = useSidebar()
    const [isPeeking, setIsPeeking] = useState(false)

    const sidebarRef = useRef<HTMLElement>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tweenRef = useRef<gsap.core.Tween | null>(null)
    const isTogglingRef = useRef(true)

    useEffect(() => {
        if (!sidebarRef.current) return

        isTogglingRef.current = true
        setIsPeeking(false)

        gsap.set(sidebarRef.current, {
            x: isOpen ? 0 : -SIDEBAR_WIDTH,
        })

        requestAnimationFrame(() => {
            isTogglingRef.current = false
        })
    }, [isOpen])

    useEffect(() => {
        if (!sidebarRef.current || isTogglingRef.current || isOpen) return

        const visible = isPeeking || isHovered

        tweenRef.current?.kill()
        tweenRef.current = gsap.to(sidebarRef.current, {
            x: visible ? 0 : -SIDEBAR_WIDTH,
            duration: 0.15,
            ease: visible ? "power1.out" : "power1.in",
        })
    }, [isPeeking, isHovered, isOpen])

    const handleEnter = () => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current)
        setIsPeeking(true)
    }

    const handleLeave = () => {
        leaveTimer.current = setTimeout(() => setIsPeeking(false), 150)
    }

    return (
        <>
            {!isOpen && !isPeeking && (
                <div
                    className="fixed left-0 z-50"
                    style={{
                        width: TRIGGER_WIDTH,
                        top: "8.5%",
                        height: "90%",
                    }}
                    onMouseEnter={handleEnter}
                />
            )}

            <aside
                ref={sidebarRef}
                onMouseEnter={handleEnter}
                onMouseLeave={isOpen ? undefined : handleLeave}
                style={{
                    width: SIDEBAR_WIDTH,
                    ...(isOpen
                        ? {
                            position: "relative",
                            height: "100%",
                            borderRadius: "0",
                        }
                        : {
                            position: "fixed",
                            left: 0,
                            top: "7.5%",
                            height: "85%",
                            borderRadius: "0 12px 12px 0",
                            zIndex: 50,
                            borderTop: "0.5px solid var(--color-border)",
                            borderBottom: "0.5px solid var(--color-border)",
                            borderRight: "0.5px solid var(--color-border)",
                        }),
                }}
                className="bg-[var(--color-bg-secondary)] border-r-[0.5px] border-border shrink-0 px-[8px] py-[4px] flex flex-col gap-[2px]"
            >
                <SidebarHeader />

                <div className="flex flex-col gap-[2px]">
                    {NAV_ITEMS.map((item) => (
                        <SidebarItem key={item.url} {...item} />
                    ))}
                </div>

                <div className="flex flex-col gap-[2px] mt-4">
                    {LIBRARY_ITEMS.map((item) => (
                        <SidebarItem key={item.url} {...item} />
                    ))}
                </div>
            </aside>
        </>
    )
}