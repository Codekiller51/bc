"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Activity,
  Download
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminSidebar } from "@/components/admin-sidebar"
import { RevenueChart } from "@/components/revenue-chart"
import { UserGrowthChart } from "@/components/user-growth-chart"
import { withAuth } from "@/components/enhanced-auth-provider"

function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [analytics, setAnalytics] = useState({
    totalRevenue: 15750000,
    revenueGrowth: 23.5,
    totalUsers: 1247,
    userGrowth: 18.2,
    totalBookings: 892,
    bookingGrowth: 15.7,
    conversionRate: 12.4,
    avgOrderValue: 175000,
    topCategories: [
      { name: "Graphic Design", value: 35, bookings: 312 },
      { name: "Photography", value: 28, bookings: 249 },
      { name: "Videography", value: 22, bookings: 196 },
      { name: "Digital Marketing", value: 15, bookings: 135 }
    ],
    topLocations: [
      { name: "Dar es Salaam", value: 45, users: 561 },
      { name: "Arusha", value: 20, users: 249 },
      { name: "Mwanza", value: 15, users: 187 },
      { name: "Dodoma", value: 12, users: 150 },
      { name: "Mbeya", value: 8, users: 100 }
    ]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const exportData = () => {
    // In a real app, this would generate and download analytics report
    toast.success("Analytics report exported successfully!")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into platform performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                    <p className="text-xs text-green-600">+{analytics.revenueGrowth}% from last period</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{analytics.userGrowth}% from last period</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold">{analytics.totalBookings.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{analytics.bookingGrowth}% from last period</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                    <p className="text-xs text-green-600">+2.1% from last period</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart />
            <UserGrowthChart />
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories by Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{category.bookings} bookings</p>
                            <p className="text-sm text-gray-500">{category.value}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topCategories.map((category, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-gray-500">{category.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${category.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations by Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topLocations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="font-medium">{location.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{location.users} users</p>
                            <p className="text-sm text-gray-500">{location.value}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topLocations.map((location, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{location.name}</span>
                            <span className="text-sm text-gray-500">{location.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${location.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Activity className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
                      <p className="text-sm text-gray-600">Average Order Value</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <PieChart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">4.8</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-4">Growth Trends</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>User Registration</span>
                          <span className="text-green-600 font-medium">↗ +18.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Booking Volume</span>
                          <span className="text-green-600 font-medium">↗ +15.7%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Revenue Growth</span>
                          <span className="text-green-600 font-medium">↗ +23.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>User Retention</span>
                          <span className="text-green-600 font-medium">↗ +8.3%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Key Insights</h3>
                      <div className="space-y-3 text-sm">
                        <p className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <strong>Peak Hours:</strong> Most bookings occur between 2 PM - 6 PM
                        </p>
                        <p className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <strong>Popular Days:</strong> Weekends show 40% higher booking rates
                        </p>
                        <p className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <strong>Seasonal Trend:</strong> Q4 shows highest revenue growth
                        </p>
                        <p className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <strong>User Behavior:</strong> Mobile users convert 25% better
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminAnalyticsPage, 'admin')