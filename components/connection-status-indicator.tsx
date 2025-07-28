"use client"

import { motion } from "framer-motion"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ConnectionStatusIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected'
  className?: string
}

export function ConnectionStatusIndicator({ status, className = "" }: ConnectionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          iconColor: 'text-green-600 dark:text-green-400'
        }
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          iconColor: 'text-red-600 dark:text-red-400'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon 
          className={`h-3 w-3 ${config.iconColor} ${status === 'connecting' ? 'animate-spin' : ''}`} 
        />
        {config.text}
      </Badge>
    </motion.div>
  )
}