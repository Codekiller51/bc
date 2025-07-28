# API Integration Examples

## Authentication Integration

### Login Implementation
```typescript
// app/login/page.tsx - Enhanced error handling
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      throw error
    }

    // Get user metadata for personalized experience
    const userName = data.user?.user_metadata?.full_name || 'User'
    toast.success(`Welcome back, ${userName}!`)
    
    const redirectTo = searchParams.get('redirect') || '/dashboard'
    router.push(redirectTo)
    
  } catch (error: any) {
    // Enhanced error handling
    if (error.message.includes('Invalid login credentials')) {
      setError('Invalid email or password. Please try again.')
    } else if (error.message.includes('Email not confirmed')) {
      setError('Please verify your email address before logging in.')
    } else {
      setError(error.message || "Failed to login")
    }
    toast.error(error.message || "Failed to login")
  } finally {
    setIsLoading(false)
  }
}
```

### Registration with Profile Creation
```typescript
// app/register/page.tsx - Enhanced registration
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    // Validate form data
    const schema = formData.userType === 'creative' ? creativeSchema : userSchema
    const validatedData = schema.parse(formData)

    const supabase = createClient()

    // Check for existing email
    const { data: existingUser } = await supabase
      .from(formData.userType === 'creative' ? 'creative_profiles' : 'client_profiles')
      .select('email')
      .eq('email', formData.email)
      .single()
    
    if (existingUser) {
      throw new Error(`This email is already registered as a ${formData.userType}`)
    }
    
    // Sign up with metadata
    const { error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.name,
          phone: validatedData.phone,
          location: validatedData.location,
          user_type: formData.userType,
          ...(formData.userType === 'creative' && { profession: validatedData.profession })
        }
      }
    })

    if (signUpError) {
      throw new Error(signUpError.message)
    }

    toast.success("Account created successfully!")
    router.push("/login")
    
  } catch (error: any) {
    handleRegistrationError(error)
  } finally {
    setIsLoading(false)
  }
}
```

## Data Fetching Patterns

### Service Layer Implementation
```typescript
// lib/services/enhanced-booking-service.ts
export class EnhancedBookingService {
  private static supabase = createClient()

  static async getCreativeProfiles(filters?: {
    category?: string
    location?: string
    rating?: number
  }): Promise<CreativeProfile[]> {
    let query = this.supabase
      .from('creative_profiles')
      .select(`
        *,
        user:users(*)
      `)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.location) {
      query = query.eq('user.location', filters.location)
    }

    if (filters?.rating) {
      query = query.gte('rating', filters.rating)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch creative profiles: ${error.message}`)
    }

    return data || []
  }

  static async createBookingWithValidation(bookingData: {
    creativeId: string
    serviceId: string
    date: string
    startTime: string
    endTime: string
    notes?: string
  }): Promise<Booking> {
    // Validate availability
    const isAvailable = await this.checkAvailability(
      bookingData.creativeId,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime
    )

    if (!isAvailable) {
      throw new Error('Selected time slot is not available')
    }

    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Create booking
    const { data, error } = await this.supabase
      .from('bookings')
      .insert({
        creative_id: bookingData.creativeId,
        client_id: user.id,
        service_id: bookingData.serviceId,
        booking_date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        notes: bookingData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    return data
  }

  private static async checkAvailability(
    creativeId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('creative_id', creativeId)
      .eq('booking_date', date)
      .or(`start_time.lte.${startTime},end_time.gte.${endTime}`)
      .neq('status', 'cancelled')

    if (error) {
      throw new Error(`Failed to check availability: ${error.message}`)
    }

    return !data || data.length === 0
  }
}
```

### Component Data Fetching with Error Boundaries
```typescript
// components/enhanced-booking-list.tsx
export function EnhancedBookingList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await EnhancedBookingService.getUserBookings()
      setBookings(data)
      setRetryCount(0) // Reset retry count on success
      
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setError(error instanceof Error ? error.message : 'Failed to load bookings')
      
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
  }, [retryCount])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  if (loading && bookings.length === 0) {
    return <BookingListSkeleton />
  }

  if (error && bookings.length === 0) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={loadBookings}
        retryCount={retryCount}
      />
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}
```

## Real-time Integration

### Enhanced Chat System
```typescript
// components/enhanced-real-time-chat.tsx
export function EnhancedRealTimeChat({ conversationId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message
        setMessages(prev => [...prev, newMessage])
        
        // Mark as read if not from current user
        if (newMessage.sender_id !== currentUserId) {
          markMessageAsRead(newMessage.id)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const updatedMessage = payload.new as Message
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ))
      })
      .subscribe((status) => {
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'connecting')
      })

    // Subscribe to typing indicators
    const typingSubscription = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload
        
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (isTyping) {
            newSet.add(userId)
          } else {
            newSet.delete(userId)
          }
          return newSet
        })
      })
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
      typingSubscription.unsubscribe()
    }
  }, [conversationId, currentUserId])

  const sendMessage = async (content: string) => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error

      // Optimistic update is handled by real-time subscription
      
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleTyping = useCallback(
    debounce((isTyping: boolean) => {
      const supabase = createClient()
      supabase
        .channel(`typing:${conversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping }
        })
    }, 300),
    [conversationId, currentUserId]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Connection status indicator */}
      <ConnectionStatusIndicator status={connectionStatus} />
      
      {/* Messages */}
      <MessageList 
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
      />
      
      {/* Message input */}
      <MessageInput
        onSendMessage={sendMessage}
        onTyping={handleTyping}
      />
    </div>
  )
}
```

## Error Handling and Loading States

### Global Error Boundary
```typescript
// components/error-boundary.tsx
interface ErrorBoundaryProps {
  error: string
  onRetry: () => void
  retryCount: number
}

export function ErrorBoundary({ error, onRetry, retryCount }: ErrorBoundaryProps) {
  return (
    <Card className="p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
      
      <div className="flex justify-center gap-2">
        <Button 
          onClick={onRetry}
          disabled={retryCount >= 3}
          variant="outline"
        >
          {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
        </Button>
        
        <Button 
          onClick={() => window.location.reload()}
          variant="default"
        >
          Refresh Page
        </Button>
      </div>
    </Card>
  )
}
```

### Loading Skeleton Components
```typescript
// components/booking-list-skeleton.tsx
export function BookingListSkeleton() {
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
```

## Performance Optimizations

### Data Caching with React Query
```typescript
// hooks/use-bookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => EnhancedBookingService.getBookings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: EnhancedBookingService.createBooking,
    onSuccess: (newBooking) => {
      // Optimistic update
      queryClient.setQueryData(['bookings'], (old: Booking[] = []) => [
        ...old,
        newBooking
      ])
      
      // Invalidate related queries
      queryClient.invalidateQueries(['bookings'])
      queryClient.invalidateQueries(['creative-availability'])
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
```

### Optimistic Updates
```typescript
// hooks/use-optimistic-booking.ts
export function useOptimisticBooking() {
  const [optimisticBookings, setOptimisticBookings] = useState<Booking[]>([])
  const createBookingMutation = useCreateBooking()

  const createBookingOptimistically = async (bookingData: CreateBookingData) => {
    // Create optimistic booking
    const optimisticBooking: Booking = {
      id: `temp-${Date.now()}`,
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to optimistic state
    setOptimisticBookings(prev => [...prev, optimisticBooking])

    try {
      // Create actual booking
      const realBooking = await createBookingMutation.mutateAsync(bookingData)
      
      // Replace optimistic booking with real one
      setOptimisticBookings(prev => 
        prev.filter(b => b.id !== optimisticBooking.id)
      )
      
      return realBooking
    } catch (error) {
      // Remove optimistic booking on error
      setOptimisticBookings(prev => 
        prev.filter(b => b.id !== optimisticBooking.id)
      )
      throw error
    }
  }

  return {
    optimisticBookings,
    createBookingOptimistically
  }
}
```

This comprehensive integration guide covers all aspects of connecting the frontend with the Supabase backend, including authentication, data fetching, real-time features, error handling, and performance optimizations.