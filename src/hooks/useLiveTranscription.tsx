import { useRef, useState } from "react"
import { StreamingTranscriber } from "assemblyai"

export function useLiveTranscription() {
    const [transcript, setTranscript] = useState("")
    const [currentTurn, setCurrentTurn] = useState("")
    const transcriberRef = useRef<StreamingTranscriber | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const contextRef = useRef<AudioContext | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const start = async () => {
        const { token } = await fetch("/api/assemblyai/token").then(r => r.json())

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const transcriber = new StreamingTranscriber({
            token,
            sampleRate: 16000,
            speechModel: "universal-streaming-english",
        })

        transcriber.on("turn", ({ transcript: text, end_of_turn }) => {
            if (!text) return
            setCurrentTurn(text)
            if (end_of_turn) {
                setTranscript(prev => (prev + " " + text).trim())
                setCurrentTurn("")
            }
        })

        transcriber.on("error", (err) => {
            console.error("AssemblyAI error:", err)
        })

        await transcriber.connect()

        const context = new AudioContext({ sampleRate: 16000 })
        const source = context.createMediaStreamSource(stream)
        const processor = context.createScriptProcessor(4096, 1, 1)

        processor.onaudioprocess = (e) => {
            const pcm = e.inputBuffer.getChannelData(0)
            const int16 = new Int16Array(pcm.length)
            for (let i = 0; i < pcm.length; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, pcm[i] * 32768))
            }
            transcriber.sendAudio(int16.buffer)
        }

        source.connect(processor)
        processor.connect(context.destination)

        transcriberRef.current = transcriber
        processorRef.current = processor
        contextRef.current = context
    }

    const stop = async () => {
        processorRef.current?.disconnect()
        contextRef.current?.close()
        streamRef.current?.getTracks().forEach(track => track.stop())
        await transcriberRef.current?.close()

        transcriberRef.current = null
        processorRef.current = null
        contextRef.current = null
        streamRef.current = null

        setTranscript("")
        setCurrentTurn("")
    }

    return { transcript, currentTurn, start, stop }
}