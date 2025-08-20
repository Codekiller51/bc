"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface AvailabilitySettingsProps {
  creativeId: string
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export function AvailabilitySettings({ creativeId }: AvailabilitySettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bufferTime, setBufferTime] = useState(30)
  const [availability, setAvailability] = useState<Record<string, {
    start: string
    end: string
    isAvailable: boolean
  }>>({}
  )

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/availability?creativeId=${creativeId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch availability settings')
        }
        const data = await response.json()
        setAvailability(data.recurring_availability || {})
        setBufferTime(data.buffer_time || 30)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [creativeId])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creative_id: creativeId,
          recurring_availability: availability,
          buffer_time: bufferTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save availability settings')
      }

      toast({
        title: "Settings saved",
        description: "Your availability settings have been updated successfully.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save availability settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateDayAvailability = (dayIndex: number, field: keyof typeof availability[string], value: any) => {
    setAvailability(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Buffer Time Setting */}
            <div className="space-y-2">
              <Label htmlFor="buffer-time">Buffer Time (minutes between bookings)</Label>
              <Input
                id="buffer-time"
                type="number"
                min={0}
                max={120}
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                className="max-w-[200px]"
              />
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Weekly Schedule</h3>
              <div className="space-y-4">
                {dayNames.map((day, index) => {
                  const dayAvailability = availability[index] || {
                    start: "09:00",
                    end: "17:00",
                    isAvailable: index > 0 && index < 6, // Mon-Fri available by default
                  }

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20"
                    >
                      <div className="w-32">
                        <Label>{day}</Label>
                      </div>
                      <Switch
                        checked={dayAvailability.isAvailable}
                        onCheckedChange={(checked) => updateDayAvailability(index, 'isAvailable', checked)}
                      />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="time"
                            value={dayAvailability.start}
                            onChange={(e) => updateDayAvailability(index, 'start', e.target.value)}
                            disabled={!dayAvailability.isAvailable}
                          />
                        </div>
                        <div>
                          <Input
                            type="time"
                            value={dayAvailability.end}
                            onChange={(e) => updateDayAvailability(index, 'end', e.target.value)}
                            disabled={!dayAvailability.isAvailable}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-500">
                {error}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}