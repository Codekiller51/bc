"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Search, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreativeCard } from "@/components/creative-card"
import { CategoryCard } from "@/components/category-card"
import { DatabaseService } from "@/lib/services/database-service"
import { InlineLoading } from "@/components/ui/global-loading"
import type { CreativeProfile } from "@/lib/database/creative-profile"

export default function Home() {
  const [featuredCreatives, setFeaturedCreatives] = useState<CreativeProfile[]>([])
  const [stats, setStats] = useState({
    totalCreatives: 0,
    totalProjects: 0,
    totalClients: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      const [creativesData, statsData] = await Promise.all([
        DatabaseService.getFeaturedCreatives(3),
        DatabaseService.getCreativeStats()
      ])
      
      setFeaturedCreatives(creativesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect with Tanzania&apos;s Top Creative Talent
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Find verified graphic designers, photographers, videographers, and digital marketers in your region.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus-visible:ring-emerald-600"
                >
                  Join as a Client
                </Link>
                <Link
                  href="/register/creative"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-600 bg-white px-8 text-sm font-medium text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 disabled:pointer-events-none disabled:opacity-50 dark:border-emerald-600 dark:bg-transparent dark:text-emerald-600 dark:hover:bg-emerald-950 dark:hover:text-emerald-500 dark:focus-visible:ring-emerald-600"
                >
                  Join as a Creative
                </Link>
              </div>
              <div className="mt-6 bg-white dark:bg-gray-950 p-4 rounded-lg shadow-sm">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Find Creative Talent</div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Select defaultValue="service">
                      <SelectTrigger>
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="graphic-design">Graphic Design</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="videography">Videography</SelectItem>
                        <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="location">
                      <SelectTrigger>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                        <SelectItem value="arusha">Arusha</SelectItem>
                        <SelectItem value="mwanza">Mwanza</SelectItem>
                        <SelectItem value="dodoma">Dodoma</SelectItem>
                        <SelectItem value="mbeya">Mbeya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
                <Image
                  src="/logos/logo-transparent.png?height=500&width=500"
                  alt="Brand Connect"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="w-full py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Creative Services</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover top creative professionals across Tanzania in these categories
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            <CategoryCard
              title="Graphic Design"
              icon="Palette"
              description="Logo design, branding, print materials, and more"
              href="/search?category=graphic-design"
            />
            <CategoryCard
              title="Photography"
              icon="Camera"
              description="Events, portraits, product photography, and more"
              href="/search?category=photography"
            />
            <CategoryCard
              title="Videography"
              icon="Video"
              description="Event coverage, promotional videos, and more"
              href="/search?category=videography"
            />
            <CategoryCard
              title="Digital Marketing"
              icon="BarChart"
              description="Social media, SEO, content marketing, and more"
              href="/search?category=digital-marketing"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Connect with creative professionals in just a few simple steps
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center text-center space-y-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Search className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Search</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Find creative professionals based on your location and service needs
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Connect</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Review portfolios, ratings, and contact verified professionals
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Collaborate</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Hire and work with the best creative talent in your region
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creatives */}
      <section className="w-full py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Creatives</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover top-rated creative professionals across Tanzania
              </p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="col-span-full flex justify-center py-12">
                <InlineLoading size="lg" message="Loading featured creatives..." />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featuredCreatives.map((creative) => (
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
          <div className="flex justify-center mt-8">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
            >
              View all creatives
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Hear from clients and creative professionals who use Brand Connect
              </p>
            </div>
          </div>
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalCreatives}+
                </div>
                <p className="text-gray-500 dark:text-gray-400">Creative Professionals</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalProjects}+
                </div>
                <p className="text-gray-500 dark:text-gray-400">Successful Projects</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalClients}+
                </div>
                <p className="text-gray-500 dark:text-gray-400">Happy Clients</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.averageRating}
                </div>
                <p className="text-gray-500 dark:text-gray-400">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-emerald-600 dark:bg-emerald-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Connect?</h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Brand Connect today and discover the best creative talent across Tanzania
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-emerald-600 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
              >
                Join as a Client
              </Link>
              <Link
                href="/register/creative"
                className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
              >
                Join as a Creative
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
