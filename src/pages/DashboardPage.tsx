'use client'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/enhanced-auth-provider'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (loading) return
    
    if (!user) {
      navigate('/login')
      return
    }
    
    // Redirect based on user role
    if (user.role === 'admin') {
      navigate('/admin')
    } else if (user.role === 'creative') {
      navigate('/dashboard/creative')
    } else {
      navigate('/dashboard/overview')
    }
  }, [user, loading, navigate])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return null
}