'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/enhanced-auth-provider'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }
    
    // Redirect based on user role
    if (user.role === 'admin') {
      router.push('/admin')
    } else if (user.role === 'creative') {
      router.push('/dashboard/creative')
    } else {
      router.push('/dashboard/overview')
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return null
}
