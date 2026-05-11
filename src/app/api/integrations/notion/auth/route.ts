import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID
  const redirectUri = encodeURIComponent(process.env.NOTION_REDIRECT_URI!)

  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&owner=user`

  return NextResponse.redirect(authUrl)
}