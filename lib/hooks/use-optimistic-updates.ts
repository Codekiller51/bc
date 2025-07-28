"use client"

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface OptimisticUpdate<T> {
  id: string
  data: T
  operation: 'create' | 'update' | 'delete'
  timestamp: number
}

interface UseOptimisticUpdatesOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error, rollbackData?: T) => void
  timeout?: number
}

export function useOptimisticUpdates<T extends { id: string }>(
  options: UseOptimisticUpdatesOptions<T> = {}
) {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map())
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const { onSuccess, onError, timeout = 10000 } = options

  // Add optimistic update
  const addOptimisticUpdate = useCallback((
    id: string,
    data: T,
    operation: 'create' | 'update' | 'delete'
  ) => {
    const update: OptimisticUpdate<T> = {
      id,
      data,
      operation,
      timestamp: Date.now()
    }

    setOptimisticUpdates(prev => new Map(prev).set(id, update))

    // Set timeout to remove optimistic update if not confirmed
    const timeoutId = setTimeout(() => {
      removeOptimisticUpdate(id)
      onError?.(new Error('Operation timed out'), data)
      toast.error('Operation timed out. Please try again.')
    }, timeout)

    timeoutsRef.current.set(id, timeoutId)
  }, [timeout, onError])

  // Remove optimistic update
  const removeOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })

    // Clear timeout
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  // Confirm optimistic update (call when server operation succeeds)
  const confirmOptimisticUpdate = useCallback((id: string, serverData?: T) => {
    const update = optimisticUpdates.get(id)
    if (update) {
      removeOptimisticUpdate(id)
      onSuccess?.(serverData || update.data)
    }
  }, [optimisticUpdates, removeOptimisticUpdate, onSuccess])

  // Rollback optimistic update (call when server operation fails)
  const rollbackOptimisticUpdate = useCallback((id: string, error: Error) => {
    const update = optimisticUpdates.get(id)
    if (update) {
      removeOptimisticUpdate(id)
      onError?.(error, update.data)
    }
  }, [optimisticUpdates, removeOptimisticUpdate, onError])

  // Apply optimistic updates to data array
  const applyOptimisticUpdates = useCallback((data: T[]): T[] => {
    let result = [...data]

    optimisticUpdates.forEach((update) => {
      switch (update.operation) {
        case 'create':
          // Add if not already in the array
          if (!result.some(item => item.id === update.data.id)) {
            result.push(update.data)
          }
          break

        case 'update':
          // Update existing item
          result = result.map(item =>
            item.id === update.data.id ? { ...item, ...update.data } : item
          )
          break

        case 'delete':
          // Remove item
          result = result.filter(item => item.id !== update.data.id)
          break
      }
    })

    return result
  }, [optimisticUpdates])

  // Check if an item has pending optimistic updates
  const hasPendingUpdate = useCallback((id: string) => {
    return optimisticUpdates.has(id)
  }, [optimisticUpdates])

  // Get pending update for an item
  const getPendingUpdate = useCallback((id: string) => {
    return optimisticUpdates.get(id)
  }, [optimisticUpdates])

  // Clear all optimistic updates
  const clearAllOptimisticUpdates = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId))
    timeoutsRef.current.clear()
    
    // Clear updates
    setOptimisticUpdates(new Map())
  }, [])

  return {
    optimisticUpdates: Array.from(optimisticUpdates.values()),
    addOptimisticUpdate,
    removeOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    applyOptimisticUpdates,
    hasPendingUpdate,
    getPendingUpdate,
    clearAllOptimisticUpdates
  }
}

// Specialized hook for booking optimistic updates
export function useOptimisticBookings() {
  const optimisticHook = useOptimisticUpdates({
    onSuccess: (booking) => {
      toast.success('Booking confirmed!')
    },
    onError: (error, booking) => {
      toast.error(`Booking failed: ${error.message}`)
    }
  })

  const createBookingOptimistically = useCallback(async (
    bookingData: any,
    serverOperation: () => Promise<any>
  ) => {
    const tempId = `temp-${Date.now()}`
    const optimisticBooking = {
      id: tempId,
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add optimistic update
    optimisticHook.addOptimisticUpdate(tempId, optimisticBooking, 'create')

    try {
      // Perform server operation
      const serverBooking = await serverOperation()
      
      // Confirm optimistic update
      optimisticHook.confirmOptimisticUpdate(tempId, serverBooking)
      
      return serverBooking
    } catch (error) {
      // Rollback optimistic update
      optimisticHook.rollbackOptimisticUpdate(tempId, error as Error)
      throw error
    }
  }, [optimisticHook])

  const updateBookingOptimistically = useCallback(async (
    bookingId: string,
    updates: any,
    serverOperation: () => Promise<any>
  ) => {
    // Add optimistic update
    optimisticHook.addOptimisticUpdate(bookingId, updates, 'update')

    try {
      // Perform server operation
      const updatedBooking = await serverOperation()
      
      // Confirm optimistic update
      optimisticHook.confirmOptimisticUpdate(bookingId, updatedBooking)
      
      return updatedBooking
    } catch (error) {
      // Rollback optimistic update
      optimisticHook.rollbackOptimisticUpdate(bookingId, error as Error)
      throw error
    }
  }, [optimisticHook])

  return {
    ...optimisticHook,
    createBookingOptimistically,
    updateBookingOptimistically
  }
}

// Hook for message optimistic updates
export function useOptimisticMessages() {
  const optimisticHook = useOptimisticUpdates({
    onError: (error) => {
      toast.error('Failed to send message')
    }
  })

  const sendMessageOptimistically = useCallback(async (
    messageData: any,
    serverOperation: () => Promise<any>
  ) => {
    const tempId = `temp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      ...messageData,
      created_at: new Date().toISOString(),
      read_at: null
    }

    // Add optimistic update
    optimisticHook.addOptimisticUpdate(tempId, optimisticMessage, 'create')

    try {
      // Perform server operation
      const serverMessage = await serverOperation()
      
      // Confirm optimistic update
      optimisticHook.confirmOptimisticUpdate(tempId, serverMessage)
      
      return serverMessage
    } catch (error) {
      // Rollback optimistic update
      optimisticHook.rollbackOptimisticUpdate(tempId, error as Error)
      throw error
    }
  }, [optimisticHook])

  return {
    ...optimisticHook,
    sendMessageOptimistically
  }
}