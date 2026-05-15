import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are an assistant that extracts action items from meeting transcripts.

Given a transcript, return a JSON array of tasks. Each task must have:
- title: short, clear action item title (start with a verb)
- assignee: name of the person responsible, or null if unclear
- due_date: ISO 8601 date string (YYYY-MM-DD) if a deadline is mentioned, or null
- priority: one of "high", "medium", or "low" based on urgency/importance
- description: one sentence of context from the transcript

Return ONLY the JSON array, no markdown, no explanation. If there are no tasks, return [].

Example output:
[
  {
    "title": "Send Q2 report to stakeholders",
    "assignee": "Sarah",
    "due_date": "2024-06-15",
    "priority": "high",
    "description": "Sarah agreed to send the Q2 report before the board meeting on June 15."
  }
]`

export async function POST(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { transcript, meeting_id } = body

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  // Extract tasks via OpenAI
  let tasks: {
    title: string
    assignee: string | null
    due_date: string | null
    priority: 'high' | 'medium' | 'low'
    description: string
  }[]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Extract all action items from this meeting transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.2,
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)
    // Handle both {tasks:[...]} and [...] shapes
    tasks = Array.isArray(parsed) ? parsed : (parsed.tasks ?? [])
  } catch (err) {
    console.error('OpenAI extraction failed:', err)
    return NextResponse.json({ error: 'Task extraction failed' }, { status: 502 })
  }

  if (tasks.length === 0) {
    return NextResponse.json({ tasks: [] }, { status: 200 })
  }

  // Persist to Supabase
  const rows = tasks.map((t) => ({
    user_id: session.user.id,
    meeting_id: meeting_id ?? null,
    title: t.title,
    assignee: t.assignee ?? null,
    due_date: t.due_date ?? null,
    priority: t.priority,
    description: t.description,
    status: 'pending',
  }))

  const { data, error } = await supabase.from('tasks').insert(rows).select()

  if (error) {
    // Table may not exist yet — return extracted tasks without persisting
    if (error.code === '42P01') {
      return NextResponse.json({ tasks, warning: 'tasks table does not exist yet' }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: data }, { status: 201 })
}
