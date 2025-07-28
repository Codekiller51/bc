import { TANZANIAN_PHONE_REGEX } from "./constants"

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateTanzanianPhone(phone: string): boolean {
  return TANZANIAN_PHONE_REGEX.test(phone)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFileUpload(file: File): {
  isValid: boolean
  error?: string
} {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 5MB"
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File type must be JPEG, PNG, or WebP"
    }
  }
  
  return { isValid: true }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

export function validateBookingTime(startTime: string, endTime: string): boolean {
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  return end > start && (end.getTime() - start.getTime()) >= 30 * 60 * 1000 // Minimum 30 minutes
}

export function validateBusinessHours(time: string): boolean {
  const [hours] = time.split(":").map(Number)
  return hours >= 8 && hours <= 18 // 8 AM to 6 PM
}