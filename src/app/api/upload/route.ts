import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@/lib/server'

const ACCEPTED = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'video/mp4', 'video/webm']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string | null) ?? file?.name ?? 'Untitled recording'

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })
  if (!ACCEPTED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  const buffer = await file.arrayBuffer()

  const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })
  let aaiTranscript: { id: string }
  try {
    aaiTranscript = await aai.transcripts.submit({ audio: buffer })
  } catch (err) {
    console.error('AssemblyAI submit failed:', err)
    return NextResponse.json({ error: 'Failed to submit transcription job' }, { status: 502 })
  }

  const { data, error } = await supabase
    .from('transcripts')
    .insert({
      user_id: user.id,
      title,
      source: 'upload',
      metadata: { assemblyai_id: aaiTranscript.id, status: 'processing' },
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ meetingId: data.id }, { status: 201 })
}
