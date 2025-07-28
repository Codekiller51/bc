"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FloatingCardProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FloatingCard({ children, delay = 0, className = "" }: FloatingCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          delay: delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          repeatDelay: 2,
        },
      }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          transition: {
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
