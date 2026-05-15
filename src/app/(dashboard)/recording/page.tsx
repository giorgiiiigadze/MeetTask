'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { useLiveTranscription } from '@/hooks/useLiveTranscription'

function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

const BAR_HEIGHTS = [8, 14, 20, 16, 24, 10, 18, 14, 22, 16, 20, 12, 18, 24, 14, 20, 10, 16, 22, 14]

type Phase = 'idle' | 'recording' | 'saving' | 'done'

export default function RecordingPage() {
    const router = useRouter()
    const [title, setTitle] = useState('New Recording')
    const [phase, setPhase] = useState<Phase>('idle')
    const scrollEndRef = useRef<HTMLDivElement>(null)
    const { turns, currentTurn, isRecording, elapsed, saving, error, start, stop } = useLiveTranscription()

    useEffect(() => {
        if (turns.length > 0 || currentTurn) {
            scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [turns, currentTurn])

    async function handleStart() {
        setPhase('recording')
        await start()
    }

    async function handleStop() {
        setPhase('saving')
        const id = await stop(title)
        setPhase('done')
        if (id) setTimeout(() => router.push('/home'), 2000)
    }

    const showListening = phase === 'recording' && turns.length === 0 && !currentTurn

    return (
        <div className="flex flex-col h-full">

            <div
                className="flex items-center gap-3 px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--color-border-primary)' }}
            >
                <button
                    onClick={() => router.back()}
                    className="p-1.5 rounded-md shrink-0"
                    style={{ color: 'var(--color-icon-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-state-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <ArrowLeft size={16} />
                </button>

                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    readOnly={phase !== 'idle'}
                    placeholder="Recording title"
                    className="flex-1 text-base font-semibold bg-transparent border-none outline-none min-w-0"
                    style={{
                        color: 'var(--color-text-primary)',
                        cursor: phase !== 'idle' ? 'default' : 'text',
                    }}
                />

                {isRecording && (
                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: '#ef4444' }}
                        />
                        <span
                            className="text-sm font-mono tabular-nums"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {formatTime(elapsed)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {phase === 'idle' ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                background: 'var(--color-bg-element)',
                                border: '1px solid var(--color-border-primary)',
                            }}
                        >
                            <Mic size={26} style={{ color: 'var(--color-icon-tertiary)' }} />
                        </div>
                        <div>
                            <p
                                className="text-sm font-medium mb-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Ready to record
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                Press the button below to start live transcription
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

                        {showListening && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-end gap-0.5 h-5">
                                    {[4, 8, 12, 8, 4].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-1 rounded-full audio-bar"
                                            style={{
                                                height: h * 2,
                                                background: 'var(--color-ui-blue-600)',
                                                animationDelay: `${i * 0.15}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Listening…
                                </span>
                            </div>
                        )}

                        {turns.map((turn, i) => (
                            <div key={i} className="flex gap-4 group">
                                <span
                                    className="text-xs font-mono tabular-nums pt-1 shrink-0 w-10 text-right"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                >
                                    {formatTime(turn.elapsed)}
                                </span>
                                <p
                                    className="text-sm leading-7 flex-1"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {turn.text}
                                </p>
                            </div>
                        ))}

                        {currentTurn && (
                            <div className="flex gap-4">
                                <span className="w-10 shrink-0" />
                                <p
                                    className="text-sm leading-7 flex-1"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {currentTurn}
                                    <span
                                        className="inline-block w-0.5 h-[1em] ml-0.5 align-middle rounded-sm animate-pulse"
                                        style={{ background: 'var(--color-ui-blue-600)' }}
                                    />
                                </p>
                            </div>
                        )}

                        {phase === 'saving' && (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                />
                                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                    Saving transcript…
                                </span>
                            </div>
                        )}

                        {phase === 'done' && (
                            <div className="flex items-center gap-2 mt-2">
                                <CheckCircle2 size={14} style={{ color: 'var(--color-green-500)' }} />
                                <span className="text-xs" style={{ color: 'var(--color-green-500)' }}>
                                    Saved! Redirecting…
                                </span>
                            </div>
                        )}

                        <div ref={scrollEndRef} />
                    </div>
                )}
            </div>

            <div
                className="shrink-0 px-6 py-6 flex flex-col items-center gap-4"
                style={{ borderTop: '1px solid var(--color-border-primary)' }}
            >
                {error && (
                    <div className="flex items-center gap-2">
                        <AlertCircle size={13} style={{ color: 'var(--color-red-500)' }} />
                        <p className="text-xs" style={{ color: 'var(--color-red-500)' }}>
                            {error}
                        </p>
                    </div>
                )}

                {phase === 'recording' && (
                    <div className="flex items-end gap-0.5 h-8">
                        {BAR_HEIGHTS.map((h, i) => (
                            <div
                                key={i}
                                className="w-1 rounded-full audio-bar"
                                style={{
                                    height: h,
                                    background: 'var(--color-ui-blue-600)',
                                    opacity: 0.65,
                                    animationDelay: `${i * 0.045}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-6">
                    {phase === 'idle' && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={handleStart}
                                className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 hover:opacity-90"
                                style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    boxShadow: '0 4px 14px rgba(239,68,68,0.45)',
                                }}
                            >
                                <Mic size={24} />
                            </button>
                            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                Tap to record
                            </span>
                        </div>
                    )}

                    {phase === 'recording' && (
                        <button
                            onClick={handleStop}
                            className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 hover:opacity-80"
                            style={{
                                background: 'var(--color-bg-element)',
                                border: '2px solid var(--color-border-primary)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <Square size={20} fill="currentColor" />
                        </button>
                    )}

                    {(phase === 'saving' || phase === 'done') && (
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                background: 'var(--color-bg-element)',
                                border: '1px solid var(--color-border-primary)',
                            }}
                        >
                            {phase === 'saving'
                                ? <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-text-tertiary)' }} />
                                : <CheckCircle2 size={22} style={{ color: 'var(--color-green-500)' }} />
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
