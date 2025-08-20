"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Mail, 
  Phone, 
  RefreshCw,
  FileText,
  User,
  Star
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/enhanced-auth-provider"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import { EmailVerificationService } from "@/lib/services/email-verification-service"
import type { CreativeProfile } from "@/lib/database/types"

export function CreativeApprovalWorkflow() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CreativeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)

  useEffect(() => {
    loadProfile()
    checkEmailVerification()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const profileData = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailVerification = async () => {
    const verified = await EmailVerificationService.checkVerificationStatus()
    setEmailVerified(verified)
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      await EmailVerificationService.resendVerificationEmail()
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setResendingEmail(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          title: 'Profile Under Review',
          description: 'Your profile is being reviewed by our admin team'
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          title: 'Profile Approved',
          description: 'Your profile is live and visible to clients'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          title: 'Profile Needs Attention',
          description: 'Your profile requires additional information'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          title: 'Unknown Status',
          description: 'Please contact support'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load your creative profile. Please contact support.
          </p>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(profile.approval_status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Email Verification Alert */}
      {!emailVerified && (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Please verify your email address to complete your profile setup.</span>
            <Button
              onClick={handleResendVerification}
              disabled={resendingEmail}
              size="sm"
              variant="outline"
            >
              {resendingEmail ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Mail className="h-3 w-3 mr-1" />
              )}
              Resend Email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${statusConfig.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 bg-')}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{statusConfig.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 font-normal">
                {statusConfig.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={statusConfig.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {profile.approval_status.charAt(0).toUpperCase() + profile.approval_status.slice(1)}
              </Badge>
              
              {profile.approved_at && (
                <span className="text-sm text-gray-500">
                  {profile.approval_status === 'approved' ? 'Approved' : 'Updated'} on{' '}
                  {new Date(profile.approved_at).toLocaleDateString()}
                </span>
              )}
            </div>

            <Separator />

            {/* Profile Completeness */}
            <div>
              <h3 className="font-semibold mb-4">Profile Completeness</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Basic Information</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Email Verification</span>
                  </div>
                  {emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Professional Details</span>
                  </div>
                  {profile.title && profile.bio ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Skills & Portfolio</span>
                  </div>
                  {profile.skills && profile.skills.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Status-specific Content */}
            {profile.approval_status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg"
              >
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Admin reviews your profile and portfolio</li>
                  <li>• Verification of credentials and work samples</li>
                  <li>• Approval notification via email and SMS</li>
                  <li>• Profile becomes visible to potential clients</li>
                </ul>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3">
                  <strong>Estimated review time:</strong> 2-3 business days
                </p>
              </motion.div>
            )}

            {profile.approval_status === 'approved' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
              >
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Congratulations! 🎉
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Your profile is now live and visible to clients across Tanzania. 
                  You can start receiving booking requests immediately.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    View My Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    Manage Availability
                  </Button>
                </div>
              </motion.div>
            )}

            {profile.approval_status === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"
              >
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Profile Needs Improvement
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Your profile requires additional information or improvements. 
                  Common reasons include incomplete portfolio, unclear professional information, 
                  or missing verification documents.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact Support
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Edit Profile
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Contact Support */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Our support team is here to help you with any questions about the approval process.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>support@brandconnect.co.tz</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>+255 123 456 789</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}