import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createClient()

    const { data } = await supabase
        .from("integrations")
        .select("access_token")
        .eq("provider", "notion")
        .maybeSingle()

    if (!data?.access_token) {
        return NextResponse.json({ error: "Notion not connected" }, { status: 401 })
    }

    const notion = new Client({ auth: data.access_token })

    const response = await notion.search({
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
    })

    return NextResponse.json({ pages: response.results })
}