import { SidebarProvider } from "@/src/components/layout/Sidebar/SidebarContext"
import Sidebar from "@/src/components/layout/Sidebar/Sidebar"
import Header from "@/src/components/layout/Header/Header"
import {
    HomeIcon, SearchIcon, StarIcon, CalendarIcon, InboxIcon, Trash, Settings
} from "lucide-react"
import { createClient } from "@/lib/server"

const NAV_ITEMS = [
    { label: "Home", icon: <HomeIcon />, url: "/home" },
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
    { label: "test", url: "/test" },
]

const EXTRA_ITEMS = [
    { label: "Settings", icon: <Settings />, url: "/settings/general" },
    { label: "Trash", icon: <Trash />, url: "/trash", danger: true },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    navItems={NAV_ITEMS}
                    libraryItems={LIBRARY_ITEMS}
                    extraItems={EXTRA_ITEMS}
                />
                <div className="flex flex-col flex-1 min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}