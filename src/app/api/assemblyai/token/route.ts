import { NextResponse } from "next/server"
import { AssemblyAI } from "assemblyai"
import { createClient } from "@/lib/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })
        const token = await client.streaming.createTemporaryToken({ expires_in_seconds: 600 })

        return NextResponse.json({ token })
    } catch (err) {
        console.error("Token route error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}