import SettingsSidebar from "./sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full">
            <SettingsSidebar />
            <main className="flex-1 p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}