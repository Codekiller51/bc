"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Shield, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGlobalSessionManagement } from "@/hooks/use-session-management"

export function SessionStatusIndicator() {
  const {
    sessionState,
    extendSession,
    getFormattedTimeUntilExpiry,
    isSessionExpiringSoon
  } = useGlobalSessionManagement()

  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Show indicator when session is expiring soon or warning is shown
    setShowIndicator(sessionState.isActive && (isSessionExpiringSoon() || sessionState.warningShown))
  }, [sessionState, isSessionExpiringSoon])

  if (!sessionState.isActive || !showIndicator) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Session Expiring Soon
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Time remaining: {getFormattedTimeUntilExpiry()}
                  </p>
                </div>
              </div>
              
              <Button
                onClick={extendSession}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Extend
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export function SessionStatusBadge() {
  const { sessionState, getFormattedTimeUntilExpiry, isSessionExpiringSoon } = useGlobalSessionManagement()

  if (!sessionState.isActive) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400">
        <Shield className="h-3 w-3 mr-1" />
        Not Authenticated
      </Badge>
    )
  }

  if (isSessionExpiringSoon()) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
        <Clock className="h-3 w-3 mr-1" />
        Expires in {getFormattedTimeUntilExpiry()}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
      <Shield className="h-3 w-3 mr-1" />
      Active Session
    </Badge>
  )
}