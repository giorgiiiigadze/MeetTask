"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { useSidebar } from "./SidebarContext"

import SidebarHeader from "./SidebarHeader"
import SidebarItem from "./SidebarItem"

import { createClient } from "@/lib/supabase/client"
import { fetchIntegrations, disconnectIntegration } from "@/lib/integrations"

import { User } from "@supabase/supabase-js"

const SIDEBAR_WIDTH = 300
const TRIGGER_WIDTH = SIDEBAR_WIDTH / 5

interface NavItem {
    label: string
    icon?: React.ReactNode
    url: string
}

interface SidebarProps {
    user?: User | null
    navItems?: NavItem[]
    libraryItems?: NavItem[]
    extraItems?: NavItem[]
}

interface NotionConnection {
    connected: boolean
    workspaceName?: string
    workspaceIcon?: string
    lastSynced?: Date
}

export default function Sidebar({ user, navItems, libraryItems, extraItems }: SidebarProps) {
    const { isOpen, isHovered } = useSidebar()
    const [isPeeking, setIsPeeking] = useState(false)
    const [userLoading, setUserLoading] = useState(true)
    const pathname = usePathname()

    const sidebarRef = useRef<HTMLElement>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tweenRef = useRef<gsap.core.Tween | null>(null)
    const isTogglingRef = useRef(true)

    const [notion, setNotion] = useState<NotionConnection | undefined>()

    useEffect(() => {
        const load = async () => {
            const integrations = await fetchIntegrations()
            const notionRow = integrations.find(i => i.provider === "notion")
            setNotion(notionRow ?? undefined)

            setUserLoading(false)
        }
        load()
    }, [])

    const handleDisconnectNotion = async () => {
        const success = await disconnectIntegration("notion")
        if (!success) {
            console.error("Failed to disconnect Notion")
            return
        }
        setNotion(undefined)
    }

    useEffect(() => {
        if (!sidebarRef.current) return
        isTogglingRef.current = true
        setIsPeeking(false)
        gsap.set(sidebarRef.current, { x: isOpen ? 0 : -SIDEBAR_WIDTH })
        requestAnimationFrame(() => { isTogglingRef.current = false })
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

    const isActive = (url: string) => pathname === url

    return (
        <>
            {!isOpen && !isPeeking && (
                <div
                    className="fixed left-0 z-50"
                    style={{ width: TRIGGER_WIDTH, height: "100%" }}
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
                        ? { position: "relative", height: "100%", borderRadius: "0" }
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
                className="bg-[var(--color-bg-secondary)] border-r-[0.5px] border-border shrink-0 py-[4px] flex flex-col gap-[2px]"
            >
                <SidebarHeader
                    user={user ?? undefined}
                    loading={userLoading}
                    notion={notion}
                    onDisconnectNotion={handleDisconnectNotion}
                />

                <div className="w-full flex flex-col overflow-y-auto gap-4 px-[8px] pt-2">
                    {[
                        { items: navItems },
                        { items: libraryItems, onMore: true, emptyState: true },
                        { items: extraItems },
                    ].map((section, i) => (
                        section.items?.length ? (
                            <div key={i} className="flex flex-col gap-[1px]">
                                {section.items.map((item) => (
                                    <SidebarItem
                                        key={item.url}
                                        {...item}
                                        active={isActive(item.url)}
                                        {...(section.onMore && {
                                            onMore: () => console.log("On More button clicked")
                                        })}
                                    />
                                ))}
                            </div>
                        ) : section.emptyState ? (
                            <div key={i} className="flex flex-col gap-[1px] px-2">
                                <p className="text-xs py-2 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Your meetings will show up here.
                                </p>
                            </div>
                        ) : null
                    ))}
                </div>
                
            </aside>
        </>
    )
}