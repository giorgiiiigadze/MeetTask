import { createClient } from "@/lib/supabase/client"

export type Integration = {
    provider: string
    connected: boolean
    workspaceName?: string
    workspaceIcon?: string
    lastSynced?: Date
}

export async function fetchIntegrations(): Promise<Integration[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", user.id)

    return (data ?? []).map(row => ({
        provider: row.provider,
        connected: !!row.access_token,
        workspaceName: row.workspace_name,
        workspaceIcon: row.workspace_icon,
        lastSynced: row.last_synced ? new Date(row.last_synced) : undefined,
    }))
}

export async function disconnectIntegration(provider: string): Promise<boolean> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("provider", provider)
        .eq("user_id", user.id)

    console.log("Testing disconnect")

    return !error
}