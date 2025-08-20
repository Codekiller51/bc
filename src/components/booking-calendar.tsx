"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingCalendarProps {
  creativeId: string
  onScheduleSelect: (date: string, timeSlot: string, timezone: string) => void
  bufferTime?: number // Buffer time in minutes between bookings
  recurringAvailability?: {
    [key: string]: { // day of week (0-6, 0 is Sunday)
      start: string // HH:mm format
      end: string // HH:mm format
      isAvailable: boolean
    }
  }
}

import { format, addMinutes, parse, isWithinInterval } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export function BookingCalendar({ 
  creativeId, 
  onScheduleSelect
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [recurringAvailability, setRecurringAvailability] = useState<Record<string, { start: string; end: string; isAvailable: boolean }> | null>(null)
  const [bufferTime, setBufferTime] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateTimeSlots = (date: Date) => {
    const dayOfWeek = date.getDay().toString()
    const availability = recurringAvailability[dayOfWeek]
    
    if (!availability || !availability.isAvailable) {
      return []
    }

    const slots: string[] = []
    const startTime = parse(availability.start, 'HH:mm', date)
    const endTime = parse(availability.end, 'HH:mm', date)
    
    let currentSlot = startTime
    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, 60) // 1-hour slots
      const formattedSlot = `${format(currentSlot, 'HH:mm')} - ${format(slotEnd, 'HH:mm')}`
      slots.push(formattedSlot)
      currentSlot = addMinutes(currentSlot, 60 + bufferTime)
    }

    return slots
  }

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/availability?creativeId=${creativeId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch availability')
        }
        const data = await response.json()
        setRecurringAvailability(data.recurring_availability)
        setBufferTime(data.buffer_time)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [creativeId])

  useEffect(() => {
    if (selectedDate && recurringAvailability) {
      const date = new Date(selectedDate)
      const slots = generateTimeSlots(date)
      setAvailableSlots(slots)
    }
  }, [selectedDate, recurringAvailability, bufferTime])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayOfWeek = date.getDay().toString()
    const availability = recurringAvailability[dayOfWeek]
    return date >= today && availability?.isAvailable
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const handleDateSelect = (date: Date) => {
    if (!isDateAvailable(date)) return

    const dateString = formatDate(date)
    setSelectedDate(dateString)
    setSelectedTimeSlot("")
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    onScheduleSelect(selectedDate, timeSlot, userTimezone)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    )
  }

  if (!recurringAvailability) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
        No availability settings found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2" />
              }

              const isAvailable = isDateAvailable(date)
              const isSelected = selectedDate === formatDate(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <motion.button
                  key={index}
                  whileHover={isAvailable ? { scale: 1.05 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isAvailable}
                  className={`
                    p-2 text-sm rounded-lg transition-colors
                    ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : isAvailable
                          ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          : "text-gray-300 cursor-not-allowed"
                    }
                    ${isToday ? "ring-2 ring-emerald-600 ring-offset-2" : ""}
                  `}
                >
                  {date.getDate()}
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={selectedTimeSlot === slot ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {slot}
                  </Button>
                ))}
              </div>

              {availableSlots.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No available time slots for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
