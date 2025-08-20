export interface User {
  id: string
  email: string
  phone?: string
  name: string
  avatar_url?: string
  role: "client" | "creative" | "admin"
  location?: string
  verified: boolean
  approved: boolean
  created_at: string
  updated_at: string
  user_metadata?: { [key: string]: any }
  company_name?: string
  industry?: string
}

export interface CreativeProfile {
  id: string
  user_id: string
  title: string
  category: string
  bio?: string
  skills?: string[]
  hourly_rate?: number
  rating: number
  reviews_count: number
  completed_projects: number
  location?: string
  avatar_url?: string
  portfolio_url?: string
  availability_status: string
  approval_status: "pending" | "approved" | "rejected"
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  user?: {
    email?: string
    phone?: string
    raw_user_meta_data?: any
  }
  services?: Service[]
  portfolio_items?: PortfolioItem[]
  testimonials?: any[]
}

export interface Service {
  id: string
  creative_id: string
  name: string
  description?: string
  price: number
  duration: number
  category?: string
  active: boolean
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  creative_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
  client?: User
  creative?: User
  service?: Service
}

export interface Conversation {
  id: string
  booking_id?: string
  client_id: string
  creative_id: string
  status: string
  last_message_at: string
  created_at: string
  client?: User
  creative?: User
  booking?: Booking
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  read_at?: string
  created_at: string
  sender?: User
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: any
  read_at?: string
  created_at: string
}

export interface PortfolioItem {
  id: string
  creative_id: string
  title: string
  description?: string
  image_url?: string
  category?: string
  project_url?: string
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  client_id: string
  creative_id: string
  rating: number
  comment?: string
  created_at: string
  client?: User
}
