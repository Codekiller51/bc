import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AvailabilitySettings } from "@/components/availability-settings"

export const dynamic = "force-dynamic"

export default async function AvailabilityPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the creative profile for the logged-in user
  const { data: profile } = await supabase
    .from("creative_profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (!profile) {
    redirect("/dashboard/profile")
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Manage Availability</h1>
        <AvailabilitySettings creativeId={profile.id} />
      </div>
    </div>
  )
}