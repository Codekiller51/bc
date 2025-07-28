import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:users!sender_id(full_name, avatar_url),
        booking:bookings(id, title, status)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipient_id, type, message, sender_id, booking_id } = body

    if (!recipient_id || !type || !message) {
      return NextResponse.json(
        { error: 'recipient_id, type, and message are required' },
        { status: 400 }
      )
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id,
        type,
        message,
        sender_id,
        booking_id,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Trigger real-time update
    await supabase
      .from('notification_events')
      .insert({
        notification_id: notification.id,
        recipient_id,
        event_type: 'created'
      })

    revalidatePath('/notifications')
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/notifications')
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}