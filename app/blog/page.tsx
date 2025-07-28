"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { Search, Filter, ArrowRight, Calendar, User, Tag, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FloatingCard } from "@/components/floating-card"
import { ParallaxText } from "@/components/parallax-text"

// Sample blog data
const blogPosts = [
  {
    id: 1,
    title: "10 Essential Tips for Graphic Designers in Tanzania",
    excerpt:
      "Discover the top tips for graphic designers looking to succeed in Tanzania's competitive creative market.",
    author: "Maria Joseph",
    authorRole: "Graphic Designer",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "May 15, 2024",
    readTime: "5 min read",
    category: "Graphic Design",
    image: "/placeholder.svg?height=400&width=600",
    featured: true,
    tags: ["Design Tips", "Career Growth", "Tanzania"],
  },
  {
    id: 2,
    title: "How to Price Your Photography Services in East Africa",
    excerpt:
      "Learn how to set competitive yet profitable pricing for your photography services in the East African market.",
    author: "John Mbwambo",
    authorRole: "Photographer",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "May 10, 2024",
    readTime: "7 min read",
    category: "Photography",
    image: "/placeholder.svg?height=400&width=600",
    featured: false,
    tags: ["Pricing Strategy", "Photography Business", "East Africa"],
  },
  {
    id: 3,
    title: "Building Your Videography Portfolio: A Step-by-Step Guide",
    excerpt: "A comprehensive guide to creating a compelling videography portfolio that attracts high-quality clients.",
    author: "David Mushi",
    authorRole: "Videographer",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "May 5, 2024",
    readTime: "6 min read",
    category: "Videography",
    image: "/placeholder.svg?height=400&width=600",
    featured: false,
    tags: ["Portfolio Development", "Client Acquisition", "Video Production"],
  },
  {
    id: 4,
    title: "Digital Marketing Trends Reshaping Tanzania's Creative Industry",
    excerpt: "Explore the latest digital marketing trends and how they're transforming Tanzania's creative landscape.",
    author: "Sarah Kimaro",
    authorRole: "Digital Marketer",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "April 28, 2024",
    readTime: "8 min read",
    category: "Digital Marketing",
    image: "/placeholder.svg?height=400&width=600",
    featured: true,
    tags: ["Digital Trends", "Social Media", "Content Strategy"],
  },
  {
    id: 5,
    title: "From Freelancer to Agency: Scaling Your Creative Business",
    excerpt:
      "Learn the key strategies for transitioning from a solo creative freelancer to running a successful agency.",
    author: "Grace Mwakasege",
    authorRole: "Agency Founder",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "April 20, 2024",
    readTime: "10 min read",
    category: "Business Growth",
    image: "/placeholder.svg?height=400&width=600",
    featured: false,
    tags: ["Business Growth", "Agency Building", "Team Management"],
  },
  {
    id: 6,
    title: "Navigating Client Relationships: Communication Tips for Creatives",
    excerpt:
      "Effective communication strategies to build strong, long-lasting relationships with your creative clients.",
    author: "Peter Makundi",
    authorRole: "Creative Consultant",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "April 15, 2024",
    readTime: "6 min read",
    category: "Client Management",
    image: "/placeholder.svg?height=400&width=600",
    featured: false,
    tags: ["Client Communication", "Relationship Building", "Project Management"],
  },
]

const categories = [
  "All Categories",
  "Graphic Design",
  "Photography",
  "Videography",
  "Digital Marketing",
  "Business Growth",
  "Client Management",
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("latest")

  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  // Filter posts based on search query and category
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "All Categories" || post.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    return 0
  })

  // Get featured posts
  const featuredPosts = blogPosts.filter((post) => post.featured)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div
          className="container px-4 md:px-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                Social Professionals Blog
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                Insights from Tanzania's <span className="text-emerald-600 dark:text-emerald-400">Creative Minds</span>
              </h1>
              <p className="max-w-[600px] mx-auto text-gray-600 md:text-xl dark:text-gray-300 mb-8">
                Discover expert tips, industry trends, and success stories from leading creative professionals across
                Tanzania
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative w-full max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles, topics, or authors..."
                  className="pl-10 bg-white dark:bg-gray-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          {/* Floating cards with blog stats */}
          <div className="relative mt-12 h-20">
            <FloatingCard delay={0} className="absolute left-1/4 transform -translate-x-1/2">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Weekly Updates</span>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.5} className="absolute left-1/2 transform -translate-x-1/2">
              <div className="bg-emerald-600 text-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-semibold">20+ Expert Contributors</span>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={1} className="absolute left-3/4 transform -translate-x-1/2">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Diverse Topics</span>
                </div>
              </div>
            </FloatingCard>
          </div>
        </motion.div>
      </section>

      {/* Animated Categories Banner */}
      <section className="w-full py-6 bg-emerald-600 text-white overflow-hidden">
        <ParallaxText baseVelocity={-5}>
          Graphic Design • Photography • Videography • Digital Marketing • Business Growth • Client Management •
          Branding • Social Media • Content Creation • Web Design • UI/UX • Motion Graphics
        </ParallaxText>
      </section>

      {/* Featured Posts */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-baseline mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4 md:mb-0">Featured Articles</h2>
            <Link
              href="/blog/featured"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center"
            >
              View all featured
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/blog/${post.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 mb-2">{post.category}</Badge>
                        <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <div className="flex items-center mr-4">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center">
                      <div className="flex items-center">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                          <Image
                            src={post.authorImage || "/placeholder.svg"}
                            alt={post.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{post.authorRole}</p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Blog Posts */}
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Explore All Articles
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="bg-white dark:bg-gray-800 p-1 overflow-x-auto max-w-full flex-nowrap">
                  <TabsTrigger value="all" className="whitespace-nowrap">
                    All Posts
                  </TabsTrigger>
                  <TabsTrigger value="graphic-design" className="whitespace-nowrap">
                    Graphic Design
                  </TabsTrigger>
                  <TabsTrigger value="photography" className="whitespace-nowrap">
                    Photography
                  </TabsTrigger>
                  <TabsTrigger value="videography" className="whitespace-nowrap">
                    Videography
                  </TabsTrigger>
                  <TabsTrigger value="digital-marketing" className="whitespace-nowrap">
                    Digital Marketing
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" className="hidden sm:flex">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Link href={`/blog/${post.id}`}>
                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                          <div className="relative h-48 w-full overflow-hidden">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <CardContent className="p-4">
                            <Badge className="mb-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                              {post.category}
                            </Badge>
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                                  <Image
                                    src={post.authorImage || "/placeholder.svg"}
                                    alt={post.author}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-medium">{post.author}</span>
                              </div>
                              <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{post.date}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="graphic-design" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPosts
                    .filter((post) => post.category === "Graphic Design")
                    .map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="group"
                      >
                        <Link href={`/blog/${post.id}`}>
                          <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full overflow-hidden">
                              <Image
                                src={post.image || "/placeholder.svg"}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-4">
                              <Badge className="mb-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                {post.category}
                              </Badge>
                              <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                                    <Image
                                      src={post.authorImage || "/placeholder.svg"}
                                      alt={post.author}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="font-medium">{post.author}</span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{post.date}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>

              {/* Similar content for other tabs */}
              <TabsContent value="photography" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPosts
                    .filter((post) => post.category === "Photography")
                    .map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="group"
                      >
                        <Link href={`/blog/${post.id}`}>
                          <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full overflow-hidden">
                              <Image
                                src={post.image || "/placeholder.svg"}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-4">
                              <Badge className="mb-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                {post.category}
                              </Badge>
                              <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
                                    <Image
                                      src={post.authorImage || "/placeholder.svg"}
                                      alt={post.author}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="font-medium">{post.author}</span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{post.date}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-16 bg-emerald-600 dark:bg-emerald-800">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Stay Updated</h2>
              <p className="mb-8">
                Subscribe to our newsletter to receive the latest articles, tips, and insights from Tanzania's top
                creative professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button className="bg-white text-emerald-600 hover:bg-gray-100">Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
