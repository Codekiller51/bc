"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ChatList } from "@/components/chat-list"
import { RealTimeChat } from "@/components/real-time-chat"
import type { Conversation } from "@/lib/database/types"

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentUserId] = useState("client_1") // This would come from auth context

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="text-gray-500 dark:text-gray-400">Communicate with creative professionals and clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <ChatList
              currentUserId={currentUserId}
              onConversationSelect={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <RealTimeChat conversation={selectedConversation} currentUserId={currentUserId} />
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
    </div>
  )
}
