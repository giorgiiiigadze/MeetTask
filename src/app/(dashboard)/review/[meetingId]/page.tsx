'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Clock, User, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react'

type Priority = 'high' | 'medium' | 'low'
type Task = {
  id: string
  title: string
  assignee: string | null
  due_date: string | null
  priority: Priority
  description: string
  status: string
}
type Meeting = {
  title: string
  transcript: string
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: 'High',   color: 'var(--color-red-500)',    bg: 'rgba(239,68,68,0.08)'  },
  medium: { label: 'Medium', color: 'var(--color-ui-blue-600)', bg: 'rgba(59,130,246,0.08)' },
  low:    { label: 'Low',    color: 'var(--color-text-tertiary)', bg: 'var(--color-state-hover)' },
}

export default function ReviewPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/review/${meetingId}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setTasks(data.tasks)
        setMeeting(data.meeting)
      } catch {
        setError('Failed to load review data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [meetingId])

  async function toggleTask(id: string, current: string) {
    const next = current === 'done' ? 'pending' : 'done'
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
    await fetch(`/api/review/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: id, status: next }),
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading…</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <span className="text-sm" style={{ color: 'var(--color-red-500)' }}>{error}</span>
    </div>
  )

  const done = tasks.filter(t => t.status === 'done').length

  console.log(tasks)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

      <div className="flex items-start gap-3">
        <button
          onClick={() => router.back()}
          className="mt-0.5 p-1.5 rounded-md"
          style={{ color: 'var(--color-icon-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-state-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {meeting?.title ?? 'Meeting Review'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {tasks.length === 0
              ? 'No action items found'
              : `${done} of ${tasks.length} tasks completed`}
          </p>
        </div>
      </div>

      {tasks.length > 0 && (
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--color-border-primary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(done / tasks.length) * 100}%`,
              background: 'var(--color-ui-blue-600)',
            }}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 py-16 rounded-xl"
          style={{ background: 'var(--color-bg-element)', border: '1px solid var(--color-border-primary)' }}
        >
          <CheckCircle2 size={28} style={{ color: 'var(--color-text-tertiary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            No action items were found
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Try uploading a recording with clear action items
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map(task => {
            const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low
            const isDone = task.status === 'done'
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 px-4 py-3 rounded-xl transition-opacity"
                style={{
                  background: 'var(--color-bg-element)',
                  border: '1px solid var(--color-border-primary)',
                  opacity: isDone ? 0.5 : 1,
                }}
              >
                <button
                  onClick={() => toggleTask(task.id, task.status)}
                  className="mt-0.5 shrink-0"
                  style={{ color: isDone ? 'var(--color-ui-blue-600)' : 'var(--color-icon-tertiary)' }}
                >
                  {isDone
                    ? <CheckCircle2 size={18} />
                    : <Circle size={18} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--color-text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {/* Priority badge */}
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{ color: p.color, background: p.bg }}
                    >
                      {p.label}
                    </span>
                    {/* Assignee */}
                    {task.assignee && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <User size={11} />
                        {task.assignee}
                      </span>
                    )}
                    {/* Due date */}
                    {task.due_date && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <Clock size={11} />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Transcript */}
      {meeting?.transcript && (
        <details className="group">
          <summary
            className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none list-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
            View transcript
          </summary>
          <div
            className="mt-3 px-4 py-3 rounded-xl text-xs leading-relaxed"
            style={{
              background: 'var(--color-bg-element)',
              border: '1px solid var(--color-border-primary)',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {meeting.transcript}
          </div>
        </details>
      )}
    </div>
  )
}