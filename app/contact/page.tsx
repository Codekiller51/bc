"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FloatingCard } from "@/components/floating-card"
import { InteractiveMap } from "@/components/interactive-map"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "",
      })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "hello@brandconnect.co.tz",
      action: "mailto:hello@brandconnect.co.tz",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      description: "Speak directly with our team during business hours",
      contact: "+255 123 456 789",
      action: "tel:+255123456789",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Chat",
      description: "Get instant support through our live chat system",
      contact: "Available 9 AM - 6 PM",
      action: "#",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      description: "Come visit our office in the heart of Dar es Salaam",
      contact: "Masaki, Dar es Salaam",
      action: "#",
    },
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, name: "Facebook", href: "#", color: "hover:text-blue-600" },
    { icon: <Twitter className="h-5 w-5" />, name: "Twitter", href: "#", color: "hover:text-blue-400" },
    { icon: <Instagram className="h-5 w-5" />, name: "Instagram", href: "#", color: "hover:text-pink-600" },
    { icon: <Linkedin className="h-5 w-5" />, name: "LinkedIn", href: "#", color: "hover:text-blue-700" },
  ]

  const faqs = [
    {
      question: "How do I become a verified creative professional?",
      answer:
        "Simply register as a creative, complete your profile with portfolio samples, and our team will review and verify your account within 2-3 business days.",
    },
    {
      question: "What fees does Brand Connect charge?",
      answer:
        "We charge a small commission fee only when you successfully complete a project. There are no upfront costs or monthly fees for basic membership.",
    },
    {
      question: "How do I ensure the quality of creative professionals?",
      answer:
        "All our creatives go through a verification process, and we have a comprehensive review and rating system from previous clients.",
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer:
        "We have a satisfaction guarantee policy. If you're not happy with the work, we'll work with you and the creative to resolve the issue or provide a refund.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <motion.div
          className="container px-4 md:px-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Get in Touch
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Let's Start a<span className="text-emerald-600 dark:text-emerald-400"> Conversation</span>
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                  Have questions about Brand Connect? Want to partner with us? Or need support? We're here to help and
                  would love to hear from you.
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-sm">Response Time</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-sm">Support Available</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">9 AM - 6 PM EAT</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative h-[400px] w-full">
                <FloatingCard delay={0} className="absolute top-0 right-0 z-10">
                  <div className="bg-emerald-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">24/7 Support</span>
                    </div>
                    <p className="text-sm opacity-90">Always here to help</p>
                  </div>
                </FloatingCard>

                <FloatingCard delay={1} className="absolute bottom-0 left-0 z-10">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Quick Response</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average 2 hours</p>
                  </div>
                </FloatingCard>

                <InteractiveMap />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Multiple Ways to Reach Us</h2>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-lg dark:text-gray-400">
              Choose the method that works best for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-emerald-600 dark:text-emerald-400 mb-4 flex justify-center">{method.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{method.description}</p>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">{method.contact}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Send Us a Message</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Fill out the form below and we'll get back to you as soon as possible. We typically respond within 24
                hours during business days.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Follow Us</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        className={`p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors ${social.color}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {social.icon}
                        <span className="sr-only">{social.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Office Hours</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inquiry-type">Inquiry Type</Label>
                          <Select
                            value={formData.inquiryType}
                            onValueChange={(value) => handleInputChange("inquiryType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder="Enter the subject of your message"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Enter your message here..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending...
                          </motion.div>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Frequently Asked Questions</h2>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-lg dark:text-gray-400">
              Quick answers to common questions about Brand Connect
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 text-emerald-600 dark:text-emerald-400">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">Still have questions? We're here to help!</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
              Contact Support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
