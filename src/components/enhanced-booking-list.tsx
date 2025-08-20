"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, User, DollarSign, RefreshCw, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { useRealTimeBookings } from "@/hooks/use-real-time-data"
import { useOptimisticBookings } from "@/lib/hooks/use-optimistic-updates"
import { ApiErrorHandler } from "@/lib/api/error-handler"
import type { Booking } from "@/lib/database/types"

interface EnhancedBookingListProps {
  userId?: string
  filters?: {
    status?: string
    creativeId?: string
  }
}

export function EnhancedBookingList({ userId, filters }: EnhancedBookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Real-time data hook
  const {
    data: realtimeBookings,
    loading: realtimeLoading,
    error: realtimeError,
    connectionStatus,
    refresh
  } = useRealTimeBookings(userId)

  // Optimistic updates hook
  const {
    applyOptimisticUpdates,
    updateBookingOptimistically,
    hasPendingUpdate
  } = useOptimisticBookings()

  // Load initial bookings
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await EnhancedDatabaseService.getBookings({
        userId,
        ...filters
      })
      
      setBookings(data)
      setRetryCount(0) // Reset retry count on success
      
    } catch (error) {
      const apiError = ApiErrorHandler.handle(error)
      setError(apiError.message)
      
      // Automatic retry with exponential backoff
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadBookings()
        }, Math.pow(2, retryCount) * 1000)
      }
    } finally {
      setLoading(false)
    }
  }, [userId, filters, retryCount])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Update bookings when real-time data changes
  useEffect(() => {
    if (realtimeBookings.length > 0) {
      setBookings(realtimeBookings)
    }
  }, [realtimeBookings])

  // Handle booking status update
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingOptimistically(
        bookingId,
        { status: newStatus, updated_at: new Date().toISOString() },
        () => EnhancedDatabaseService.updateBookingStatus(bookingId, newStatus)
      )
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  // Apply optimistic updates to bookings
  const displayBookings = applyOptimisticUpdates(bookings)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  // Loading skeleton
  if (loading && displayBookings.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error && displayBookings.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          
          <div className="flex justify-center gap-2">
            <Button 
              onClick={loadBookings}
              disabled={retryCount >= 3}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      {connectionStatus !== 'connected' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {connectionStatus === 'connecting' ? 'Connecting to real-time updates...' : 'Real-time updates disconnected'}
          </AlertDescription>
        </Alert>
      )}

      {/* Bookings list */}
      {displayBookings.map((booking, index) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`${hasPendingUpdate(booking.id) ? 'opacity-75' : ''}`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <User className="h-full w-full p-2 bg-gray-100 dark:bg-gray-800" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">
                      {booking.client?.name || booking.creative?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">
                        {new Intl.NumberFormat("sw-TZ", {
                          style: "currency",
                          currency: "TZS",
                          minimumFractionDigits: 0,
                        }).format(booking.total_amount)}
                      </span>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                      {hasPendingUpdate(booking.id) && ' (updating...)'}
                    </Badge>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        disabled={hasPendingUpdate(booking.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        disabled={hasPendingUpdate(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {displayBookings.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filters?.status 
              ? `No ${filters.status} bookings at the moment`
              : 'You haven\'t made any bookings yet'
            }
          </p>
        </Card>
      )}
    </div>
  )
}