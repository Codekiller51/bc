export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "client" | "creative" | "admin"
  avatar?: string
  location: string
  createdAt: string
  verified: boolean
}

export interface Creative extends User {
  title: string
  category: string
  rating: number
  reviews: number
  completedProjects: number
  hourlyRate: number
  availability: TimeSlot[]
  portfolio: PortfolioItem[]
  services: Service[]
  bio: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  category: string
}

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  creativeId: string
}

export interface Booking {
  id: string
  clientId: string
  creativeId: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
  totalAmount: number
  paymentStatus: "pending" | "paid" | "refunded"
  paymentId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  method: "card" | "mobile_money" | "bank_transfer"
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "booking" | "payment" | "reminder" | "update"
  title: string
  message: string
  read: boolean
  createdAt: string
}
