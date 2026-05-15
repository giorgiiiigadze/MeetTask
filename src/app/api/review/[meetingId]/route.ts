import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const cookieStore = await cookies()
  const { meetingId } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: meeting, error: meetingError }, { data: tasks }] =
    await Promise.all([
      supabase
        .from('meetings')
        .select('title, transcript')
        .eq('id', meetingId)
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('tasks')
        .select('id, title, assignee, due_date, priority, description, status')
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ])

  if (meetingError || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  }

  return NextResponse.json({ meeting, tasks: tasks ?? [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const cookieStore = await cookies()
  const { meetingId } = await params

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { taskId, status } = await request.json()
  if (!taskId || !status) {
    return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}