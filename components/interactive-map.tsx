"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

export function InteractiveMap() {
  const locations = [
    { name: "Dar es Salaam", x: "60%", y: "70%" },
    { name: "Arusha", x: "45%", y: "30%" },
    { name: "Mwanza", x: "20%", y: "25%" },
    { name: "Dodoma", x: "40%", y: "50%" },
    { name: "Mbeya", x: "25%", y: "80%" },
  ]

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 to-teal-900 rounded-2xl overflow-hidden">
      {/* Tanzania outline (simplified) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 100 L350 100 L350 300 L200 350 L50 300 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          opacity="0.1"
        />
      </svg>

      {/* Location pins */}
      {locations.map((location, index) => (
        <motion.div
          key={location.name}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: location.x, top: location.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="relative group">
            <motion.div
              className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.2, 1],
                transition: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.3,
                },
              }}
            >
              <MapPin className="w-3 h-3 text-white" />
            </motion.div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {location.name}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {locations.map((location, index) => (
          <motion.circle
            key={`pulse-${index}`}
            cx={location.x}
            cy={location.y}
            r="0"
            fill="rgba(16, 185, 129, 0.3)"
            initial={{ r: 0 }}
            animate={{
              r: [0, 30, 0],
              transition: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.5,
              },
            }}
          />
        ))}
      </svg>
    </div>
  )
}
