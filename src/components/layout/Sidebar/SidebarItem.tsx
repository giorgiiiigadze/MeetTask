import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

interface SidebarItemProps {
    label: string
    icon?: React.ReactNode
    url?: string
    onClick?: () => void
    active?: boolean
    danger?: boolean
    onMore?: () => void
}

export default function SidebarItem({ label, icon, url, onClick, active, danger, onMore }: SidebarItemProps) {
    const baseClass = `
        group flex items-center gap-2 w-full rounded-[6px] px-2 py-1 cursor-pointer no-underline
        text-sm transition-colors duration-100
        ${danger
            ? `text-[var(--color-red-600)]
               hover:bg-[var(--color-red-50)] hover:text-[var(--color-red-600)]
               active:bg-[var(--color-red-50)]`
            : `text-[var(--color-text-accent)]
               hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-text-secondary)]
               active:bg-[var(--color-btn-dark-hover-bg)]`
        }
            ${active && !danger ? "!bg-[var(--color-btn-dark-hover-bg)] !text-[var(--color-text-primary)]" : ""}
        `.trim()

    const content = (
        <>
            {icon && (
                <span className={`shrink-0 size-4 flex items-center justify-center ${danger ? "text-[var(--color-red-500)]" : "text-[var(--color-icon-secondary)]"}`}>
                    {icon}
                </span>
            )}

            <span className={`truncate font-medium flex-1 ${danger && "text-[var(--color-red-600)]"}`}>
                {label}
            </span>

            {onMore && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMore(); }}
                    className={`
                        shrink-0 opacity-0 group-hover:opacity-100
                        size-5 flex items-center justify-center rounded-[6px]
                        transition-opacity duration-100
                        hover:bg-[var(--color-btn-press-bg)]
                        text-[var(--color-icon-secondary)]
                    `}
                    aria-label="More options"
                >
                    <MoreHorizontal size={14} />
                </button>
            )}
        </>
    )

    if (url) {
        return (
            <Link href={url} className={baseClass} style={{ color: "inherit", textDecoration: "none" }}>
                {content}
            </Link>
        )
    }

    return (
        <div onClick={onClick} className={baseClass}>
            {content}
        </div>
    )
}