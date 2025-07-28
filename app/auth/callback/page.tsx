"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmailVerificationService } from "@/lib/services/email-verification-service"
import { useAuth } from "@/components/enhanced-auth-provider"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        throw new Error(errorDescription || error)
      }

      if (type === 'email' && token) {
        // Handle email verification
        const result = await EmailVerificationService.verifyEmail(token)
        
        if (result.success) {
          setStatus('success')
          setMessage('Email verified successfully! You can now access all features.')
          
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push(user ? '/dashboard' : '/login')
          }, 3000)
        } else {
          throw new Error(result.error || 'Email verification failed')
        }
      } else if (type === 'recovery') {
        // Handle password reset
        setStatus('success')
        setMessage('Password reset link verified. You can now set a new password.')
        
        setTimeout(() => {
          router.push('/auth/reset-password')
        }, 2000)
      } else {
        // Handle general auth callback
        setStatus('success')
        setMessage('Authentication successful!')
        
        setTimeout(() => {
          router.push(user ? '/dashboard' : '/login')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Auth callback error:', error)
      setStatus('error')
      setMessage(error.message || 'Authentication failed')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-emerald-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              {getStatusIcon()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                {status === 'loading' && 'Processing...'}
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Error'}
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>

              {status === 'error' && (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => router.push('/help')}
                    variant="outline"
                    className="w-full"
                  >
                    Get Help
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}

              {status === 'success' && (
                <p className="text-sm text-gray-500">
                  Redirecting you automatically...
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}