"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import { useSidebar } from "./SidebarContext"

import SidebarHeader from "./SidebarHeader"
import SidebarItem from "./SidebarItem"

const SIDEBAR_WIDTH = 300
const TRIGGER_WIDTH = SIDEBAR_WIDTH / 5

interface NavItem {
    label: string
    icon?: React.ReactNode
    url: string
}

interface SidebarProps {
    navItems?: NavItem[]
    libraryItems?: NavItem[]
}

export default function Sidebar({ navItems, libraryItems }: SidebarProps) {
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
                        height: "100%",
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

                <div className="w-full flex flex-col overflow-y-auto">
                    <div className="flex flex-col gap-[0.2px] mt-2">
                        {navItems?.map((item) => (
                            <SidebarItem key={item.url} {...item} />
                        ))}
                    </div>

                    <div className="flex flex-col gap-[0.2px] pt-4">
                        {libraryItems?.map((item) => (
                            <SidebarItem key={item.url} {...item} />
                        ))}
                    </div>                    
                </div>

            </aside>
        </>
    )
}