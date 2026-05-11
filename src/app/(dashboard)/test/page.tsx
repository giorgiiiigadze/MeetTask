"use client"

import { createClient } from "@/src/utils/supabase/client"
import { Button } from "@/src/components/ui/Button"
import { useEffect, useState } from "react"
import { SiNotion, SiLinear } from "react-icons/si"
import { useLiveTranscription } from "@/src/hooks/useLiveTranscription"

export default function TestPage() {
    const [email, setEmail] = useState<string | null>(null)
    const [notionConnected, setNotionConnected] = useState(false)
    const [linearConnected, setLinearConnected] = useState(false)
    const [active, setActive] = useState(false)
    
    const { transcript, currentTurn, start, stop } = useLiveTranscription()

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

    const pushToNotion = async () => {
        const res = await fetch('/api/integrations/notion/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test Page from MeetTask',
                content: 'This page was created from MeetTask!',
            }),
        })
        const data = await res.json()
        console.log('Notion response:', data)
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
                            <Button size="sm" variant="secondary" onClick={pushToNotion}>
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

            <div className="space-y-3">
                <p className="text-xs text-muted uppercase tracking-widest">Live Transcription</p>
                <Button size="sm" variant="secondary" onClick={toggleTranscription}>
                    {active ? "Stop" : "Start"} Transcription
                </Button>
                <div className="p-4 rounded-lg border border-[var(--color-border-primary)] min-h-[100px]">
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                        {transcript || (!currentTurn && "Transcript will appear here...")}
                        {currentTurn && <span className="opacity-50"> {currentTurn}</span>}
                    </p>
                </div>
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

            <Button size="md" onClick={() => console.log("Clicked")}>
                Test button fr fr
            </Button>

        </div>
    )
}