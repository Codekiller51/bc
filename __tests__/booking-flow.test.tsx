import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { BookingCalendar } from "@/components/booking-calendar"
import { ServiceSelector } from "@/components/service-selector"

// Mock data
const mockServices = [
  {
    id: "service_1",
    creative_id: "creative_1",
    name: "Logo Design",
    description: "Custom logo design with 3 concepts",
    price: 250000,
    duration: 180,
    category: "Branding",
    active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
]

describe("Booking Flow", () => {
  describe("ServiceSelector", () => {
    it("renders services correctly", () => {
      const mockOnSelect = jest.fn()

      render(<ServiceSelector services={mockServices} onServiceSelect={mockOnSelect} />)

      expect(screen.getByText("Logo Design")).toBeInTheDocument()
      expect(screen.getByText("Custom logo design with 3 concepts")).toBeInTheDocument()
      expect(screen.getByText("TZS 250,000")).toBeInTheDocument()
    })

    it("calls onServiceSelect when service is clicked", () => {
      const mockOnSelect = jest.fn()

      render(<ServiceSelector services={mockServices} onServiceSelect={mockOnSelect} />)

      fireEvent.click(screen.getByText("Select"))
      expect(mockOnSelect).toHaveBeenCalledWith(mockServices[0])
    })
  })

  describe("BookingCalendar", () => {
    it("renders calendar correctly", () => {
      const mockOnScheduleSelect = jest.fn()

      render(<BookingCalendar creativeId="creative_1" onScheduleSelect={mockOnScheduleSelect} />)

      expect(screen.getByText("Select Date")).toBeInTheDocument()
      expect(screen.getByText(new Date().getFullYear().toString())).toBeInTheDocument()
    })

    it("shows time slots when date is selected", async () => {
      const mockOnScheduleSelect = jest.fn()

      render(<BookingCalendar creativeId="creative_1" onScheduleSelect={mockOnScheduleSelect} />)

      // Click on a future date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowButton = screen.getByText(tomorrow.getDate().toString())

      fireEvent.click(tomorrowButton)

      await waitFor(() => {
        expect(screen.getByText("Available Time Slots")).toBeInTheDocument()
      })
    })
  })
})
