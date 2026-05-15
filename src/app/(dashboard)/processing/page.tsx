'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Stage = 'transcribing' | 'extracting' | 'done'

const STAGES: { id: Stage; label: string }[] = [
  { id: 'transcribing', label: 'Transcribing audio…'},
  { id: 'extracting', label: 'Extracting action items…'},
  { id: 'done', label: 'Done'},
]

const POLL_INTERVAL_MS = 3_000
const MAX_POLLS = 100

function ProcessingContent() {
  const router    = useRouter()
  const meetingId = useSearchParams().get('meetingId')

  const [stage,  setStage]  = useState<Stage>('transcribing')
  const [failed, setFailed] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const polls = useRef(0)

  useEffect(() => {
    if (!meetingId) {
      setFailed(true)
      setErrMsg('No meeting ID provided.')
      return
    }

    let timer: ReturnType<typeof setTimeout>

    async function pollStatus() {
      if (polls.current >= MAX_POLLS) {
        setFailed(true)
        setErrMsg('Transcription timed out. Please try again.')
        return
      }
      polls.current++

      let json: { status: string; error?: string }
      try {
        const res = await fetch(`/api/transcribe/status?meetingId=${meetingId}`)
        if (!res.ok) {
          setFailed(true)
          setErrMsg(`Status check failed (${res.status}). Please try again.`)
          return
        }
        json = await res.json()
      } catch {
        timer = setTimeout(pollStatus, POLL_INTERVAL_MS)
        return
      }

      if (json.status === 'done') {
        await runExtraction()
      } else if (json.status === 'failed') {
        setFailed(true)
        setErrMsg('Transcription failed. Please re-upload your recording.')
      } else {
        timer = setTimeout(pollStatus, POLL_INTERVAL_MS)
      }
    }

    pollStatus()
    return () => clearTimeout(timer)
  }, [meetingId])

  async function runExtraction() {
    setStage('extracting')

    let transcript: string
    try {
      const res = await fetch(`/api/review/${meetingId}`)
      if (!res.ok) throw new Error(`review fetch failed: ${res.status}`)
      const data: { meeting?: { transcript?: string } } = await res.json()
      transcript = data.meeting?.transcript ?? ''

      console.log('[extract] transcript chars:', transcript.length)
      console.log('[extract] preview:', transcript.slice(0, 300))
    } catch (err) {
      console.error('[extract] transcript fetch failed:', err)
      setFailed(true)
      setErrMsg('Could not load transcript. Please refresh and try again.')
      return
    }

    if (!transcript.trim()) {
      setFailed(true)
      setErrMsg('Transcript is empty — transcription may not have finished saving yet.')
      return
    }

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meeting_id: meetingId }),
      })

      const body = await res.json()
      console.log('[extract] status:', res.status)
      console.log('[extract] body:', body)

      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
      }
    } catch (err) {
      console.error('[extract] call failed:', err)
      setFailed(true)
      setErrMsg('Action-item extraction failed. Please try again.')
      return
    }

    setStage('done')
    router.replace(`/review/${meetingId}`)
  }

  const activeIndex = STAGES.findIndex(s => s.id === stage)

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="flex flex-col gap-6 px-8 py-8 rounded-2xl w-full max-w-sm"
        style={{
          background: 'var(--color-bg-element)',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        <div className="flex flex-col gap-1">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Processing your meeting
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            This usually takes under a minute.
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {STAGES.map((s, i) => {
            const isCurrent  = s.id === stage && !failed
            const isComplete = activeIndex > i && !failed
            const isPending  = !isCurrent && !isComplete

            return (
              <li key={s.id} className="flex items-center gap-3">
                <span style={{ color: isComplete || isCurrent
                  ? 'var(--color-ui-blue-600)'
                  : 'var(--color-icon-tertiary)'
                }}>
                  {isComplete
                    ? <CheckCircle2 size={16} />
                    : isCurrent
                      ? <Loader2 size={16} className="animate-spin" />
                      : (
                        <span style={{
                          display: 'block',
                          width: 16, height: 16,
                          borderRadius: '50%',
                          border: '1.5px solid var(--color-border-primary)',
                        }} />
                      )
                  }
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: isPending ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                    fontWeight: isCurrent ? 500 : 400,
                  }}
                >
                  {s.label}
                </span>
              </li>
            )
          })}
        </ol>

        {failed && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--color-red-500)',
            }}
          >
            <XCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errMsg || 'Something went wrong.'}</span>
          </div>
        )}

        {failed && (
          <button
            onClick={() => router.back()}
            className="text-xs font-medium py-2 rounded-lg transition-colors"
            style={{
              background: 'var(--color-state-hover)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border-primary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-state-hover)')}
          >
            ← Go back
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense>
      <ProcessingContent />
    </Suspense>
  )
}