export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SEARCH: "/search",
  BOOKING: "/booking",
  CHAT: "/chat",
  ADMIN: "/admin",
  HELP: "/help",
  ABOUT: "/about",
  CONTACT: "/contact",
  BLOG: "/blog",
  TESTIMONIALS: "/testimonials",
  TERMS: "/terms",
  PRIVACY: "/privacy",
} as const

export const USER_ROLES = {
  CLIENT: "client",
  CREATIVE: "creative",
  ADMIN: "admin",
} as const

export const APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  SYSTEM: "system",
} as const

export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  PAYMENT: "payment",
  MESSAGE: "message",
  REMINDER: "reminder",
  UPDATE: "update",
} as const

export const CREATIVE_CATEGORIES = [
  "Graphic Design",
  "Photography",
  "Videography",
  "Digital Marketing",
  "Web Design",
  "UI/UX Design",
  "Content Writing",
  "Social Media Management",
  "Branding",
  "Animation",
] as const

export const TANZANIAN_CITIES = [
  "Dar es Salaam",
  "Arusha",
  "Mwanza",
  "Dodoma",
  "Mbeya",
  "Tanga",
  "Morogoro",
  "Tabora",
  "Kigoma",
  "Mtwara",
  "Iringa",
  "Shinyanga",
  "Songea",
  "Musoma",
  "Bukoba",
] as const

export const PHONE_REGEX = /^(\+255|0)[67]\d{8}$/
export const TANZANIAN_PHONE_REGEX = /^(\+255|0)[67]\d{8}$/

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_FILES: 10,
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const