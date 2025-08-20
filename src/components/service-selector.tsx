"use client"

import { motion } from "framer-motion"
import { Clock, DollarSign, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/database/types"

interface ServiceSelectorProps {
  services: Service[]
  onServiceSelect: (service: Service) => void
  selectedService?: Service | null
}

export function ServiceSelector({ services, onServiceSelect, selectedService }: ServiceSelectorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Service</h3>

      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedService?.id === service.id ? "ring-2 ring-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : ""
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {service.category && (
                    <Badge variant="outline" className="mt-1">
                      {service.category}
                    </Badge>
                  )}
                </div>
                {selectedService?.id === service.id && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              </div>
            </CardHeader>

            <CardContent>
              {service.description && <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">{formatCurrency(service.price)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatDuration(service.duration)}</span>
                  </div>
                </div>

                <Button
                  variant={selectedService?.id === service.id ? "default" : "outline"}
                  size="sm"
                  className={selectedService?.id === service.id ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  {selectedService?.id === service.id ? "Selected" : "Select"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {services.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No services available at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
