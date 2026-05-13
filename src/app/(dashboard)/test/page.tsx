"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"

import { Button } from "@/src/components/ui/Button"

import { SiNotion, SiLinear } from "react-icons/si"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/Card"

import { useLiveTranscription } from "@/hooks/useLiveTranscription"

import { ConfirmDialog } from "@/src/components/ui/ConfrimDialog"

export default function TestPage() {
    const [email, setEmail] = useState<string | null>(null)
    const [notionConnected, setNotionConnected] = useState(false)
    const [linearConnected, setLinearConnected] = useState(false)
    const [active, setActive] = useState(false)

    const [notionPages, setNotionPages] = useState<any[]>([])
    const [pagesLoading, setPagesLoading] = useState(false)

    const { transcript, currentTurn, saving, start, stop } = useLiveTranscription()

    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        supabase.auth.getUser().then(({ data: { user } }) => {
            setEmail(user?.email ?? null)

            if (user) {
                supabase
                    .from('integrations')
                    .select('provider')
                    .eq('user_id', user.id)
                    .then(({ data }) => {
                        setNotionConnected(data?.some(i => i.provider === 'notion') ?? false)
                        setLinearConnected(data?.some(i => i.provider === 'linear') ?? false)
                    })
            }
        })
    }, [])

    const fetchNotionPages = async () => {
        setPagesLoading(true)
        const res = await fetch('/api/integrations/notion/pages')
        const data = await res.json()
        setNotionPages(data.pages ?? [])
        setPagesLoading(false)
    }

    const toggleTranscription = () => {
        active ? stop() : start()
        setActive(prev => !prev)
    }

    return (
        <div className="space-y-8">

            <p>{email}</p>

            <div className="space-y-3">
                <p className="text-xs text-muted uppercase tracking-widest">Integrations</p>

                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border-primary)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-sm font-bold font-sans">N</div>
                        <div>
                            <p className="font-sans font-medium text-sm text-[var(--color-text-primary)]">Notion</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                {notionConnected ? '✓ Connected' : 'Not connected'}
                            </p>
                        </div>
                    </div>
                    {notionConnected ? (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary">
                                Test Push
                            </Button>
                            <span className="text-xs px-2 py-1 rounded-md bg-[var(--color-green-50)] text-[var(--color-green-600)]">Connected</span>
                        </div>
                    ) : (
                        <a href="/api/integrations/notion/auth">
                            <Button size="sm" variant="secondary">Connect</Button>
                        </a>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border-primary)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-sm font-bold font-sans">L</div>
                        <div>
                            <p className="font-sans font-medium text-sm text-[var(--color-text-primary)]">Linear</p>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                {linearConnected ? '✓ Connected' : 'Not connected'}
                            </p>
                        </div>
                    </div>
                    {linearConnected ? (
                        <span className="text-xs px-2 py-1 rounded-md bg-[var(--color-green-50)] text-[var(--color-green-600)]">Connected</span>
                    ) : (
                        <a href="/api/integrations/linear/auth">
                            <Button size="sm" variant="secondary">Connect</Button>
                        </a>
                    )}
                </div>
            </div>

            <div className="space-y-3">

                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted uppercase tracking-widest">Notion Pages</p>
                    <Button size="sm" variant="secondary" onClick={fetchNotionPages} disabled={pagesLoading}>
                        {pagesLoading ? "Loading..." : "Fetch Pages"}
                    </Button>
                </div>

                {notionPages.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {notionPages.map((page: any) => {
                            const title =
                                page.properties?.title?.title?.[0]?.plain_text ||
                                page.properties?.Name?.title?.[0]?.plain_text ||
                                "Untitled"

                            return (
                                <a
                                    key={page.id}
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                >
                                    <SiNotion className="shrink-0 text-[var(--color-text-tertiary)]" />
                                    <span className="text-sm text-[var(--color-text-primary)] truncate">{title}</span>
                                    <span className="ml-auto text-xs text-[var(--color-text-tertiary)] shrink-0">
                                        {new Date(page.last_edited_time).toLocaleDateString()}
                                    </span>
                                </a>
                            )
                        })}
                    </div>
                )}

                {!pagesLoading && notionPages.length === 0 && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                        Click "Fetch Pages" to load your Notion pages.
                    </p>
                )}

            </div>

            <div className="flex flex-col gap-4 items-start justify-between w-auto">
                <a href="/api/integrations/notion/auth">
                    <Button className="h-12 px-6 border-[0.5px] border-border">
                        <SiNotion size={18} />
                        Connect
                    </Button>
                </a>

                <a href="/api/integrations/linear/auth">
                    <Button className="h-12 px-6 border-[0.5px] border-border">
                        <SiLinear size={18} />
                        Connect
                    </Button>
                </a>
            </div>

            <Card padding="lg" hover>
                <CardHeader border>
                    <CardTitle description="Updated just now">Active Tasks</CardTitle>
                    <Button variant="ghost" size="sm">View all</Button>
                </CardHeader>
                <CardContent>...</CardContent>
                <CardFooter border>
                    <span className="text-xs text-[var(--color-text-tertiary)]">12 total</span>
                </CardFooter>
            </Card>

            <div className="space-y-3">
                <p className="text-xs text-muted uppercase tracking-widest">Live Transcription</p>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleTranscription}
                    disabled={saving}
                >
                    {active ? "Stop" : "Start"} Transcription
                </Button>
                <div className="p-4 rounded-lg border border-[var(--color-border-primary)] min-h-[100px]">
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                        {transcript || (!currentTurn && "Transcript will appear here...")}
                        {currentTurn && <span className="opacity-50"> {currentTurn}</span>}
                    </p>
                </div>
                {saving && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">Saving transcript...</p>
                )}
            </div>

            <div className="space-y-2">
                <p className="text-xs text-muted uppercase tracking-widest">Satoshi</p>
                <p className="font-sans font-light">Light 300 — The quick brown fox</p>
                <p className="font-sans font-normal">Regular 400 — The quick brown fox</p>
                <p className="font-sans font-medium">Medium 500 — The quick brown fox</p>
                <p className="font-sans font-bold">Bold 700 — The quick brown fox</p>
                <p className="font-sans font-black">Black 900 — The quick brown fox</p>
                <p className="font-sans font-light italic">Light Italic — The quick brown fox</p>
                <p className="font-sans font-normal italic">Italic — The quick brown fox</p>
            </div>

            <div className="space-y-2">
                <p className="text-xs text-muted uppercase tracking-widest">Zodiak</p>
                <p className="font-serif font-thin">Thin 100 — The quick brown fox</p>
                <p className="font-serif font-light">Light 300 — The quick brown fox</p>
                <p className="font-serif font-normal">Regular 400 — The quick brown fox</p>
                <p className="font-serif font-bold">Bold 700 — The quick brown fox</p>
                <p className="font-serif font-extrabold">Extrabold 800 — The quick brown fox</p>
                <p className="font-serif font-black">Black 900 — The quick brown fox</p>
                <p className="font-serif font-thin italic">Thin Italic — The quick brown fox</p>
                <p className="font-serif font-normal italic">Italic — The quick brown fox</p>
            </div>

            <Button size="sm" variant="secondary" onClick={() => setShowConfirm(true)}>
                Test Dialog
            </Button>

            <ConfirmDialog
                open={showConfirm}
                title="Disconnect Notion?"
                description="This will remove access to your Notion workspace. You can reconnect at any time."
                confirmLabel="Disconnect"
                variant="danger"
                onConfirm={() => { setShowConfirm(false) }}
                onCancel={() => setShowConfirm(false)}
            />

        </div>
    )
}