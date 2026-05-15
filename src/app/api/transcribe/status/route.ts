import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@/lib/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const meetingId = searchParams.get('meetingId')
  if (!meetingId) return NextResponse.json({ error: 'meetingId is required' }, { status: 400 })

  const { data: row, error: fetchError } = await supabase
    .from('transcripts')
    .select('id, metadata, content')
    .eq('id', meetingId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Already completed — no need to poll AssemblyAI again
  if (row.metadata?.status === 'completed' && row.content) {
    return NextResponse.json({ status: 'completed', meetingId })
  }

  const assemblyaiId = row.metadata?.assemblyai_id
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
      .from('transcripts')
      .update({
        content: job.text,
        metadata: { ...row.metadata, status: 'completed' },
      })
      .eq('id', meetingId)
  }

  if (job.status === 'error') {
    await supabase
      .from('transcripts')
      .update({ metadata: { ...row.metadata, status: 'error', error: job.error } })
      .eq('id', meetingId)
  }

  return NextResponse.json({ status: job.status, meetingId })
}
