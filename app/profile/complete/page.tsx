"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { ProfileCompletionWizard } from "@/components/profile-completion-wizard"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"

function ProfileCompletePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userType, setUserType] = useState<'client' | 'creative'>('client')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    determineUserType()
  }, [user])

  const determineUserType = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Check if user has a creative profile
      const creativeProfile = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
      
      if (creativeProfile) {
        setUserType('creative')
      } else {
        setUserType('client')
      }
    } catch (error) {
      console.error('Failed to determine user type:', error)
      // Default to client if we can't determine
      setUserType('client')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    // Redirect based on user type
    if (userType === 'creative') {
      router.push('/dashboard/creative')
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile setup...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ProfileCompletionWizard
        onComplete={handleComplete}
        userType={userType}
      />
    </motion.div>
  )
}

export default withAuth(ProfileCompletePage)