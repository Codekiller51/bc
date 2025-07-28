"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Facebook, Instagram, Linkedin, MapPin, MessageSquare, Star, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewDisplay } from "@/components/review-system"

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        // Fetch creative profile data based on slug
        const userProfile = await EnhancedDatabaseService.getCreativeProfileById(params.slug)
        
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            name: userProfile.title,
            title: userProfile.title,
            category: userProfile.category,
            location: userProfile.location,
            rating: userProfile.rating || 0,
            reviews: userProfile.reviews_count || 0,
            completedProjects: userProfile.completed_projects || 0,
            joinedDate: new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            about: userProfile.bio,
            skills: userProfile.skills || ['Creative Professional'],
            services: userProfile.services || [],
            portfolio: userProfile.portfolio_items || [],
            testimonials: userProfile.testimonials || [],
            hourlyRate: userProfile.hourly_rate || 0,
            avatar: userProfile.avatar_url,
            portfolioUrl: userProfile.portfolio_url
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    async function loadReviews() {
      try {
        const reviewsData = await EnhancedDatabaseService.getReviews(params.slug)
        setReviews(reviewsData)
      } catch (error) {
        console.error('Error loading reviews:', error)
      }
    }

    loadProfile()
    loadReviews()
  }, [params.slug])

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold">Profile Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The requested profile could not be found.</p>
            <Button className="mt-4" asChild>
              <Link href="/search">Browse Creatives</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-full">
                  <Image 
                    src={profile.avatar || "/placeholder.svg?height=128&width=128"} 
                    alt={profile.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-500 dark:text-gray-400">{profile.category}</p>
                <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex mr-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium">{profile.rating}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({profile.reviews} reviews)</span>
                </div>
                <div className="w-full mt-6">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    asChild
                  >
                    <Link href={`/booking/${profile.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Book Now
                    </Link>
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Completed Projects</span>
                  <span className="text-sm font-medium">{profile.completedProjects}</span>
                </div>
                {profile.hourlyRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Hourly Rate</span>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat("sw-TZ", {
                        style: "currency",
                        currency: "TZS",
                        minimumFractionDigits: 0,
                      }).format(profile.hourlyRate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Member Since</span>
                  <span className="text-sm font-medium">{profile.joinedDate}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Connect</h3>
                <div className="flex space-x-4">
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                  >
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">About Me</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {profile.about || 'Professional creative offering high-quality services.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="services" className="mt-6">
              <div className="space-y-4">
                {profile.services.length > 0 ? profile.services.map((service, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{service.name}</h3>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            {new Intl.NumberFormat("sw-TZ", {
                              style: "currency",
                              currency: "TZS",
                              minimumFractionDigits: 0,
                            }).format(service.price)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">{service.description}</p>
                          <div className="flex items-center mt-4 text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">Duration: {service.duration} minutes</span>
                          </div>
                        </div>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                          asChild
                        >
                          <Link href={`/booking/${profile.id}`}>
                          Book Now
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No services listed yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            <TabsContent value="portfolio" className="mt-6">
              {profile.portfolio.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image 
                          src={item.image_url || "/placeholder.svg"} 
                          alt={item.title} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No portfolio items available yet.</p>
                    {profile.portfolioUrl && (
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href={profile.portfolioUrl} target="_blank">
                          View External Portfolio
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ReviewDisplay reviews={reviews} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
