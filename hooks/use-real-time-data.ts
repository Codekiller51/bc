"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealTimeDataOptions<T> {
  table: string
  filter?: string
  select?: string
  initialData?: T[]
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (record: T) => void
  onError?: (error: Error) => void
}

export function useRealTimeData<T extends { id: string }>(
  options: UseRealTimeDataOptions<T>
) {
  const [data, setData] = useState<T[]>(options.initialData || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(options.table)
      
      if (options.select) {
        query = query.select(options.select)
      } else {
        query = query.select('*')
      }

      const { data: initialData, error } = await query

      if (error) {
        throw new Error(`Failed to load ${options.table}: ${error.message}`)
      }

      setData(initialData || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      options.onError?.(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [options.table, options.select, supabase])

  // Set up real-time subscription
  useEffect(() => {
    loadInitialData()

    // Create channel
    const channelName = `realtime:${options.table}:${Date.now()}`
    const channel = supabase.channel(channelName)

    // Subscribe to INSERT events
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: options.table,
      filter: options.filter
    }, (payload) => {
      const newRecord = payload.new as T
      
      setData(prev => {
        // Avoid duplicates
        if (prev.some(item => item.id === newRecord.id)) {
          return prev
        }
        return [...prev, newRecord]
      })
      
      options.onInsert?.(newRecord)
    })

    // Subscribe to UPDATE events
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: options.table,
      filter: options.filter
    }, (payload) => {
      const updatedRecord = payload.new as T
      
      setData(prev => prev.map(item => 
        item.id === updatedRecord.id ? updatedRecord : item
      ))
      
      options.onUpdate?.(updatedRecord)
    })

    // Subscribe to DELETE events
    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: options.table,
      filter: options.filter
    }, (payload) => {
      const deletedRecord = payload.old as T
      
      setData(prev => prev.filter(item => item.id !== deletedRecord.id))
      
      options.onDelete?.(deletedRecord)
    })

    // Subscribe and handle connection status
    channel.subscribe((status) => {
      setConnectionStatus(
        status === 'SUBSCRIBED' ? 'connected' :
        status === 'CHANNEL_ERROR' ? 'disconnected' :
        'connecting'
      )
    })

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [options.table, options.filter, loadInitialData])

  // Manual refresh
  const refresh = useCallback(() => {
    loadInitialData()
  }, [loadInitialData])

  // Add item optimistically
  const addOptimistic = useCallback((item: T) => {
    setData(prev => [...prev, item])
  }, [])

  // Update item optimistically
  const updateOptimistic = useCallback((id: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  // Remove item optimistically
  const removeOptimistic = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id))
  }, [])

  return {
    data,
    loading,
    error,
    connectionStatus,
    refresh,
    addOptimistic,
    updateOptimistic,
    removeOptimistic
  }
}

// Specialized hooks for common use cases

export function useRealTimeBookings(userId?: string) {
  return useRealTimeData({
    table: 'bookings',
    filter: userId ? `client_id=eq.${userId}` : undefined,
    select: `
      *,
      client:client_profiles(*),
      creative:creative_profiles(*),
      service:services(*)
    `,
    onInsert: (booking) => {
      console.log('New booking received:', booking)
    },
    onUpdate: (booking) => {
      console.log('Booking updated:', booking)
    }
  })
}

export function useRealTimeMessages(conversationId: string) {
  return useRealTimeData({
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
    select: `
      *,
      sender:users(*)
    `,
    onInsert: (message) => {
      // Play notification sound for new messages
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New message', {
          body: message.content,
          icon: '/favicon.ico'
        })
      }
    }
  })
}

export function useRealTimeNotifications(userId: string) {
  return useRealTimeData({
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: (notification) => {
      // Show toast for new notifications
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('new-notification', { 
          detail: notification 
        })
        window.dispatchEvent(event)
      }
    }
  })
}

// Connection status hook
export function useConnectionStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('online')
  
  useEffect(() => {
    const handleOnline = () => setStatus('online')
    const handleOffline = () => setStatus('offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return status
}