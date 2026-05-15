'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Circle, Loader } from 'lucide-react'

type Stage = 'transcribing' | 'extracting' | 'done' | 'error'

const STAGES = [
  { key: 'transcribing', label: 'Transcribing audio' },
  { key: 'extracting',   label: 'Extracting tasks' },
  { key: 'done',         label: 'Ready to review' },
] as const

const STAGE_ORDER = ['transcribing', 'extracting', 'done'] as const
type ActiveStage = (typeof STAGE_ORDER)[number]

function StageIcon({ stage, current }: { stage: ActiveStage; current: Stage }) {
  if (current === 'done') return <CheckCircle size={16} className="text-green-600 shrink-0" />

  const activeStage: ActiveStage = current === 'error' ? 'transcribing' : current
  const stageIdx = STAGE_ORDER.indexOf(stage)
  const currentIdx = STAGE_ORDER.indexOf(activeStage)

  if (stageIdx < currentIdx)
    return <CheckCircle size={16} className="text-green-600 shrink-0" />
  if (stageIdx === currentIdx && current !== 'error')
    return <Loader size={16} className="animate-spin shrink-0" style={{ color: 'var(--color-ui-blue-600)' }} />
  return <Circle size={16} className="shrink-0" style={{ color: 'var(--color-icon-tertiary)' }} />
}

function ProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meetingId = searchParams.get('meetingId')

  const [stage, setStage] = useState<Stage>('transcribing')
  const [errorMsg, setErrorMsg] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!meetingId) {
      setStage('error')
      setErrorMsg('No meeting ID provided.')
      return
    }

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/transcribe/status?meetingId=${meetingId}`)
        const data = await res.json()

        if (data.status === 'error') {
          clearInterval(intervalRef.current!)
          setStage('error')
          setErrorMsg('Transcription failed. Please try again.')
          return
        }

        if (data.status === 'completed') {
          clearInterval(intervalRef.current!)
          setStage('extracting')

          const extractRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meeting_id: meetingId }),
          })

          if (!extractRes.ok) {
            setStage('error')
            setErrorMsg('Task extraction failed. Please try again.')
            return
          }

          setStage('done')
          setTimeout(() => router.push(`/review/${meetingId}`), 800)
        }
      } catch {
        clearInterval(intervalRef.current!)
        setStage('error')
        setErrorMsg('Something went wrong. Please try again.')
      }
    }, 3000)

    return () => clearInterval(intervalRef.current!)
  }, [meetingId, router])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {stage === 'error' ? 'Something went wrong' : 'Processing your meeting'}
        </h1>
        {stage !== 'error' && (
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            This usually takes less than a minute
          </p>
        )}
        {stage === 'error' && (
          <p className="text-sm" style={{ color: 'var(--color-red-500)' }}>{errorMsg}</p>
        )}
      </div>

      {stage !== 'error' && (
        <div
          className="flex flex-col gap-3 w-72 rounded-xl p-5"
          style={{
            background: 'var(--color-bg-element)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {STAGES.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <StageIcon stage={key as ActiveStage} current={stage} />
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    key === stage
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-tertiary)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {stage === 'error' && (
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            background: 'var(--color-tgray-100)',
            color: 'var(--color-text-primary)',
          }}
        >
          Go back
        </button>
      )}
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
