"use client"

import { useEffect, useState } from "react"
import { SiNotion, SiLinear } from "react-icons/si"
import { RefreshCw, PlugZap, Unplug } from "lucide-react"
import { ConfirmDialog } from "@/src/components/ui/ConfrimDialog"
import { Button } from "@/src/components/ui/Button"

import { formatLastSynced } from "@/lib/format"
import { ConnectionBadge } from "@/src/components/ui/ConnectionBadge"
import { disconnectIntegration, fetchIntegrations } from "@/lib/integrations"

interface Integration {
    provider: string
    connected: boolean
    workspaceName?: string
    workspaceIcon?: string
    lastSynced?: Date
}

interface IntegrationCardProps {
    label: string
    description: string
    icon: React.ReactNode
    state: Integration | null
    authUrl: string
    loading: boolean
    onDisconnect: () => void
}

function IntegrationCard({ label, description, icon, state, authUrl, loading, onDisconnect }: IntegrationCardProps) {
    const connected = state?.connected ?? false

    return (
        <div className="rounded-xl border-[0.5px] border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[var(--color-text-primary)] ${
                        connected ? "bg-[var(--color-tgray-100)]" : "bg-[var(--color-tgray-50)]"
                    }`}>
                        <span className="text-lg">{icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                            
                            {!loading && connected && <ConnectionBadge connected={connected} />}

                        </div>
                        <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">
                            {loading
                                ? "Loading..."
                                : connected
                                    ? state?.workspaceName
                                        ? `Workspace: ${state.workspaceName}`
                                        : "Workspace connected"
                                    : description
                            }
                        </p>
                    </div>
                </div>

                {!loading && (
                    <div className="flex sm:block pl-[52px] sm:pl-0">
                        {connected ? (
                            <Button
                                onClick={onDisconnect}
                                className="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-red-600)] transition-colors duration-100 cursor-pointer shrink-0"
                            >
                                <Unplug className="w-3 h-3" />
                                Disconnect
                            </Button>
                        ) : (
                            <a href={authUrl}>
                                <Button className="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded-md bg-[var(--color-ui-blue-100)] text-[var(--color-ui-blue-600)] hover:bg-[var(--color-ui-blue-200)] transition-colors duration-100 cursor-pointer shrink-0">
                                    <PlugZap className="w-3 h-3" />
                                    Connect
                                </Button>
                            </a>
                        )}
                    </div>
                )}
            </div>

            {!loading && connected && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[var(--color-tgray-50)] border-t border-[var(--color-border-primary)]">
                    <div className="flex flex-wrap items-center gap-3">
                        {state?.workspaceIcon && (
                            <div className="flex items-center gap-1.5">
                                <img src={state.workspaceIcon} className="w-3.5 h-3.5 rounded shrink-0" alt="" />
                                <span className="text-[11px] text-[var(--color-text-secondary)]">{state.workspaceName}</span>
                            </div>
                        )}
                        {state?.lastSynced && (
                            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                                <RefreshCw className="w-2.5 h-2.5" />
                                Synced {formatLastSynced(state.lastSynced)}
                            </div>
                        )}
                    </div>
                    <a
                        href={authUrl}
                        className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors duration-100 no-underline"
                    >
                        Reconnect
                    </a>
                </div>
            )}
        </div>
    )
}

export default function SettingsIntegrationsPage() {
    const [loading, setLoading] = useState(true)
    
    const [notion, setNotion] = useState<Integration | null>(null)
    const [linear, setLinear] = useState<Integration | null>(null)
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            const integrations = await fetchIntegrations()
            const notionRow = integrations.find(i => i.provider === "notion")
            setNotion(notionRow ?? null)
            setLoading(false)
        }
        load()
    }, [])

    const handleDisconnect = async (provider: string) => {
        const success = await disconnectIntegration(provider)
        if (!success) return
        if (provider === "notion") setNotion(null)
    }

    const integrations = [
        {
            key: "notion",
            label: "Notion",
            description: "Sync and manage your Notion pages",
            icon: <SiNotion />,
            state: notion,
            authUrl: "/api/integrations/notion/auth",
        },
        {
            key: "linear",
            label: "Linear",
            description: "Sync issues and projects from Linear",
            icon: <SiLinear />,
            state: linear,
            authUrl: "/api/integrations/linear/auth",
        },
    ]

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Integrations</h2>
                <p className="text-[13px] text-[var(--color-text-tertiary)] mt-0.5">
                    Connect third-party services to your workspace.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {integrations.map(({ key, label, description, icon, state, authUrl }) => (
                    <IntegrationCard
                        key={key}
                        label={label}
                        description={description}
                        icon={icon}
                        state={state}
                        authUrl={authUrl}
                        loading={loading}
                        onDisconnect={() => setShowDisconnectConfirm(key)}
                    />
                ))}
            </div>

            <ConfirmDialog
                open={!!showDisconnectConfirm}
                title={`Disconnect ${showDisconnectConfirm === "notion" ? "Notion" : "Linear"}?`}
                description="This will remove access to your workspace. You can reconnect at any time."
                confirmLabel="Disconnect"
                variant="danger"
                onConfirm={() => {
                    if (showDisconnectConfirm) handleDisconnect(showDisconnectConfirm)
                    setShowDisconnectConfirm(null)
                }}
                onCancel={() => setShowDisconnectConfirm(null)}
            />
        </div>
    )
}