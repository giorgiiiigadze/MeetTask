import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const meetingId = searchParams.get('meetingId')
  if (!meetingId) return NextResponse.json({ error: 'meetingId is required' }, { status: 400 })

  const { data: row, error: fetchError } = await supabase
    .from('meetings')
    .select('id, status, transcript, audio_url')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !row) {
    console.error('Row not found:', { 
      meetingId, 
      userId: user.id, 
      fetchError: fetchError?.message,
      fetchErrorCode: fetchError?.code
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  
  if (row.status === 'done' && row.transcript) {
    return NextResponse.json({ status: 'done', meetingId })
  }

  if (row.status === 'failed') {
    return NextResponse.json({ status: 'failed', meetingId })
  }

  const assemblyaiId = row.audio_url
  if (!assemblyaiId) return NextResponse.json({ error: 'No AssemblyAI job ID' }, { status: 400 })

  const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })
  let job: { status: string; text?: string | null; error?: string | null }
  try {
    job = await aai.transcripts.get(assemblyaiId)
  } catch (err) {
    console.error('AssemblyAI get failed:', err)
    return NextResponse.json({ error: 'Failed to check transcription status' }, { status: 502 })
  }

  if (job.status === 'completed' && job.text) {
    await supabase
      .from('meetings')
      .update({ transcript: job.text, status: 'done' })
      .eq('id', meetingId)

    return NextResponse.json({ status: 'done', meetingId })
  }

  if (job.status === 'error') {
    await supabase
      .from('meetings')
      .update({ status: 'failed' })
      .eq('id', meetingId)

    return NextResponse.json({ status: 'failed', meetingId })
  }

  return NextResponse.json({ status: 'processing', meetingId })
}