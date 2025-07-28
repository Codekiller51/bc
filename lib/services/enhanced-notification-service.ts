import type { Notification } from "@/lib/database/types"

export class EnhancedNotificationService {
  // Email notifications
  static async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, content }),
      })

      return response.ok
    } catch (error) {
      console.error("Email notification failed:", error)
      return false
    }
  }

  // SMS notifications
  static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message }),
      })

      return response.ok
    } catch (error) {
      console.error("SMS notification failed:", error)
      return false
    }
  }

  // In-app notifications
  static async createNotification(notification: Partial<Notification>): Promise<Notification | null> {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      })

      if (!response.ok) throw new Error("Failed to create notification")
      
      return await response.json()
    } catch (error) {
      console.error("Failed to create notification:", error)
      return null
    }
  }

  // Booking notifications
  static async sendBookingConfirmation(booking: any, creative: any, client: any): Promise<void> {
    const emailContent = `
      <h2>Booking Confirmation</h2>
      <p>Dear ${client.name},</p>
      <p>Your booking with ${creative.name} has been confirmed!</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
      <p>We'll send you a reminder before your appointment.</p>
    `

    const smsMessage = `Brand Connect: Your booking with ${creative.name} is confirmed for ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}. Booking ID: ${booking.id}`

    await Promise.all([
      this.sendEmail(client.email, "Booking Confirmation - Brand Connect", emailContent),
      this.sendSMS(client.phone, smsMessage),
      this.createNotification({
        user_id: client.id,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking with ${creative.name} has been confirmed`,
        data: { booking_id: booking.id },
      }),
    ])
  }

  static async sendBookingReminder(booking: any, creative: any, client: any): Promise<void> {
    const emailContent = `
      <h2>Booking Reminder</h2>
      <p>Dear ${client.name},</p>
      <p>This is a reminder about your upcoming booking:</p>
      <p><strong>Creative:</strong> ${creative.name}</p>
      <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
      <p><strong>Location:</strong> ${creative.location}</p>
      <p>Contact: ${creative.phone}</p>
    `

    const smsMessage = `Reminder: You have a booking with ${creative.name} tomorrow at ${booking.start_time}. Location: ${creative.location}. Contact: ${creative.phone}`

    await Promise.all([
      this.sendEmail(client.email, "Booking Reminder - Brand Connect", emailContent),
      this.sendSMS(client.phone, smsMessage),
    ])
  }

  static async sendStatusUpdateNotification(booking: any, newStatus: string, user: any): Promise<void> {
    const statusMessages = {
      confirmed: "Your booking has been confirmed",
      in_progress: "Your booking is now in progress",
      completed: "Your booking has been completed",
      cancelled: "Your booking has been cancelled"
    }

    const message = statusMessages[newStatus as keyof typeof statusMessages] || `Booking status updated to ${newStatus}`
    const smsMessage = `Brand Connect: ${message}. Booking ID: ${booking.id}`

    await Promise.all([
      this.sendSMS(user.phone, smsMessage),
      this.createNotification({
        user_id: user.id,
        type: "booking_status_update",
        title: "Booking Status Update",
        message,
        data: { booking_id: booking.id, status: newStatus },
      }),
    ])
  }

  static async sendNewMessageNotification(message: any, recipient: any, sender: any): Promise<void> {
    const smsMessage = `New message from ${sender.name}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`

    await Promise.all([
      this.sendSMS(recipient.phone, smsMessage),
      this.createNotification({
        user_id: recipient.id,
        type: "new_message",
        title: `New message from ${sender.name}`,
        message: message.content,
        data: { 
          conversation_id: message.conversation_id,
          sender_id: sender.id 
        },
      }),
    ])
  }

  static async sendPaymentReceipt(payment: any, booking: any): Promise<void> {
    const emailContent = `
      <h2>Payment Receipt</h2>
      <p>Thank you for your payment!</p>
      <p><strong>Amount:</strong> ${new Intl.NumberFormat("sw-TZ", { style: "currency", currency: "TZS" }).format(payment.amount)}</p>
      <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p>Your payment has been processed successfully.</p>
    `

    await this.sendEmail(booking.clientEmail, "Payment Receipt - Brand Connect", emailContent)
  }

  static async sendApprovalNotification(profileId: string, status: 'approved' | 'rejected'): Promise<void> {
    try {
      // Get creative profile and user data
      const profile = await EnhancedDatabaseService.getCreativeProfileById(profileId)
      if (!profile) return

      const { data: { user } } = await supabase.auth.getUser()
      const userEmail = user?.email
      const userName = user?.user_metadata?.full_name || profile.title
      const userPhone = user?.user_metadata?.phone

      if (status === 'approved') {
        const emailContent = `
          <h2>Profile Approved - Welcome to Brand Connect!</h2>
          <p>Dear ${userName},</p>
          <p>Congratulations! Your creative professional profile has been approved and is now live on Brand Connect.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Complete your portfolio with your best work samples</li>
            <li>Set up your services and pricing</li>
            <li>Start receiving booking requests from clients</li>
          </ul>
          <p>Your profile is now visible to potential clients across Tanzania. Start building your creative business today!</p>
          <p>Best regards,<br>The Brand Connect Team</p>
        `

        const smsMessage = `Brand Connect: Congratulations! Your creative profile has been approved. You can now receive bookings from clients. Login to complete your portfolio.`

        await Promise.all([
          userEmail && this.sendEmail(userEmail, "Profile Approved - Brand Connect", emailContent),
          userPhone && this.sendSMS(userPhone, smsMessage),
          this.createNotification({
            user_id: profile.user_id,
            type: "approval",
            title: "Profile Approved!",
            message: "Your creative professional profile has been approved and is now live.",
            data: { profile_id: profileId, status: 'approved' },
          }),
        ])
      } else {
        const emailContent = `
          <h2>Profile Review Update</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your interest in joining Brand Connect as a creative professional.</p>
          <p>After reviewing your profile, we need additional information or improvements before we can approve your account.</p>
          <p><strong>Common reasons for profile review:</strong></p>
          <ul>
            <li>Portfolio samples need to be more comprehensive</li>
            <li>Professional information requires clarification</li>
            <li>Additional verification documents needed</li>
          </ul>
          <p>Please contact our support team at support@brandconnect.co.tz for specific feedback and guidance on improving your profile.</p>
          <p>We're here to help you succeed!</p>
          <p>Best regards,<br>The Brand Connect Team</p>
        `

        const smsMessage = `Brand Connect: Your profile needs additional review. Please contact support@brandconnect.co.tz for guidance on completing your application.`

        await Promise.all([
          userEmail && this.sendEmail(userEmail, "Profile Review Update - Brand Connect", emailContent),
          userPhone && this.sendSMS(userPhone, smsMessage),
          this.createNotification({
            user_id: profile.user_id,
            type: "approval",
            title: "Profile Needs Review",
            message: "Your profile requires additional information. Please contact support for guidance.",
            data: { profile_id: profileId, status: 'rejected' },
          }),
        ])
      }
    } catch (error) {
      console.error('Failed to send approval notification:', error)
    }
  }
}