"use client"

import { useState } from "react"
import { Calendar, Clock, User, DollarSign, MessageSquare, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking } from "@/lib/database/types"

interface BookingDetailsModalProps {
  booking: Booking
  open: boolean
  onClose: () => void
  onStatusUpdate: (bookingId: string, newStatus: string) => void
}

export function BookingDetailsModal({ booking, open, onClose, onStatusUpdate }: BookingDetailsModalProps) {
  const [newStatus, setNewStatus] = useState(booking.status)

  const handleStatusUpdate = () => {
    onStatusUpdate(booking.id, newStatus)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</label>
              <p className="font-mono text-sm">{booking.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Client & Creative Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Client Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={booking.client?.avatar_url || "/placeholder.svg"} alt={booking.client?.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{booking.client?.name || "Unknown Client"}</p>
                  <p className="text-sm text-gray-500">{booking.client?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{booking.client?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{booking.client?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Creative Professional</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={booking.creative?.avatar_url || "/placeholder.svg"} alt={booking.creative?.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{booking.creative?.name || "Unknown Creative"}</p>
                  <p className="text-sm text-gray-500">{booking.creative?.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{booking.creative?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{booking.creative?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Details */}
          <div>
            <h3 className="font-semibold mb-3">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-emerald-600">
                    {new Intl.NumberFormat("sw-TZ", {
                      style: "currency",
                      currency: "TZS",
                      minimumFractionDigits: 0,
                    }).format(booking.total_amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{booking.service?.name || "Service details not available"}</p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{booking.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-3">Update Status</h3>
            <div className="flex items-center gap-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={newStatus === booking.status}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Update Status
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
