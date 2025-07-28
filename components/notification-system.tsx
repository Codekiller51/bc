'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

type Notification = {
  id: string
  type: 'booking' | 'message' | 'system'
  message: string
  read: boolean
  created_at: string
  sender?: {
    full_name: string
    avatar_url: string
  }
  booking?: {
    id: string
    title: string
    status: string
  }
}

export function NotificationSystem() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
      subscribeToNotifications()
    }

    return () => {
      supabase.channel('notifications').unsubscribe()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${session?.user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      })
    }
  }

  const subscribeToNotifications = () => {
    supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_events',
          filter: `recipient_id=eq.${session?.user?.id}`
        },
        (payload) => {
          fetchNotifications()
          toast({
            title: 'New Notification',
            description: 'You have a new notification',
            variant: 'default'
          })
        }
      )
      .subscribe()
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      })

      if (!response.ok) throw new Error('Failed to update notification')

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notification',
        variant: 'destructive'
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅'
      case 'message':
        return '💬'
      default:
        return '🔔'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg ${!notification.read ? 'bg-muted' : ''}`}
                >
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    {notification.booking && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Booking: {notification.booking.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}