"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const SETTINGS_ITEMS = [
    { name: "General", url: "/settings/general" },
    { name: "Account", url: "/settings/account" },
    { name: "Privacy", url: "/settings/privacy" },
    { name: "Billing", url: "/settings/billing" },
    { name: "Integrations", url: "/settings/integrations" },
]

export default function SettingsSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-72 p-4">
            <h1 className="text-2xl font-serif font-semibold mb-8 ml-4">
                Settings
            </h1>

            <ul className="flex flex-col gap-2">
                {SETTINGS_ITEMS.map((item) => (
                    <li key={item.name}>
                        <Link
                            href={item.url}
                            className={`
                                rounded-[8px] px-4 h-9 w-full text-left
                                font-sans transition cursor-pointer
                                flex items-center
                                hover:bg-[var(--color-btn-dark-hover-bg)]
                                ${pathname === item.url
                                    ? "bg-[var(--color-btn-dark-hover-bg)]"
                                    : ""}
                            `}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    )
}