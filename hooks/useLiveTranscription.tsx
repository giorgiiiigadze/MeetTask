import { useRef, useState, useCallback } from "react"
import { StreamingTranscriber } from "assemblyai"

export type Turn = {
    text: string
    elapsed: number  // seconds from start
}

export function useLiveTranscription() {
    const [turns, setTurns] = useState<Turn[]>([])
    const [currentTurn, setCurrentTurn] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const turnsRef = useRef<Turn[]>([])
    const currentTurnRef = useRef("")
    const startTimeRef = useRef<number>(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const transcriberRef = useRef<StreamingTranscriber | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const contextRef = useRef<AudioContext | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const start = useCallback(async () => {
        if (transcriberRef.current) return

        setError(null)
        turnsRef.current = []
        setTurns([])
        currentTurnRef.current = ""
        setCurrentTurn("")
        setElapsed(0)

        let token: string
        try {
            const res = await fetch("/api/assemblyai/token")
            if (!res.ok) throw new Error("token fetch failed")
            const data = await res.json()
            token = data.token
        } catch {
            setError("Failed to connect to transcription service. Check your API key.")
            return
        }

        let stream: MediaStream
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch {
            setError("Microphone access denied. Please allow microphone permissions and try again.")
            return
        }
        streamRef.current = stream

        const transcriber = new StreamingTranscriber({
            token,
            sampleRate: 16000,
            speechModel: "universal-streaming-english",
        })

        transcriber.on("turn", ({ transcript: text, end_of_turn }) => {
            if (!text) return
            currentTurnRef.current = text
            setCurrentTurn(text)
            if (end_of_turn) {
                const newTurn: Turn = {
                    text,
                    elapsed: Math.floor((Date.now() - startTimeRef.current) / 1000),
                }
                turnsRef.current = [...turnsRef.current, newTurn]
                setTurns([...turnsRef.current])
                currentTurnRef.current = ""
                setCurrentTurn("")
            }
        })

        transcriber.on("error", (err) => {
            console.error("AssemblyAI error:", err)
            setError("Transcription error. Please stop and try again.")
        })

        try {
            await transcriber.connect()
        } catch {
            setError("Could not connect to transcription service.")
            stream.getTracks().forEach(t => t.stop())
            streamRef.current = null
            return
        }

        transcriberRef.current = transcriber

        const context = new AudioContext({ sampleRate: 16000 })
        const source = context.createMediaStreamSource(stream)
        const processor = context.createScriptProcessor(4096, 1, 1)

        processor.onaudioprocess = (e) => {
            if (!transcriberRef.current) return
            const pcm = e.inputBuffer.getChannelData(0)
            const int16 = new Int16Array(pcm.length)
            for (let i = 0; i < pcm.length; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, pcm[i] * 32768))
            }
            transcriberRef.current.sendAudio(int16.buffer)
        }

        source.connect(processor)
        processor.connect(context.destination)
        processorRef.current = processor
        contextRef.current = context

        startTimeRef.current = Date.now()
        setIsRecording(true)

        timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 1000)
    }, [])

    const stop = useCallback(async (title?: string): Promise<string | null> => {
        const duration = startTimeRef.current > 0
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0

        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        processorRef.current?.disconnect()
        try { await contextRef.current?.close() } catch { /* ignore */ }
        streamRef.current?.getTracks().forEach(t => t.stop())
        try { await transcriberRef.current?.close() } catch { /* ignore */ }

        transcriberRef.current = null
        processorRef.current = null
        contextRef.current = null
        streamRef.current = null

        setIsRecording(false)

        const lastPartial = currentTurnRef.current
        currentTurnRef.current = ""
        setCurrentTurn("")

        const allTurns = lastPartial
            ? [...turnsRef.current, { text: lastPartial, elapsed: duration }]
            : turnsRef.current

        const content = allTurns.map(t => t.text).join("\n\n").trim()
        if (!content) return null

        setSaving(true)
        try {
            const res = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    title: title?.trim() || 'Untitled Recording',
                    source: 'microphone',
                    duration_secs: duration,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                console.error("Failed to save transcript:", data)
                return null
            }
            return data.id ?? null
        } catch (err) {
            console.error("Save error:", err)
            return null
        } finally {
            setSaving(false)
        }
    }, [])

    return { turns, currentTurn, isRecording, elapsed, saving, error, start, stop }
}
