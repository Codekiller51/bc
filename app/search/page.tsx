"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { CreativeCard } from "@/components/creative-card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import { InlineLoading } from "@/components/ui/global-loading"
import type { CreativeProfile } from "@/lib/database/types"

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<CreativeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all-locations")
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<number[]>([0])
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)

  useEffect(() => {
    loadCreatives()
  }, [selectedCategory, selectedLocation, selectedRating, selectedExperience, selectedAvailability])

  const loadCreatives = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (selectedCategory !== "all") {
        filters.category = selectedCategory
      }
      
      if (selectedLocation !== "all-locations") {
        filters.location = selectedLocation
      }
      
      if (searchQuery) {
        filters.search = searchQuery
      }

      if (selectedRating) {
        filters.minRating = selectedRating
      }

      if (selectedExperience) {
        filters.experienceLevel = selectedExperience
      }

      if (priceRange[0] > 0) {
        filters.maxPrice = priceRange[0] * 10000 // Convert slider value to actual price
      }

      if (selectedAvailability) {
        filters.availability = selectedAvailability
      }
      
      const data = await UnifiedDatabaseService.getCreativeProfiles(filters)
      setSearchResults(data)
    } catch (error) {
      console.error('Failed to load creatives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadCreatives()
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Creative Professionals</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Discover verified creative talent across Tanzania based on your location and needs
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by name, skill, or keyword" 
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
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
              <SelectItem value="all-locations">All Locations</SelectItem>
              <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
              <SelectItem value="arusha">Arusha</SelectItem>
              <SelectItem value="mwanza">Mwanza</SelectItem>
              <SelectItem value="dodoma">Dodoma</SelectItem>
              <SelectItem value="mbeya">Mbeya</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Results</SheetTitle>
                <SheetDescription>Refine your search with additional filters</SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox 
                      id={`rating-${rating}`}
                      checked={selectedRating === rating}
                      onCheckedChange={(checked) => setSelectedRating(checked ? rating : null)}
                    />
                    <Label htmlFor={`rating-${rating}`} className="text-sm font-normal">
                      {rating}+ Stars
                    </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Experience Level</h3>
                  <div className="space-y-2">
                    {["beginner", "intermediate", "expert"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`level-${level}`}
                          checked={selectedExperience === level}
                          onCheckedChange={(checked) => setSelectedExperience(checked ? level : null)}
                        />
                        <Label htmlFor={`level-${level}`} className="text-sm font-normal">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <div className="pt-4">
                    <Slider 
                      value={priceRange} 
                      onValueChange={setPriceRange} 
                      max={100} 
                      step={1} 
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">Tsh {priceRange[0] * 10000}</span>
                      <span className="text-xs text-gray-500">Tsh 1,000,000+</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Availability</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Available Now", value: "available" },
                      { label: "Available This Week", value: "available_soon" },
                      { label: "Available This Month", value: "busy" }
                    ].map((item) => (
                      <div key={item.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`availability-${item.value}`}
                          checked={selectedAvailability === item.value}
                          onCheckedChange={(checked) => setSelectedAvailability(checked ? item.value : null)}
                        />
                        <Label
                          htmlFor={`availability-${item.value}`}
                          className="text-sm font-normal"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  onClick={() => {
                    loadCreatives()
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button 
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <InlineLoading size="lg" message="Searching for creative professionals..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((creative) => (
            <CreativeCard
              key={creative.id}
              name={creative.title || 'Creative Professional'}
              title={creative.category}
              location={creative.location || 'Tanzania'}
              rating={creative.rating || 0}
              reviews={creative.reviews_count || 0}
              imageSrc={creative.avatar_url || "/placeholder.svg?height=400&width=400"}
              href={`/profile/${creative.id}`}
            />
          ))}
        </div>
      )}

      {!loading && searchResults.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No creatives found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or browse all available creatives
          </p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              setSelectedLocation("all-locations")
              loadCreatives()
            }}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <span className="sr-only">Previous page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="icon">
            <span className="sr-only">Next page</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </nav>
      </div>
    </div>
  )
}