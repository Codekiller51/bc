"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentService } from "@/lib/services/payment-service"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { NotificationService } from "@/lib/services/notification-service"
import { CalendarService } from "@/lib/services/calendar-service"
import type { Creative, Service } from "@/lib/types"

interface PaymentPageProps {
  params: { id: string }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [creative, setCreative] = useState<Creative | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money" | "bank_transfer">("card")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  // Form data
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  const [mobileMoneyData, setMobileMoneyData] = useState({
    provider: "mpesa",
    phoneNumber: "",
  })

  const [bankTransferData, setBankTransferData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  })

  const [notes, setNotes] = useState("")

  // Get booking details from URL params
  const bookingDetails = {
    creativeId: searchParams.get("creativeId") || params.id,
    serviceId: searchParams.get("serviceId") || "",
    date: searchParams.get("date") || "",
    timeSlot: searchParams.get("timeSlot") || "",
    amount: Number.parseInt(searchParams.get("amount") || "0"),
  }

  useEffect(() => {
    loadBookingData()
  }, [])

  const loadBookingData = async () => {
    try {
      const creativeData = await EnhancedDatabaseService.getCreativeById(bookingDetails.creativeId)
      setCreative(creativeData)

      if (creativeData && bookingDetails.serviceId) {
        const service = creativeData.services.find((s) => s.id === bookingDetails.serviceId)
        setSelectedService(service || null)
      }
    } catch (error) {
      console.error("Failed to load booking data:", error)
      setError("Failed to load booking information")
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "number") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value)
    } else if (field === "cvc") {
      formattedValue = value.replace(/[^0-9]/g, "").substring(0, 4)
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const validatePaymentData = (): boolean => {
    if (paymentMethod === "card") {
      const { number, expiry, cvc, name } = cardData
      if (!number || !expiry || !cvc || !name) {
        setError("Please fill in all card details")
        return false
      }
      if (number.replace(/\s/g, "").length < 16) {
        setError("Please enter a valid card number")
        return false
      }
    } else if (paymentMethod === "mobile_money") {
      if (!mobileMoneyData.phoneNumber) {
        setError("Please enter your phone number")
        return false
      }
    } else if (paymentMethod === "bank_transfer") {
      const { bankName, accountNumber, accountName } = bankTransferData
      if (!bankName || !accountNumber || !accountName) {
        setError("Please fill in all bank transfer details")
        return false
      }
    }

    return true
  }

  const handlePayment = async () => {
    if (!validatePaymentData() || !creative || !selectedService) return

    setProcessing(true)
    setError("")

    try {
      // Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent(bookingDetails.amount, "TZS")

      // Simulate payment method
      const paymentMethodData = {
        id: `pm_${Date.now()}`,
        type: paymentMethod,
        details:
          paymentMethod === "card"
            ? { last4: cardData.number.slice(-4), brand: "visa" }
            : paymentMethod === "mobile_money"
              ? { phoneNumber: mobileMoneyData.phoneNumber }
              : { bankName: bankTransferData.bankName },
      }

      // Confirm payment
      const payment = await PaymentService.confirmPayment(paymentIntent.id, paymentMethodData)

      // Create booking
      const [startTime, endTime] = bookingDetails.timeSlot.split(" - ")
      const booking = await EnhancedDatabaseService.createBooking({
        creativeId: bookingDetails.creativeId,
        serviceId: bookingDetails.serviceId,
        date: bookingDetails.date,
        startTime,
        endTime,
        totalAmount: bookingDetails.amount,
        notes,
      })

      // Send notifications
      const mockClient = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+255123456789",
      }

      await NotificationService.sendBookingConfirmation(
        { ...booking, serviceName: selectedService.name },
        creative,
        mockClient,
      )

      await NotificationService.sendPaymentReceipt(payment, { ...booking, clientEmail: mockClient.email })

      setSuccess(true)

      // Redirect to confirmation page after 3 seconds
      setTimeout(() => {
        router.push(`/booking/confirmation/${booking.id}`)
      }, 3000)
    } catch (error) {
      console.error("Payment failed:", error)
      setError(error instanceof Error ? error.message : "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const addToCalendar = () => {
    if (!creative || !selectedService) return

    const mockBooking = {
      id: "temp_booking",
      date: bookingDetails.date,
      startTime: bookingDetails.timeSlot.split(" - ")[0],
      endTime: bookingDetails.timeSlot.split(" - ")[1],
    }

    const calendarEvent = CalendarService.createBookingEvent(mockBooking, creative, selectedService)
    CalendarService.downloadICSFile(calendarEvent)
  }

  if (success) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your booking has been confirmed and you'll receive confirmation details via email and SMS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={addToCalendar}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                Add to Calendar
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                View Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Button onClick={() => router.back()} variant="ghost" className="mb-6" disabled={processing}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Payment Method Selection */}
                  <div>
                    <Label className="text-base font-medium">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value: any) => setPaymentMethod(value)}
                      className="mt-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="mobile_money" id="mobile_money" />
                        <Label htmlFor="mobile_money" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money (M-Pesa, Tigo Pesa)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                        <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="h-4 w-4" />
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Card Payment Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => handleCardInputChange("number", e.target.value)}
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            value={cardData.cvc}
                            onChange={(e) => handleCardInputChange("cvc", e.target.value)}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="John Doe"
                          value={cardData.name}
                          onChange={(e) => handleCardInputChange("name", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Form */}
                  {paymentMethod === "mobile_money" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <RadioGroup
                          value={mobileMoneyData.provider}
                          onValueChange={(value) => setMobileMoneyData((prev) => ({ ...prev, provider: value }))}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mpesa" id="mpesa" />
                            <Label htmlFor="mpesa">M-Pesa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tigo" id="tigo" />
                            <Label htmlFor="tigo">Tigo Pesa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="airtel" id="airtel" />
                            <Label htmlFor="airtel">Airtel Money</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+255 123 456 789"
                          value={mobileMoneyData.phoneNumber}
                          onChange={(e) => setMobileMoneyData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Form */}
                  {paymentMethod === "bank_transfer" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          placeholder="CRDB Bank"
                          value={bankTransferData.bankName}
                          onChange={(e) => setBankTransferData((prev) => ({ ...prev, bankName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input
                          id="account-number"
                          placeholder="1234567890"
                          value={bankTransferData.accountNumber}
                          onChange={(e) => setBankTransferData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input
                          id="account-name"
                          placeholder="John Doe"
                          value={bankTransferData.accountName}
                          onChange={(e) => setBankTransferData((prev) => ({ ...prev, accountName: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or notes for the creative professional..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Secure Payment</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your payment information is encrypted and secure. We use industry-standard security measures.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {creative && selectedService && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <img
                            src={creative.avatar || "/placeholder.svg?height=48&width=48"}
                            alt={creative.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{creative.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{creative.title}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Service</span>
                          <span className="text-sm font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                          <span className="text-sm font-medium">
                            {new Date(bookingDetails.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                          <span className="text-sm font-medium">{bookingDetails.timeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="text-sm font-medium">{selectedService.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                          <span className="text-sm font-medium">{creative.location}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Service Fee</span>
                          <span>{PaymentService.formatCurrency(selectedService.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee</span>
                          <span>{PaymentService.formatCurrency(selectedService.price * 0.05)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {PaymentService.formatCurrency(bookingDetails.amount)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          `Pay ${PaymentService.formatCurrency(bookingDetails.amount)}`
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        By proceeding, you agree to our Terms of Service and Privacy Policy. Payment will be held in
                        escrow until service completion.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
