"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Users, Target, Eye, Heart, Award, Globe, ArrowRight, CheckCircle, Star, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/animated-counter"
import { FloatingCard } from "@/components/floating-card"

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("mission")
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const missionRef = useRef(null)
  const founderRef = useRef(null)

  const isHeroInView = useInView(heroRef, { once: true })
  const isStatsInView = useInView(statsRef, { once: true })
  const isMissionInView = useInView(missionRef, { once: true })
  const isFounderInView = useInView(founderRef, { once: true })

  const stats = [
    { label: "Creative Professionals", value: 500, suffix: "+" },
    { label: "Successful Projects", value: 1200, suffix: "+" },
    { label: "Cities Covered", value: 15, suffix: "" },
    { label: "Client Satisfaction", value: 98, suffix: "%" },
  ]

  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion for Creativity",
      description: "We believe in the power of creativity to transform businesses and communities across Tanzania.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "Building strong connections between local talent and businesses to foster economic growth.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Quality Excellence",
      description: "Maintaining high standards through verified professionals and quality assurance processes.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Local Impact",
      description: "Empowering Tanzania's creative economy by connecting talent with opportunities nationwide.",
    },
  ]

  const timeline = [
    {
      year: "2022",
      title: "The Vision",
      description: "Ebenezer Ernest Mashambo identified the gap between creative talent and clients in Tanzania.",
    },
    {
      year: "2023",
      title: "Platform Development",
      description: "Built the first version of Brand Connect with core features for creative professionals.",
    },
    {
      year: "2024",
      title: "Launch & Growth",
      description: "Officially launched in major Tanzanian cities with 100+ verified creatives.",
    },
    {
      year: "2025",
      title: "Expansion",
      description: "Scaling across Tanzania with advanced features and mobile app development.",
    },
  ]

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
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isHeroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  About Brand Connect
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Bridging Dreams with
                  <span className="text-emerald-600 dark:text-emerald-400"> Talent</span>
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                  We're revolutionizing how creative professionals and clients connect across Tanzania, building a
                  thriving ecosystem where talent meets opportunity.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    Join Our Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Get in Touch
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative h-[400px] w-full">
                <FloatingCard delay={0} className="absolute top-0 right-0 z-10">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">4.9 Rating</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From 500+ clients</p>
                  </div>
                </FloatingCard>

                <FloatingCard delay={1} className="absolute bottom-0 left-0 z-10">
                  <div className="bg-emerald-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">1000+ Creatives</span>
                    </div>
                    <p className="text-sm opacity-90">Across Tanzania</p>
                  </div>
                </FloatingCard>

                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl transform rotate-3"></div>
                <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                  <Image
                    src="/logos/logo-transparent.png?height=400&width=400"
                    alt="Creative professionals collaborating"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="w-full py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isStatsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section ref={missionRef} className="w-full py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isMissionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Our Purpose & Values</h2>
            <p className="max-w-[800px] mx-auto text-gray-500 md:text-xl dark:text-gray-400">
              Driven by a mission to transform Tanzania's creative economy through technology and community
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isMissionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="h-full border-l-4 border-l-emerald-600">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mr-3" />
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To create a thriving digital ecosystem that connects Tanzania's creative talent with clients
                    nationwide, fostering economic growth, empowering local communities, and showcasing the incredible
                    creativity that exists across our beautiful country.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isMissionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full border-l-4 border-l-teal-600">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Eye className="h-8 w-8 text-teal-600 dark:text-teal-400 mr-3" />
                    <h3 className="text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    To become Tanzania's leading platform for creative services, where every talented individual has the
                    opportunity to showcase their skills, build sustainable businesses, and contribute to the nation's
                    creative economy while clients easily find exceptional talent.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={isMissionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {values.map((value, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-emerald-600 dark:text-emerald-400 mb-4 flex justify-center">{value.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="w-full py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">The Challenge We're Solving</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Limited Visibility:</strong> Talented creatives struggle to reach potential clients beyond
                    their immediate networks
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Geographic Barriers:</strong> Clients find it difficult to discover quality creative
                    services in their specific regions
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Trust Issues:</strong> Lack of verification and review systems makes it risky for clients to
                    hire unknown creatives
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Economic Impact:</strong> Underutilized creative talent limits economic growth in Tanzania's
                    creative sector
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-emerald-600 dark:text-emerald-400">
                Our Solution
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Location-Based Discovery:</strong> Advanced search and filtering by region, service type,
                    and expertise level
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Verified Professionals:</strong> Comprehensive verification process and review system for
                    quality assurance
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Seamless Communication:</strong> Built-in messaging and booking system for smooth
                    collaboration
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Economic Empowerment:</strong> Creating sustainable income opportunities for creative
                    professionals nationwide
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section
        ref={founderRef}
        className="w-full py-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950"
      >
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isFounderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Meet Our Founder</h2>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400">
              The visionary behind Brand Connect's mission to transform Tanzania's creative economy
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={isFounderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-full">
                    <Image
                      src="/founder.jpg?height=400&width=400"
                      alt="Ebenezer Ernest Mashambo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8 lg:p-12">
                    <h3 className="text-2xl font-bold mb-2">Ebenezer Ernest Mashambo</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-4">Founder & CEO</p>
                    <div className="flex items-center mb-4 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Dar es Salaam, Tanzania</span>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                      <p>
                        Ebenezer Ernest Mashambo is a passionate entrepreneur and technology enthusiast with a deep
                        understanding of Tanzania's creative landscape. With over 8 years of experience in digital
                        platforms and business development, he recognized the untapped potential in connecting local
                        creative talent with businesses across the country.
                      </p>
                      <p>
                        His vision for Brand Connect stems from witnessing firsthand the challenges faced by talented
                        creatives in gaining visibility and the difficulties businesses encounter when seeking quality
                        creative services. Through Brand Connect, Ebenezer aims to bridge this gap and create a thriving
                        ecosystem that benefits both creatives and clients.
                      </p>
                      <p>
                        "I believe that Tanzania has incredible creative talent that deserves to be showcased and
                        rewarded. Brand Connect is our contribution to building a stronger, more connected creative
                        economy that benefits everyone involved."
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Badge variant="outline">Entrepreneur</Badge>
                      <Badge variant="outline">Tech Innovator</Badge>
                      <Badge variant="outline">Creative Advocate</Badge>
                      <Badge variant="outline">Community Builder</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="w-full py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Our Journey</h2>
            <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl dark:text-gray-400">
              From vision to reality - the story of Brand Connect's growth
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className="relative flex items-center mb-8 last:mb-0"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full z-10"></div>
                {index < timeline.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-4 w-0.5 h-16 bg-emerald-200 dark:bg-emerald-800"></div>
                )}

                <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 ml-auto"}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{item.year}</div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800">
        <div className="container px-4 md:px-6">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Ready to Be Part of Our Story?
            </h2>
            <p className="max-w-[600px] mx-auto md:text-xl mb-8">
              Join thousands of creative professionals and clients who are already transforming Tanzania's creative
              economy through Brand Connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                  Join Our Community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
