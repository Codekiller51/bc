"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, Calendar, DollarSign, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { CreativeApprovalWorkflow } from "@/components/creative-approval-workflow"

function CreativeDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedProjects: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingBookings: 0,
    thisMonthEarnings: 0
  })
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    loadCreativeStats()
    checkApprovalStatus()
  }, [])

  const loadCreativeStats = async () => {
    try {
      // Load creative-specific statistics
      const bookings = await EnhancedDatabaseService.getBookings({ userId: user?.id })
      const completedBookings = bookings.filter(b => b.status === 'completed')
      const pendingBookings = bookings.filter(b => b.status === 'pending')
      
      setStats({
        totalBookings: bookings.length,
        completedProjects: completedBookings.length,
        totalEarnings: completedBookings.reduce((sum, b) => sum + b.total_amount, 0),
        averageRating: 4.8, // This would come from reviews
        pendingBookings: pendingBookings.length,
        thisMonthEarnings: 125000 // Calculate from this month's completed bookings
      })
    } catch (error) {
      console.error('Failed to load creative stats:', error)
    }
  }

  const checkApprovalStatus = async () => {
    try {
      const profile = await EnhancedDatabaseService.getCreativeProfileById(user?.id || '')
      if (profile) {
        setApprovalStatus(profile.approval_status)
      }
    } catch (error) {
      console.error('Failed to check approval status:', error)
    }
  }

  if (approvalStatus === "pending") {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CreativeApprovalWorkflow />
        </div>
      </div>
    )
  }

  if (approvalStatus === "rejected") {
    return (
      <div className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Profile Not Approved</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Unfortunately, your profile was not approved. Please contact support for more information 
              or to resubmit your application with additional documentation.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creative Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}! Here's your creative business overview.
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Projects</p>
                <p className="text-2xl font-bold">{stats.completedProjects}</p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("sw-TZ", {
                    style: "currency",
                    currency: "TZS",
                    minimumFractionDigits: 0,
                  }).format(stats.totalEarnings)}
                </p>
                <p className="text-xs text-green-600">+25% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <p className="text-xs text-green-600">Excellent rating</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Project completed</p>
                      <p className="text-sm text-gray-500">Logo design for ABC Company</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">New booking received</p>
                      <p className="text-sm text-gray-500">Photography session scheduled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">New 5-star review</p>
                      <p className="text-sm text-gray-500">From satisfied client</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View My Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Portfolio
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Pricing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Earnings Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">
                Booking management interface would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">
                Earnings analytics and reports would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">
                Profile editing interface would go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default withAuth(CreativeDashboardPage, 'creative', true)