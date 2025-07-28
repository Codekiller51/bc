"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ThumbsUp, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Sample blog post data
const blogPost = {
  id: 1,
  title: "10 Essential Tips for Graphic Designers in Tanzania",
  excerpt: "Discover the top tips for graphic designers looking to succeed in Tanzania's competitive creative market.",
  author: "Maria Joseph",
  authorRole: "Graphic Designer",
  authorBio:
    "Maria is a senior graphic designer with over 8 years of experience working with top brands across Tanzania. She specializes in brand identity design and has won multiple awards for her creative work.",
  authorImage: "/placeholder.svg?height=80&width=80",
  date: "May 15, 2024",
  readTime: "5 min read",
  category: "Graphic Design",
  image: "/placeholder.svg?height=600&width=1200",
  featured: true,
  tags: ["Design Tips", "Career Growth", "Tanzania"],
  content: `
    <p>The graphic design industry in Tanzania has seen tremendous growth over the past decade. With increasing digitalization and more businesses recognizing the importance of visual branding, there's never been a better time to be a graphic designer in the country. However, with opportunity comes competition, and standing out requires more than just technical skills.</p>
    
    <h2>1. Understand the Local Market</h2>
    <p>Tanzania has a unique cultural context that influences design preferences. What works internationally might not resonate with local clients. Take time to understand local color preferences, cultural symbols, and design aesthetics that appeal to Tanzanian audiences.</p>
    
    <h2>2. Build a Specialized Portfolio</h2>
    <p>Rather than being a generalist, consider specializing in a specific area of graphic design such as brand identity, packaging, or UI/UX design. Specialization allows you to develop deeper expertise and position yourself as an authority in that niche.</p>
    
    <h2>3. Network Strategically</h2>
    <p>Join local design communities, attend industry events, and connect with other creatives. Tanzania's business culture values personal relationships, so networking can open doors to opportunities that might not be advertised publicly.</p>
    
    <h2>4. Invest in Continuous Learning</h2>
    <p>The design field evolves rapidly. Stay updated with the latest design trends, software, and techniques through online courses, workshops, and industry publications. Consider learning complementary skills like basic web development or marketing principles.</p>
    
    <h2>5. Price Your Services Appropriately</h2>
    <p>Research the market rates for graphic design services in Tanzania and position your pricing based on your experience and the value you provide. Don't undersell your services, but also be realistic about what the local market can bear.</p>
    
    <h2>6. Develop Strong Communication Skills</h2>
    <p>The ability to clearly communicate your design decisions and listen to client needs is crucial. Many design projects fail not because of technical issues but due to miscommunication or misaligned expectations.</p>
    
    <h2>7. Create a Professional Online Presence</h2>
    <p>Maintain an updated portfolio website and active social media profiles showcasing your work. Many Tanzanian businesses now search online for design services, so a strong digital presence is essential.</p>
    
    <h2>8. Understand Business Objectives</h2>
    <p>The most successful designers understand that their work needs to achieve business goals, not just look attractive. Learn to ask the right questions about your clients' business objectives and tailor your designs accordingly.</p>
    
    <h2>9. Build Long-term Client Relationships</h2>
    <p>Repeat business is often more valuable than constantly chasing new clients. Focus on delivering exceptional service that encourages clients to return and refer you to others.</p>
    
    <h2>10. Embrace Technology and Automation</h2>
    <p>Use design tools and automation to streamline repetitive tasks, allowing you to focus on the creative aspects of your work. This increases your productivity and enables you to take on more projects.</p>
    
    <h3>Conclusion</h3>
    <p>The graphic design landscape in Tanzania offers tremendous opportunities for those willing to invest in their skills and business acumen. By implementing these tips, you'll be better positioned to thrive in this competitive yet rewarding field.</p>
  `,
  comments: [
    {
      id: 1,
      author: "John Mbwambo",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "May 16, 2024",
      content:
        "Great article! I especially agree with the point about understanding the local market. I've seen many designers try to apply Western design principles without considering Tanzanian cultural context.",
      likes: 12,
    },
    {
      id: 2,
      author: "Sarah Kimaro",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "May 17, 2024",
      content:
        "The tip about pricing is so important. I've seen many talented designers undervalue their work. We need to educate clients about the value of good design!",
      likes: 8,
    },
  ],
}

// Sample related posts
const relatedPosts = [
  {
    id: 2,
    title: "How to Price Your Graphic Design Services in East Africa",
    excerpt: "A comprehensive guide to setting competitive yet profitable rates for your design work.",
    author: "David Mushi",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "May 10, 2024",
    category: "Graphic Design",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Building a Standout Design Portfolio: Tips for Tanzanian Creatives",
    excerpt: "Learn how to showcase your work effectively to attract high-quality clients.",
    author: "Grace Mwakasege",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "May 5, 2024",
    category: "Career Growth",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Color Theory for African Design Contexts",
    excerpt: "Understanding color psychology and preferences in East African markets.",
    author: "Peter Makundi",
    authorImage: "/placeholder.svg?height=40&width=40",
    date: "April 28, 2024",
    category: "Design Theory",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const contentRef = useRef(null)
  const isContentInView = useInView(contentRef, { once: true })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all articles
              </Link>

              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {blogPost.category}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">{blogPost.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={blogPost.authorImage || "/placeholder.svg"}
                      alt={blogPost.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{blogPost.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{blogPost.authorRole}</p>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{blogPost.date}</span>
                </div>

                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{blogPost.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="w-full bg-white dark:bg-gray-950 -mt-10">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-4xl mx-auto relative h-[300px] sm:h-[400px] md:h-[500px] rounded-t-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image src={blogPost.image || "/placeholder.svg"} alt={blogPost.title} fill className="object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="w-full py-12 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 space-y-8">
                <motion.div
                  className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <h3 className="font-semibold mb-4">About the Author</h3>
                  <div className="flex items-center mb-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                      <Image
                        src={blogPost.authorImage || "/placeholder.svg"}
                        alt={blogPost.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{blogPost.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{blogPost.authorRole}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{blogPost.authorBio}</p>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  >
                    View Profile
                  </Button>
                </motion.div>

                <motion.div
                  className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <h3 className="font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <h3 className="font-semibold mb-4">Share this article</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="rounded-full">
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
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
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
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
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
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Main Content */}
            <motion.div
              ref={contentRef}
              className="lg:col-span-3 order-1 lg:order-2"
              initial={{ opacity: 0, y: 30 }}
              animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              <div className="prose prose-emerald dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
              </div>

              <div className="flex items-center justify-between mt-8 pt-8 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Like</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="w-full py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-8">Comments ({blogPost.comments.length})</h2>

              <Tabs defaultValue="comments">
                <TabsList className="mb-6">
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="write">Write a comment</TabsTrigger>
                </TabsList>
                <TabsContent value="comments" className="space-y-6">
                  {blogPost.comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={comment.authorImage || "/placeholder.svg"} alt={comment.author} />
                            <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{comment.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span className="text-xs">{comment.likes}</span>
                              </Button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                            <div className="flex gap-2 mt-4">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="write">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-4">Write your comment</h3>
                      <Textarea placeholder="Share your thoughts..." className="min-h-32 mb-4" />
                      <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Post Comment
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="w-full py-12 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post, index) => (
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
                          <div className="flex items-center text-sm">
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
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
