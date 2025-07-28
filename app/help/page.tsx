"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  Search,
  HelpCircle,
  Book,
  FileText,
  Video,
  MessageSquare,
  ChevronRight,
  Mail,
  ArrowRight,
  Play,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

// Sample help categories
const helpCategories = [
  {
    title: "Getting Started",
    icon: <Book className="h-6 w-6" />,
    description: "Learn the basics of using Brand Connect",
    articles: 12,
  },
  {
    title: "Account Management",
    icon: <FileText className="h-6 w-6" />,
    description: "Manage your profile, settings, and security",
    articles: 8,
  },
  {
    title: "Finding Creatives",
    icon: <Search className="h-6 w-6" />,
    description: "How to search and connect with creative professionals",
    articles: 10,
  },
  {
    title: "Booking & Payments",
    icon: <FileText className="h-6 w-6" />,
    description: "Learn about booking services and payment processes",
    articles: 15,
  },
  {
    title: "For Creative Professionals",
    icon: <FileText className="h-6 w-6" />,
    description: "Resources for creatives offering services",
    articles: 14,
  },
  {
    title: "Video Tutorials",
    icon: <Video className="h-6 w-6" />,
    description: "Step-by-step video guides for using Brand Connect",
    articles: 6,
  },
]

// Sample popular articles
const popularArticles = [
  {
    id: 1,
    title: "How to create and verify your creative professional profile",
    category: "Getting Started",
    views: 1245,
  },
  {
    id: 2,
    title: "Understanding the booking and payment process",
    category: "Booking & Payments",
    views: 982,
  },
  {
    id: 3,
    title: "Tips for creating an attractive portfolio",
    category: "For Creative Professionals",
    views: 876,
  },
  {
    id: 4,
    title: "How to find the right creative professional for your project",
    category: "Finding Creatives",
    views: 754,
  },
  {
    id: 5,
    title: "Managing and updating your account information",
    category: "Account Management",
    views: 621,
  },
]

// Sample FAQs
const faqs = [
  {
    question: "How do I become a verified creative professional?",
    answer:
      "To become a verified creative professional on Brand Connect, you need to create an account, complete your profile with accurate information, upload samples of your work to your portfolio, and submit your profile for verification. Our team will review your submission within 2-3 business days. Verification may include checking your credentials, reviewing your portfolio, and sometimes a brief video interview.",
  },
  {
    question: "What fees does Brand Connect charge?",
    answer:
      "Brand Connect operates on a commission-based model. For creative professionals, we charge a 10% commission on completed projects. There are no upfront costs, monthly fees, or charges for creating a profile. For clients, using the platform to find and connect with creatives is completely free. Premium features for both clients and creatives are available through our subscription plans.",
  },
  {
    question: "How does the booking system work?",
    answer:
      "Our booking system allows clients to schedule services with creative professionals directly through the platform. After finding a creative you'd like to work with, you can view their availability calendar, select your preferred date and time, specify project details, and send a booking request. The creative will then confirm or suggest alternative times. Once confirmed, you'll receive a notification and the booking will appear in your dashboard.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Brand Connect accepts various payment methods including credit/debit cards (Visa, Mastercard), mobile money services (M-Pesa, Tigo Pesa, Airtel Money), and bank transfers for larger projects. All payments are processed securely through our platform, which holds the payment in escrow until the project is completed satisfactorily.",
  },
  {
    question: "How does the review system work?",
    answer:
      "After a project is completed, both clients and creative professionals can leave reviews for each other. Reviews include a star rating (1-5) and written feedback. These reviews are public and help build trust in the community. We encourage honest, constructive feedback that helps others make informed decisions. Reviews cannot be removed unless they violate our community guidelines.",
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer:
      "If you're not satisfied with the work delivered, we recommend first communicating directly with the creative professional to address your concerns. If issues persist, you can open a dispute through our platform. Our support team will review the case, including all communications and deliverables, and mediate a resolution. In cases where work clearly doesn't meet agreed-upon requirements, we offer refunds or partial refunds according to our satisfaction guarantee policy.",
  },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

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
                Help Center
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                How can we <span className="text-emerald-600 dark:text-emerald-400">help you?</span>
              </h1>
              <p className="max-w-[600px] mx-auto text-gray-600 md:text-xl dark:text-gray-300 mb-8">
                Find answers to your questions about Brand Connect with our comprehensive help resources
              </p>
            </motion.div>

            <motion.div
              className="relative max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles, tutorials, and FAQs..."
                className="pl-12 py-6 text-lg rounded-full shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                size="lg"
              >
                Search
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Help Categories */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Browse Help Topics
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/help/${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                          <div className="text-emerald-600 dark:text-emerald-400">{category.icon}</div>
                        </div>
                        <Badge variant="outline">{category.articles} articles</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                      <p className="text-gray-500 dark:text-gray-400">{category.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Browse Articles
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8 text-center">Popular Articles</h2>

            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <motion.li
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={`/help/articles/${article.id}`}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start">
                          <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">{article.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{article.category}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {article.views} views
                        </Badge>
                      </Link>
                      {index < popularArticles.length - 1 && <Separator className="my-2" />}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center p-6 pt-2">
                <Button
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  View All Articles
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="clients">For Clients</TabsTrigger>
                <TabsTrigger value="creatives">For Creatives</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <Card>
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="flex justify-center p-6 pt-2">
                    <Button
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      View All FAQs
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="clients">
                <Card>
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.slice(2, 6).map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="flex justify-center p-6 pt-2">
                    <Button
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      View All Client FAQs
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="creatives">
                <Card>
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.slice(0, 4).map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                  <CardFooter className="flex justify-center p-6 pt-2">
                    <Button
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      View All Creative FAQs
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Video Tutorials</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Learn how to use Brand Connect with our step-by-step video guides
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full group cursor-pointer">
                    <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/40 transition-colors z-10"></div>
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 opacity-90"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)" }}
                    ></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-colors">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 z-20">
                      <Badge className="bg-white/20 backdrop-blur-sm text-white">
                        {index === 0 ? "Getting Started" : index === 1 ? "For Clients" : "For Creatives"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {index === 0
                        ? "How to Create Your Account"
                        : index === 1
                          ? "Finding the Perfect Creative"
                          : "Setting Up Your Portfolio"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {index === 0
                        ? "Learn how to create and set up your Brand Connect account in minutes."
                        : index === 1
                          ? "Discover how to search, filter, and find the right creative professional for your project."
                          : "Tips for creating an attractive portfolio that showcases your best work."}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Watch Tutorial
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              View All Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Still Need Help?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our support team is ready to assist you with any questions or issues
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
                    <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Send us an email and we'll get back to you within 24 hours
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-6">support@brandconnect.co.tz</p>
                  <Button
                    className="mt-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    asChild
                  >
                    <Link href="mailto:support@brandconnect.co.tz">
                      Send Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
                    <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Chat with our support team for immediate assistance
                  </p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 mb-6">Available 9 AM - 6 PM EAT</p>
                  <Button
                    className="mt-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
                  >
                    Start Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
