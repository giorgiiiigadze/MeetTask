"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { useSidebar } from "./SidebarContext"

import SidebarHeader from "./SidebarHeader"
import SidebarItem from "./SidebarItem"

import { createClient } from "@/lib/client"
import { User } from "@supabase/supabase-js"

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
    extraItems?: NavItem[]
}

interface NotionConnection {
    connected: boolean
    workspaceName?: string
    workspaceIcon?: string
    lastSynced?: Date
}

export default function Sidebar({ navItems, libraryItems, extraItems }: SidebarProps) {
    const { isOpen, isHovered } = useSidebar()
    const [isPeeking, setIsPeeking] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [userLoading, setUserLoading] = useState(true)
    const pathname = usePathname()

    const sidebarRef = useRef<HTMLElement>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const tweenRef = useRef<gsap.core.Tween | null>(null)
    const isTogglingRef = useRef(true)

    const [notion, setNotion] = useState<NotionConnection | undefined>()

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const { data } = await supabase
                .from("integrations")
                .select("*")
                .eq("provider", "notion")
                .maybeSingle()

            if (data) {
                const notionData: NotionConnection = {
                    connected: data.connected === true || data.connected === 1 || data.connected === "true" || !!data.access_token,
                    workspaceName: data.workspace_name,
                    workspaceIcon: data.workspace_icon,
                    lastSynced: data.last_synced ? new Date(data.last_synced) : undefined,
                }
                setNotion(notionData)

                console.log("lastSynced raw:", data.last_synced)
                console.log("lastSynced parsed:", notionData.lastSynced)
            }

            setUserLoading(false)
        }
        fetchData()
    }, [])

    const handleDisconnectNotion = async () => {
        const supabase = createClient()
        const { error } = await supabase
            .from("integrations")
            .delete()
            .eq("provider", "notion")

        if (error) {
            console.error("Failed to disconnect Notion:", error)
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
                className="bg-[var(--color-bg-secondary)] border-r-[0.5px] border-border shrink-0 px-[8px] py-[4px] flex flex-col gap-[2px]"
            >
                <SidebarHeader
                    user={user ?? undefined}
                    loading={userLoading}
                    notion={notion}
                    onDisconnectNotion={handleDisconnectNotion}
                />

                <div className="w-full flex flex-col overflow-y-auto">
                    <div className="flex flex-col gap-[1px]">
                        {navItems?.map((item) => (
                            <SidebarItem key={item.url} {...item} active={isActive(item.url)} />
                        ))}
                    </div>

                    <div className="flex flex-col gap-[1px] pt-4">
                        {libraryItems?.map((item) => (
                            <SidebarItem key={item.url} {...item} active={isActive(item.url)} onMore={() => {
                                console.log("On More button clicked")
                            }} />
                        ))}
                    </div>

                    <div className="flex flex-col gap-[1px] pt-6">
                        {extraItems?.map((item) => (
                            <SidebarItem key={item.url} {...item} active={isActive(item.url)} />
                        ))}
                    </div>
                </div>
            </aside>
        </>
    )
}