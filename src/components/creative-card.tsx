import { Link } from "react-router-dom"
import { MapPin, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface CreativeCardProps {
  name: string
  title: string
  location: string
  rating: number
  reviews: number
  imageSrc: string
  href: string
}

export function CreativeCard({ name, title, location, rating, reviews, imageSrc, href }: CreativeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <img src={imageSrc || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({reviews} reviews)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={href} className="w-full">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
