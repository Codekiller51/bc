"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DatabaseService } from "@/lib/services/database-service"
import type { Conversation, Message } from "@/lib/database/types"

interface RealTimeChatProps {
  conversation: Conversation
  currentUserId: string
}

export function RealTimeChat({ conversation, currentUserId }: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const otherUser = conversation.client_id === currentUserId ? conversation.creative : conversation.client

  useEffect(() => {
    loadMessages()

    // Subscribe to real-time messages
    const subscription = DatabaseService.subscribeToMessages(conversation.id, (message: Message) => {
      setMessages((prev) => [...prev, message])

      // Mark as read if not from current user
      if (message.sender_id !== currentUserId) {
        // Mark message as read logic here
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversation.id, currentUserId])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async () => {
    try {
      const data = await DatabaseService.getMessages(conversation.id)
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const message = await DatabaseService.sendMessage({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        message_type: "text",
      })

      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} alt={otherUser?.name} />
              <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {otherUser?.role === "creative" ? "Creative Professional" : "Client"}
                </Badge>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Booking</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, dayMessages]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="text-xs">
                    {formatDate(dayMessages[0].created_at)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {dayMessages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUserId
                    const showAvatar = index === 0 || dayMessages[index - 1].sender_id !== message.sender_id

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {!isCurrentUser && showAvatar && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={message.sender?.avatar_url || "/placeholder.svg"}
                                alt={message.sender?.name}
                              />
                              <AvatarFallback className="text-xs">{message.sender?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          {!isCurrentUser && !showAvatar && <div className="w-6" />}

                          <div
                            className={`rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-100" : "text-gray-500"}`}>
                              {formatTime(message.created_at)}
                              {isCurrentUser && message.read_at && <span className="ml-1">✓✓</span>}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} alt={otherUser?.name} />
                    <AvatarFallback className="text-xs">{otherUser?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
