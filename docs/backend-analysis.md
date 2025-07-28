# Backend Analysis and Frontend Integration Guide

## 1. Backend Analysis

### Technology Stack
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Frontend**: Next.js 14 with TypeScript
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Real-time**: Supabase Realtime subscriptions

### Database Schema

#### Core Tables
1. **auth.users** (Supabase managed)
   - Standard Supabase auth table
   - Contains user credentials and metadata

2. **client_profiles**
   - `id` (UUID, references auth.users)
   - `full_name` (TEXT)
   - `email` (TEXT, UNIQUE)
   - `phone` (TEXT)
   - `location` (TEXT)
   - `company_name` (TEXT)
   - `industry` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **creative_profiles**
   - `id` (UUID, references auth.users)
   - `user_id` (UUID, references auth.users)
   - `title` (VARCHAR)
   - `bio` (TEXT)
   - `skills` (TEXT[])
   - `rating` (DECIMAL)
   - `reviews` (INTEGER)
   - `completed_projects` (INTEGER)
   - `services` (JSONB)
   - `portfolio` (JSONB)
   - `testimonials` (JSONB)
   - `created_at`, `updated_at` (TIMESTAMP)

4. **bookings**
   - `id` (UUID, PRIMARY KEY)
   - `creative_id` (UUID, references creative_profiles)
   - `client_id` (UUID, references client_profiles)
   - `project_title` (TEXT)
   - `description` (TEXT)
   - `start_date`, `end_date` (TIMESTAMP)
   - `status` (TEXT, default 'pending')
   - `amount` (DECIMAL)
   - `created_at`, `updated_at` (TIMESTAMP)

5. **testimonials**
   - `id` (UUID, PRIMARY KEY)
   - `creative_id` (UUID, references creative_profiles)
   - `client_id` (UUID, references client_profiles)
   - `rating` (INTEGER, 1-5)
   - `content` (TEXT)
   - `created_at` (TIMESTAMP)

### Authentication System
- **Provider**: Supabase Auth
- **Methods**: Email/Password (no magic links or social auth)
- **Email Confirmation**: Disabled
- **User Metadata**: Stores user_type, full_name, phone, location, profession
- **Profile Creation**: Automatic via database triggers based on user_type

### Row Level Security (RLS) Policies

#### client_profiles
- Public read access
- Users can update/insert their own profile only

#### creative_profiles
- Public read access
- Users can update/insert their own profile only

#### bookings
- Users can view their own bookings (client or creative)
- Clients can create bookings
- Both parties can update bookings

#### testimonials
- Public read access
- Clients can create testimonials
- Users can update their own testimonials

## 2. API Endpoints Analysis

### Authentication Endpoints (Supabase Auth)
```typescript
// Sign up
POST /auth/v1/signup
Body: { email, password, options: { data: metadata } }

// Sign in
POST /auth/v1/token?grant_type=password
Body: { email, password }

// Sign out
POST /auth/v1/logout

// Get user
GET /auth/v1/user
Headers: { Authorization: "Bearer <token>" }
```

### Custom API Routes

#### Chat System
```typescript
// AI Chat
POST /api/chat
Body: { messages: Array<{role, content}> }
Response: { message: string }
```

#### Bookings
```typescript
// Get bookings
GET /api/bookings?user_id=<id>
Response: Booking[]

// Create booking
POST /api/bookings
Body: { creative_id, project_title, description, start_date, end_date, amount }
Response: Booking
```

#### Testimonials
```typescript
// Get testimonials
GET /api/testimonials?creative_id=<id>
Response: Testimonial[]

// Create testimonial
POST /api/testimonials
Body: { creative_id, rating, content }
Response: Testimonial
```

#### Notifications
```typescript
// Send email
POST /api/notifications/email
Body: { to, subject, content }

// Send SMS
POST /api/notifications/sms
Body: { to, message }
```

### Supabase Client Operations

#### Direct Database Access
```typescript
// Get creative profiles
supabase.from('creative_profiles').select('*, user:users(*)')

// Get bookings
supabase.from('bookings').select('*').eq('client_id', userId)

// Create booking
supabase.from('bookings').insert(bookingData)

// Real-time subscriptions
supabase.channel('notifications').on('postgres_changes', ...)
```

## 3. Integration Planning

### Data Flow Architecture

```
Frontend Components
       ↓
Service Layer (lib/services/)
       ↓
Supabase Client (lib/supabase/client.ts)
       ↓
Supabase Backend
       ↓
PostgreSQL Database
```

### State Management Strategy
- **Local State**: React useState for component-specific data
- **Server State**: Direct Supabase queries with loading states
- **Authentication State**: Supabase auth state management
- **Real-time Updates**: Supabase subscriptions for live data

### Error Handling Strategy
1. **Network Errors**: Retry logic with exponential backoff
2. **Authentication Errors**: Automatic redirect to login
3. **Validation Errors**: Form-level error display
4. **Server Errors**: Toast notifications with user-friendly messages
5. **RLS Errors**: Proper permission error handling

## 4. Implementation Guidance

### HTTP Client Setup

The application uses Supabase client for most operations:

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const createClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    }
  );
}
```

### Service Layer Architecture

Services are organized by domain:

```typescript
// lib/services/booking-service.ts
export class BookingService {
  static async getCreatives(): Promise<Creative[]>
  static async getCreativeById(id: string): Promise<Creative | null>
  static async createBooking(data: Partial<Booking>): Promise<Booking>
  static async getBookings(filters?: any): Promise<Booking[]>
}

// lib/services/database-service.ts
export class DatabaseService {
  static async getUsers(filters?: any): Promise<User[]>
  static async getCreativeProfiles(filters?: any): Promise<CreativeProfile[]>
  static async createConversation(data: any): Promise<Conversation>
  static async sendMessage(data: any): Promise<Message>
}
```

### Component-Level Data Fetching

```typescript
// Example: Booking page component
const [bookings, setBookings] = useState<Booking[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await BookingService.getBookings()
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  loadBookings()
}, [])
```

### Authentication Implementation

```typescript
// Authentication hook usage
const [user, setUser] = useState<any>(null)
const supabase = createClient()

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
  
  getUser()
  
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user || null)
  })
  
  return () => authListener.subscription.unsubscribe()
}, [])
```

### Real-time Subscriptions

```typescript
// Real-time chat implementation
useEffect(() => {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new])
    })
    .subscribe()
    
  return () => subscription.unsubscribe()
}, [conversationId])
```

## 5. Testing Recommendations

### Unit Tests
- Service layer functions
- Utility functions
- Component logic

### Integration Tests
- Authentication flow
- Booking creation process
- Real-time chat functionality

### E2E Tests
- User registration and login
- Complete booking workflow
- Payment processing

### Test Files Structure
```
__tests__/
├── booking-flow.test.tsx
├── chat-system.test.tsx
└── notification-system.test.tsx
```

## 6. Performance Optimizations

### Data Caching
- Use React Query or SWR for server state management
- Implement optimistic updates for better UX
- Cache user profiles and frequently accessed data

### Loading States
- Skeleton components for better perceived performance
- Progressive loading for large datasets
- Lazy loading for images and heavy components

### Real-time Optimization
- Debounce real-time updates
- Batch multiple updates
- Unsubscribe from channels when components unmount

## 7. Security Considerations

### Client-Side Security
- Never expose sensitive API keys
- Validate all user inputs
- Implement proper error boundaries

### Server-Side Security
- RLS policies are properly configured
- User metadata validation
- Rate limiting on API endpoints

### Data Protection
- Encrypt sensitive data
- Implement proper session management
- Regular security audits

## 8. Deployment and Monitoring

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENROUTER_API_KEY=your_openrouter_key
SMS_API_KEY=your_sms_api_key
EMAIL_API_KEY=your_email_api_key
```

### Monitoring
- Error tracking with Sentry or similar
- Performance monitoring
- Database query optimization
- Real-time connection monitoring

This integration guide provides a comprehensive overview of the backend system and practical implementation strategies for seamless frontend integration.