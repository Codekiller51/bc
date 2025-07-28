import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// GET /api/availability?creativeId={id}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const creativeId = searchParams.get("creativeId")

  if (!creativeId) {
    return NextResponse.json({ error: "Creative ID is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  const { data: availability, error } = await supabase
    .from("creative_availability")
    .select("*")
    .eq("creative_id", creativeId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(availability)
}

// POST /api/availability
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const json = await request.json()

  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { creative_id, recurring_availability, buffer_time } = json

  if (!creative_id || !recurring_availability) {
    return NextResponse.json(
      { error: "Creative ID and recurring availability are required" },
      { status: 400 }
    )
  }

  // Verify user owns this creative profile or is admin
  const { data: profile, error: profileError } = await supabase
    .from("creative_profiles")
    .select("user_id")
    .eq("id", creative_id)
    .single()

  if (profileError || profile.user_id !== session.session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("creative_availability")
    .upsert(
      {
        creative_id,
        recurring_availability,
        buffer_time: buffer_time || 30,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "creative_id" }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/availability
export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const json = await request.json()

  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { creative_id, ...updateData } = json

  if (!creative_id) {
    return NextResponse.json({ error: "Creative ID is required" }, { status: 400 })
  }

  // Verify user owns this creative profile or is admin
  const { data: profile, error: profileError } = await supabase
    .from("creative_profiles")
    .select("user_id")
    .eq("id", creative_id)
    .single()

  if (profileError || profile.user_id !== session.session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("creative_availability")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("creative_id", creative_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}