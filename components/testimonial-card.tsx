"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Star, Quote, Play, MapPin } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TestimonialCardProps {
  testimonial: {
    id: number
    name: string
    role: string
    company: string
    location: string
    image: string
    content: string
    rating: number
    category: string
    videoUrl: string
  }
  index: number
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">{testimonial.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              {testimonial.category}
            </Badge>
          </div>

          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>

          <div className="relative mb-4">
            <Quote className="absolute -top-2 -left-2 h-6 w-6 text-emerald-200 dark:text-emerald-800 rotate-180" />
            <p className="text-gray-600 dark:text-gray-300 relative z-10 pl-4 line-clamp-4">{testimonial.content}</p>
          </div>

          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{testimonial.location}</span>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-between">
          <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400">
            Read Full Story
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
          >
            <Play className="h-3 w-3" />
            Watch Video
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
