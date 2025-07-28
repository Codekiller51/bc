import { Metadata } from "next"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"

import { EnhancedAuthProvider } from "@/components/enhanced-auth-provider"
import { CreativeSidebar } from "@/components/creative-sidebar"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Dashboard - Brand Connect",
  description: "Manage your Brand Connect account and bookings",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  const isCreative = profile?.role === "creative"

  return (
    <EnhancedAuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {isCreative && <CreativeSidebar />}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </EnhancedAuthProvider>
  )
}