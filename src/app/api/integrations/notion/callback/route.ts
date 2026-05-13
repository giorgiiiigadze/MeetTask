import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/settings/integrations?error=no_code', req.url))
  }

  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
      ).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    }),
  })

  const data = await response.json()

  if (!data.access_token) {
    return NextResponse.redirect(new URL('/settings/integrations?error=no_token', req.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('integrations').upsert({
      user_id: user?.id,
      provider: 'notion',
      access_token: data.access_token,
      workspace_id: data.workspace_id,
      workspace_name: data.workspace_name,
      workspace_icon: data.workspace_icon?.url ?? null,
      last_synced: new Date().toISOString(),
  })

  return NextResponse.redirect(new URL('/settings/integrations?success=notion', req.url))
}