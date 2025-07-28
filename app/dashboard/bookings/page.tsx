"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Filter, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedBookingList } from "@/components/enhanced-booking-list"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"

function DashboardBookingsPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getFilters = () => {
    const filters: any = {}
    
    if (statusFilter !== "all") {
      filters.status = statusFilter
    }

    return filters
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your bookings and track their progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">4</p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <EnhancedBookingList 
            userId={user?.id} 
            filters={getFilters()}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <EnhancedBookingList 
            userId={user?.id} 
            filters={{ ...getFilters(), status: 'pending' }}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          <EnhancedBookingList 
            userId={user?.id} 
            filters={{ ...getFilters(), status: 'confirmed' }}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <EnhancedBookingList 
            userId={user?.id} 
            filters={{ ...getFilters(), status: 'completed' }}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <EnhancedBookingList 
            userId={user?.id} 
            filters={{ ...getFilters(), status: 'cancelled' }}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default withAuth(DashboardBookingsPage)