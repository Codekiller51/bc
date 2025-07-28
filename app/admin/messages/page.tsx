"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MessageSquare,
  Users,
  Clock,
  MoreHorizontal,
  Eye,
  Reply,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { withAuth } from "@/components/enhanced-auth-provider"
import type { Conversation, Message } from "@/lib/database/types"

function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  useEffect(() => {
    loadConversations()
    loadMessages()
  }, [statusFilter])

  const loadConversations = async () => {
    try {
      setLoading(true)
      // For admin, we need to get all conversations
      const data = await EnhancedDatabaseService.getAllConversations()
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await EnhancedDatabaseService.getAllMessages()
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
      archived: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", icon: Archive },
      flagged: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch =
      conversation.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.creative?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || conversation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    totalMessages: messages.length,
    avgResponseTime: "2.5 hours", // This would be calculated from actual data
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and manage platform communications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.activeConversations}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMessages}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="conversations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="messages">All Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="mt-6">
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by participant name..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Conversations Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participants</TableHead>
                          <TableHead>Last Message</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              {[...Array(5)].map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : filteredConversations.length > 0 ? (
                          filteredConversations.map((conversation) => (
                            <TableRow key={conversation.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                    <Avatar className="border-2 border-white">
                                      <AvatarImage src={conversation.client?.avatar_url || "/placeholder.svg"} />
                                      <AvatarFallback>{conversation.client?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="border-2 border-white">
                                      <AvatarImage src={conversation.creative?.avatar_url || "/placeholder.svg"} />
                                      <AvatarFallback>{conversation.creative?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {conversation.client?.name} & {conversation.creative?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {conversation.booking ? `Booking: ${conversation.booking.id.slice(0, 8)}` : 'General conversation'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {new Date(conversation.last_message_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(conversation.status)}</TableCell>
                              <TableCell>{new Date(conversation.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewConversation(conversation)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Messages
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      Flag as Inappropriate
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.slice(0, 20).map((message, index) => (
                      <div key={message.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{message.sender?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{message.sender?.name || 'Unknown User'}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {message.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {message.message_type}
                            </Badge>
                            {message.read_at && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Read
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Message Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Today</span>
                        <span className="font-semibold">{messages.filter(m => 
                          new Date(m.created_at).toDateString() === new Date().toDateString()
                        ).length} messages</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>This Week</span>
                        <span className="font-semibold">{messages.filter(m => {
                          const messageDate = new Date(m.created_at)
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return messageDate >= weekAgo
                        }).length} messages</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>This Month</span>
                        <span className="font-semibold">{messages.filter(m => {
                          const messageDate = new Date(m.created_at)
                          const monthAgo = new Date()
                          monthAgo.setMonth(monthAgo.getMonth() - 1)
                          return messageDate >= monthAgo
                        }).length} messages</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Average Response Time</span>
                        <span className="font-semibold">2.5 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Fastest Response</span>
                        <span className="font-semibold">5 minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Response Rate</span>
                        <span className="font-semibold">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminMessagesPage, 'admin')