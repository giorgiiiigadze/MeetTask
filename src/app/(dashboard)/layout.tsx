import { SidebarProvider } from "@/src/components/layout/Sidebar/SidebarContext"
import Sidebar from "@/src/components/layout/Sidebar/Sidebar"
import Header from "@/src/components/layout/Header/Header"
import {
    HomeIcon, SearchIcon, StarIcon, CalendarIcon, InboxIcon,
} from "lucide-react"

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
    { label: "Settings", url: "/settings" },

]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar navItems={NAV_ITEMS} libraryItems={LIBRARY_ITEMS} />
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