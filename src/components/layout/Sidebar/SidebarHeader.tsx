import { useSidebar } from "./SidebarContext"

export default function SidebarHeader(){
    const { toggle } = useSidebar();

    return (
        <div className="px-2 py-1 w-full flex items-center justify-between">
            Sidebar Header

            <button onClick={toggle}>
                Toggle
            </button>
        </div>
    )
}