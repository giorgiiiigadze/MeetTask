interface ConnectionBadgeProps {
    connected: boolean
    labels?: { connected?: string; disconnected?: string }
}

export function ConnectionBadge({ connected, labels }: ConnectionBadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            connected
                ? "bg-[var(--color-green-50)] text-[var(--color-green-600)]"
                : "bg-[var(--color-red-50)] text-[var(--color-red-600)]"
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-[var(--color-green-500)]" : "bg-[var(--color-red-500)]"
            }`} />
            {connected ? (labels?.connected ?? "Connected") : (labels?.disconnected ?? "Disconnected")}
        </span>
    )
}