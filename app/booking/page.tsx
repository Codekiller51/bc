"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Filter, MapPin, Star, Clock, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InlineLoading } from "@/components/ui/global-loading"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import type { Creative } from "@/lib/types"

export default function BookingPage() {
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  useEffect(() => {
    loadCreatives()
  }, [])

  const loadCreatives = async () => {
    try {
      setLoading(true)
      const data = await EnhancedDatabaseService.getCreativeProfiles()
      setCreatives(data)
    } catch (error) {
      console.error("Failed to load creatives:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCreatives = creatives.filter((creative) => {
    const matchesSearch =
      creative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creative.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || creative.category === selectedCategory
    const matchesLocation = selectedLocation === "all" || creative.location === selectedLocation

    // Only show approved creatives for booking
    return matchesSearch && matchesCategory && matchesLocation && creative.verified
  })

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <InlineLoading size="lg" message="Loading creative professionals..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-4">Book Creative Services</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Find and book verified creative professionals across Tanzania
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, skill, or keyword"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Graphic Design">Graphic Design</SelectItem>
              <SelectItem value="Photography">Photography</SelectItem>
              <SelectItem value="Videography">Videography</SelectItem>
              <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
              <SelectItem value="Arusha">Arusha</SelectItem>
              <SelectItem value="Mwanza">Mwanza</SelectItem>
              <SelectItem value="Dodoma">Dodoma</SelectItem>
              <SelectItem value="Mbeya">Mbeya</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatives.map((creative, index) => (
          <motion.div
            key={creative.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={creative.avatar || "/placeholder.svg?height=200&width=300"}
                  alt={creative.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700">{creative.category}</Badge>
                </div>
                {creative.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white/90 text-emerald-600">
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-xl mb-1">{creative.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2">{creative.title}</p>

                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{creative.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{creative.rating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({creative.reviews} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{creative.completedProjects} projects</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {new Intl.NumberFormat("sw-TZ", {
                      style: "currency",
                      currency: "TZS",
                      minimumFractionDigits: 0,
                    }).format(creative.hourlyRate)}
                    /hr
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Available
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Link href={`/booking/${creative.id}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCreatives.length === 0 && !loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-2">No creatives found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or browse all available creatives
          </p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              setSelectedLocation("all")
            }}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  )
}
