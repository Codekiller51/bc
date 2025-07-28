import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AvailabilitySettings } from '@/components/availability-settings'

// Mock the fetch function
global.fetch = vi.fn()

// Mock the useToast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('AvailabilitySettings', () => {
  const mockCreativeId = 'test-creative-id'

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  it('renders loading state initially', () => {
    render(<AvailabilitySettings creativeId={mockCreativeId} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('fetches and displays availability settings', async () => {
    const mockAvailability = {
      recurring_availability: {
        '1': { start: '09:00', end: '17:00', isAvailable: true },
      },
      buffer_time: 30,
    }

    // Mock successful fetch response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvailability),
    })

    render(<AvailabilitySettings creativeId={mockCreativeId} />)

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Check if the buffer time input is populated
    const bufferTimeInput = screen.getByLabelText(/buffer time/i)
    expect(bufferTimeInput).toHaveValue(30)

    // Check if Monday's availability is displayed correctly
    expect(screen.getByText('Monday')).toBeInTheDocument()
  })

  it('handles save functionality', async () => {
    const mockAvailability = {
      recurring_availability: {
        '1': { start: '09:00', end: '17:00', isAvailable: true },
      },
      buffer_time: 30,
    }

    // Mock fetch responses
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailability),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    render(<AvailabilitySettings creativeId={mockCreativeId} />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save settings/i })
    fireEvent.click(saveButton)

    // Verify save request was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/availability',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      )
    })
  })

  it('handles error states', async () => {
    // Mock failed fetch response
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<AvailabilitySettings creativeId={mockCreativeId} />)

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch availability settings/i)).toBeInTheDocument()
    })
  })

  it('updates availability when toggling days', async () => {
    const mockAvailability = {
      recurring_availability: {
        '1': { start: '09:00', end: '17:00', isAvailable: true },
      },
      buffer_time: 30,
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAvailability),
    })

    render(<AvailabilitySettings creativeId={mockCreativeId} />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Find and click Monday's switch
    const mondaySwitch = screen.getByRole('switch', { name: /monday/i })
    fireEvent.click(mondaySwitch)

    // Verify the switch was toggled
    expect(mondaySwitch).not.toBeChecked()
  })
})