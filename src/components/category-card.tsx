import { Link } from "react-router-dom"
import { BarChart, Camera, Palette, Video } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface CategoryCardProps {
  title: string
  icon: string
  description: string
  href: string
}

export function CategoryCard({ title, icon, description, href }: CategoryCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Palette":
        return <Palette className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      case "Camera":
        return <Camera className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      case "Video":
        return <Video className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      case "BarChart":
        return <BarChart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      default:
        return <Palette className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
    }
  }

  return (
    <Link to={href}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          {getIcon(icon)}
          <h3 className="font-bold text-xl">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
