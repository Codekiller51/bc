"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChatList } from "@/components/chat-list"
import { RealTimeChat } from "@/components/real-time-chat"
import { ConnectionStatusIndicator } from "@/components/connection-status-indicator"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"
import { useConnectionStatus } from "@/hooks/use-real-time-data"
import type { Conversation } from "@/lib/database/types"

function DashboardMessagesPage() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const connectionStatus = useConnectionStatus()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Communicate with creative professionals and clients
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator 
              status={connectionStatus === 'online' ? 'connected' : 'disconnected'} 
            />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <ChatList
            currentUserId={user?.id || ''}
            onConversationSelect={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <RealTimeChat 
              conversation={selectedConversation} 
              currentUserId={user?.id || ''} 
            />
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default withAuth(DashboardMessagesPage)