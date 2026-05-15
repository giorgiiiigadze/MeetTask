import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { SYSTEM_PROMPT } from '@/lib/prompt'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

  if (meeting_id) {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('meeting_id', meeting_id)

    if (count && count > 0) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('*')
        .eq('meeting_id', meeting_id)
      return NextResponse.json({ tasks: existing ?? [] }, { status: 200 })
    }
  }

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
    tasks = parsed.tasks ?? []
  } catch (err) {
    console.error('OpenAI extraction failed:', err)
    return NextResponse.json({ error: 'Task extraction failed' }, { status: 502 })
  }

  if (tasks.length === 0) {
    return NextResponse.json({ tasks: [] }, { status: 200 })
  }

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

  const { data, error } = await supabase
    .from('tasks')
    .insert(rows)
    .select()

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ tasks, warning: 'tasks table does not exist yet' }, { status: 200 })
    }
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('tasks')
        .select('*')
        .eq('meeting_id', meeting_id)
      return NextResponse.json({ tasks: existing ?? [] }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: data }, { status: 201 })
}