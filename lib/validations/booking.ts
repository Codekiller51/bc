import { z } from "zod"

export const createBookingSchema = z.object({
  creativeId: z.string().uuid("Invalid creative ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  date: z.string().refine((date) => {
    const bookingDate = new Date(date)
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 90) // 90 days advance booking
    
    return bookingDate >= today && bookingDate <= maxDate
  }, "Booking date must be between today and 90 days from now"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}:00`)
  const end = new Date(`2000-01-01T${data.endTime}:00`)
  return end > start
}, {
  message: "End time must be after start time",
  path: ["endTime"]
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"]),
  notes: z.string().max(500).optional(),
})

export const bookingFiltersSchema = z.object({
  status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"]).optional(),
  creativeId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
export type BookingFilters = z.infer<typeof bookingFiltersSchema>