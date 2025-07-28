interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: Date
}

interface PageView {
  page: string
  title: string
  userId?: string
  timestamp?: Date
}

export class AnalyticsService {
  private static isEnabled = process.env.NODE_ENV === 'production'
  
  static track(event: AnalyticsEvent): void {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event)
      return
    }
    
    // In production, integrate with analytics services like:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - PostHog
    
    try {
      // Example: Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, {
          ...event.properties,
          user_id: event.userId,
        })
      }
      
      // Example: Custom analytics endpoint
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(console.error)
      
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }
  
  static pageView(pageView: PageView): void {
    this.track({
      name: 'page_view',
      properties: {
        page: pageView.page,
        title: pageView.title,
      },
      userId: pageView.userId,
      timestamp: pageView.timestamp,
    })
  }
  
  static userSignUp(userId: string, userType: 'client' | 'creative'): void {
    this.track({
      name: 'user_signup',
      properties: {
        user_type: userType,
      },
      userId,
    })
  }
  
  static userLogin(userId: string): void {
    this.track({
      name: 'user_login',
      userId,
    })
  }
  
  static bookingCreated(bookingId: string, userId: string, amount: number): void {
    this.track({
      name: 'booking_created',
      properties: {
        booking_id: bookingId,
        amount,
        currency: 'TZS',
      },
      userId,
    })
  }
  
  static paymentCompleted(paymentId: string, userId: string, amount: number): void {
    this.track({
      name: 'payment_completed',
      properties: {
        payment_id: paymentId,
        amount,
        currency: 'TZS',
      },
      userId,
    })
  }
  
  static searchPerformed(query: string, filters: Record<string, any>, userId?: string): void {
    this.track({
      name: 'search_performed',
      properties: {
        query,
        filters,
      },
      userId,
    })
  }
  
  static profileViewed(profileId: string, viewerId?: string): void {
    this.track({
      name: 'profile_viewed',
      properties: {
        profile_id: profileId,
      },
      userId: viewerId,
    })
  }
  
  static messagesSent(conversationId: string, senderId: string): void {
    this.track({
      name: 'message_sent',
      properties: {
        conversation_id: conversationId,
      },
      userId: senderId,
    })
  }
  
  static errorOccurred(error: Error, context?: Record<string, any>): void {
    this.track({
      name: 'error_occurred',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        context,
      },
    })
  }
}