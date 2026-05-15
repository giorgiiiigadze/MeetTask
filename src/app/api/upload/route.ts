import { NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ACCEPTED = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'video/mp4', 'video/webm']

export async function POST(request: Request) {
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
    .from('meetings')                          // ✅ correct table
    .insert({
      user_id: user.id,
      title,
      audio_url: aaiTranscript.id,            // ✅ store AssemblyAI job ID here
      status: 'processing',                   // ✅ valid status
    })
    .select('id')
    .single()

  if (error) {
    console.error('Supabase insert failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ meetingId: data.id }, { status: 201 })
}