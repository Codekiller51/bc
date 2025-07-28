export interface CalendarEvent {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location?: string
  attendees?: string[]
}

export class CalendarService {
  static generateGoogleCalendarUrl(event: CalendarEvent): string {
    const baseUrl = "https://calendar.google.com/calendar/render"
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${this.formatDateForGoogle(event.startTime)}/${this.formatDateForGoogle(event.endTime)}`,
      details: event.description,
      location: event.location || "",
      sf: "true",
      output: "xml",
    })

    return `${baseUrl}?${params.toString()}`
  }

  static generateOutlookCalendarUrl(event: CalendarEvent): string {
    const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose"
    const params = new URLSearchParams({
      subject: event.title,
      body: event.description,
      startdt: event.startTime,
      enddt: event.endTime,
      location: event.location || "",
    })

    return `${baseUrl}?${params.toString()}`
  }

  static generateICSFile(event: CalendarEvent): string {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Brand Connect//Booking System//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@brandconnect.co.tz`,
      `DTSTART:${this.formatDateForICS(event.startTime)}`,
      `DTEND:${this.formatDateForICS(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location || ""}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    return icsContent
  }

  static downloadICSFile(event: CalendarEvent): void {
    const icsContent = this.generateICSFile(event)
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `booking-${event.id}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  private static formatDateForGoogle(dateString: string): string {
    return new Date(dateString).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  private static formatDateForICS(dateString: string): string {
    return new Date(dateString).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  static createBookingEvent(booking: any, creative: any, service: any): CalendarEvent {
    const startDateTime = new Date(`${booking.date}T${booking.startTime}:00`)
    const endDateTime = new Date(`${booking.date}T${booking.endTime}:00`)

    return {
      id: booking.id,
      title: `${service.name} with ${creative.name}`,
      description: `Booking Details:\n\nService: ${service.name}\nCreative: ${creative.name}\nLocation: ${creative.location}\nPhone: ${creative.phone}\nEmail: ${creative.email}\n\nBooking ID: ${booking.id}`,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: creative.location,
      attendees: [creative.email],
    }
  }
}
