"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle, Phone, Mail, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingCalendar } from "@/components/booking-calendar"
import { ServiceSelector } from "@/components/service-selector"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import type { Creative, Service } from "@/lib/types"

interface BookingPageProps {
  params: { id: string }
}

export default function CreativeBookingPage({ params }: BookingPageProps) {
  const router = useRouter()
  const [creative, setCreative] = useState<Creative | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [bookingStep, setBookingStep] = useState<"service" | "schedule" | "confirm">("service")

  useEffect(() => {
    loadCreative()
  }, [params.id])

  const loadCreative = async () => {
    try {
      setLoading(true)
      const data = await EnhancedDatabaseService.getCreativeById(params.id)
      setCreative(data)
    } catch (error) {
      console.error("Failed to load creative:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setBookingStep("schedule")
  }

  const handleScheduleSelect = (date: string, timeSlot: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(timeSlot)
    setBookingStep("confirm")
  }

  const handleBookingConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return

    // Navigate to payment page with booking details
    const bookingData = {
      creativeId: params.id,
      serviceId: selectedService.id,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      amount: selectedService.price,
    }

    const queryParams = new URLSearchParams(bookingData).toString()
    router.push(`/booking/${params.id}/payment?${queryParams}`)
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!creative) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Creative not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The creative professional you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/booking")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Button onClick={() => router.push("/booking")} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Creative Profile */}
            <div className="lg:col-span-2">
              <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src={creative.avatar || "/placeholder.svg?height=300&width=600"}
                  alt={creative.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700">{creative.category}</Badge>
                    {creative.verified && (
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold">{creative.name}</h1>
                  <p className="text-lg opacity-90">{creative.title}</p>
                </div>
              </div>

              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{creative.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          <div>
                            <p className="font-medium">{creative.rating} Rating</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{creative.reviews} reviews</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="font-medium">Projects Completed</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{creative.completedProjects}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="font-medium">Hourly Rate</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Intl.NumberFormat("sw-TZ", {
                                style: "currency",
                                currency: "TZS",
                                minimumFractionDigits: 0,
                              }).format(creative.hourlyRate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="font-semibold mb-3">About</h3>
                        <p className="text-gray-600 dark:text-gray-300">{creative.bio}</p>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="font-semibold mb-3">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{creative.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{creative.phone}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                  <ServiceSelector
                    services={creative.services}
                    onServiceSelect={handleServiceSelect}
                    selectedService={selectedService}
                  />
                </TabsContent>

                <TabsContent value="portfolio" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="relative h-48 w-full">
                          <Image
                            src={`/placeholder.svg?height=200&width=300&text=Portfolio+${index + 1}`}
                            alt={`Portfolio item ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium">Project {index + 1}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Sample portfolio item description</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden">
                              <Image
                                src={`/placeholder.svg?height=40&width=40&text=U${index + 1}`}
                                alt={`User ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">Client {index + 1}</h4>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < 5 - index ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Excellent work! Very professional and delivered exactly what we needed. Would definitely
                                work with {creative.name} again.
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">2 weeks ago</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Panel */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {bookingStep === "service" && (
                    <div>
                      <h3 className="font-medium mb-4">Select a Service</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Choose from {creative.name}'s available services to get started.
                      </p>
                      <Button
                        onClick={() => setBookingStep("service")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        View Services
                      </Button>
                    </div>
                  )}

                  {bookingStep === "schedule" && selectedService && (
                    <div>
                      <div className="mb-4">
                        <h3 className="font-medium">Selected Service</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-2">
                          <p className="font-medium">{selectedService.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Intl.NumberFormat("sw-TZ", {
                              style: "currency",
                              currency: "TZS",
                              minimumFractionDigits: 0,
                            }).format(selectedService.price)}
                          </p>
                        </div>
                      </div>

                      <BookingCalendar creativeId={params.id} onScheduleSelect={handleScheduleSelect} />
                    </div>
                  )}

                  {bookingStep === "confirm" && selectedService && selectedDate && selectedTimeSlot && (
                    <div>
                      <h3 className="font-medium mb-4">Booking Summary</h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Service</span>
                          <span className="text-sm font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                          <span className="text-sm font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                          <span className="text-sm font-medium">{selectedTimeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="text-sm font-medium">{selectedService.duration} minutes</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-medium">Total</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat("sw-TZ", {
                              style: "currency",
                              currency: "TZS",
                              minimumFractionDigits: 0,
                            }).format(selectedService.price)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleBookingConfirm}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                      >
                        Proceed to Payment
                      </Button>
                    </div>
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
