"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, MessageSquare } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import type { Conversation } from "@/lib/database/types"

interface ChatListProps {
  currentUserId: string
  onConversationSelect: (conversation: Conversation) => void
  selectedConversationId?: string
}

export function ChatList({ currentUserId, onConversationSelect, selectedConversationId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [currentUserId])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await UnifiedDatabaseService.getConversations(currentUserId)
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = conversation.client_id === currentUserId ? conversation.creative : conversation.client
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Conversations List */}
          <div className="space-y-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation, index) => {
                const otherUser = conversation.client_id === currentUserId ? conversation.creative : conversation.client
                const isSelected = conversation.id === selectedConversationId

                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onConversationSelect(conversation)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} alt={otherUser?.name} />
                        <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{otherUser?.name}</h3>
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(conversation.last_message_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {otherUser?.role === "creative" ? "Creative" : "Client"}
                          </Badge>
                          {conversation.booking && (
                            <Badge variant="outline" className="text-xs">
                              Booking
                            </Badge>
                          )}
                        </div>

                        {/* Unread indicator */}
                        <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start a conversation by booking a service or contacting a creative professional
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
