"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Users, DollarSign, Clock, CheckCircle, Star } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RecentBookings } from "@/components/recent-bookings"
import { RevenueChart } from "@/components/revenue-chart"
import { UserGrowthChart } from "@/components/user-growth-chart"
import { withAuth } from "@/components/enhanced-auth-provider"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalCreatives: 0,
    totalClients: 0,
    pendingApprovals: 0,
    monthlyGrowth: 0,
    averageRating: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const data = await EnhancedDatabaseService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("sw-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 0,
      }).format(stats.totalRevenue),
      change: `+${stats.monthlyGrowth}%`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      change: "+8.2%",
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Creatives",
      value: stats.totalCreatives.toLocaleString(),
      change: "+15.3%",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Total Clients",
      value: stats.totalClients.toLocaleString(),
      change: "+8.7%",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toLocaleString(),
      change: "-5.2%",
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toString(),
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with Brand Connect today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <RevenueChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <UserGrowthChart />
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bookings" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
                    <TabsTrigger value="payments">Recent Payments</TabsTrigger>
                    <TabsTrigger value="users">New Users</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="mt-6">
                    <RecentBookings />
                  </TabsContent>

                  <TabsContent value="payments" className="mt-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">Payment from Client {i + 1}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Logo design service</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">TZS 250,000</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {i + 1} hour{i !== 0 ? "s" : ""} ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="mt-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">New User {i + 1}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {i % 2 === 0 ? "Client" : "Creative Professional"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {i + 1} hour{i !== 0 ? "s" : ""} ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminDashboard, 'admin')
