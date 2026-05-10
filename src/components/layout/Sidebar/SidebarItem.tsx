import Link from "next/link"

interface SidebarItemProps {
    label: string
    icon?: React.ReactNode
    url?: string
    onClick?: () => void
    active?: boolean
}

export default function SidebarItem({ label, icon, url, onClick, active }: SidebarItemProps) {
    const className = `
        flex items-center gap-2 w-full rounded-md px-2 py-1 cursor-pointer no-underline
        text-sm text-[var(--color-text-accent)]
        hover:bg-[var(--color-btn-hover-bg)] hover:no-underline hover:text-[var(--color-text-secondary)]
        active:bg-[var(--color-btn-press-bg)]
        transition-colors duration-100
        ${active ? "bg-[var(--color-sidebar-item-selected-bg)] !text-[var(--color-text-primary)]" : ""}
    `.trim()

    if (url) {
        return (
            <Link href={url} className={className} style={{ color: "inherit", textDecoration: "none" }}>
                {icon && <span className="shrink-0 size-4 flex items-center justify-center text-[var(--color-icon-secondary)]">{icon}</span>}
                <span className="truncate text-[var(--color-text-accent)] font-medium">{label}</span>
            </Link>
        )
    }

    return (
        <div onClick={onClick} className={className}>
            {icon && <span className="shrink-0 size-4 flex items-center justify-center text-[var(--color-icon-secondary)]">{icon}</span>}
            <span className="truncate">{label}</span>
        </div>
    )
}