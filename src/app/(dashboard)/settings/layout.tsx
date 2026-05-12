import SettingsSidebar from "./settings-sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full w-full max-w-7xl mx-auto px-4 sm:px-8">
            <SettingsSidebar />
            <main className="flex-1 min-w-0 py-8 px-6 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}