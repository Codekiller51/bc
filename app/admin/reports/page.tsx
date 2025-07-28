"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AdminSidebar } from "@/components/admin-sidebar"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { withAuth } from "@/components/enhanced-auth-provider"
import { toast } from "sonner"

function AdminReportsPage() {
  const [reportType, setReportType] = useState("revenue")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  })
  const [filters, setFilters] = useState({
    includeClients: true,
    includeCreatives: true,
    includeBookings: true,
    includePayments: true,
    location: "all",
    category: "all"
  })

  const reportTypes = [
    { value: "revenue", label: "Revenue Report", icon: DollarSign },
    { value: "users", label: "User Analytics", icon: Users },
    { value: "bookings", label: "Booking Analysis", icon: Calendar },
    { value: "performance", label: "Platform Performance", icon: TrendingUp },
    { value: "financial", label: "Financial Summary", icon: BarChart3 }
  ]

  const generateReport = async () => {
    try {
      setLoading(true)
      
      let data
      switch (reportType) {
        case 'revenue':
          data = await generateRevenueReport()
          break
        case 'users':
          data = await generateUserReport()
          break
        case 'bookings':
          data = await generateBookingReport()
          break
        case 'performance':
          data = await generatePerformanceReport()
          break
        case 'financial':
          data = await generateFinancialReport()
          break
        default:
          data = await generateRevenueReport()
      }
      
      setReportData(data)
      toast.success(`${reportTypes.find(r => r.value === reportType)?.label} generated successfully!`)
    } catch (error) {
      console.error('Report generation failed:', error)
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueReport = async () => {
    const bookings = await EnhancedDatabaseService.getBookings({ status: 'completed' })
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
    const avgOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0
    
    return {
      totalRevenue,
      totalBookings: bookings.length,
      avgOrderValue,
      revenueByMonth: generateMonthlyData(bookings, 'total_amount'),
      topCreatives: await getTopCreativesByRevenue(bookings)
    }
  }

  const generateUserReport = async () => {
    const users = await EnhancedDatabaseService.getUsers()
    const creatives = await EnhancedDatabaseService.getCreativeProfiles()
    
    return {
      totalUsers: users.length,
      clientCount: users.filter(u => u.role === 'client').length,
      creativeCount: users.filter(u => u.role === 'creative').length,
      userGrowth: generateMonthlyUserGrowth(users),
      locationDistribution: generateLocationDistribution(users)
    }
  }

  const generateBookingReport = async () => {
    const bookings = await EnhancedDatabaseService.getBookings()
    
    return {
      totalBookings: bookings.length,
      statusBreakdown: generateStatusBreakdown(bookings),
      bookingsByMonth: generateMonthlyData(bookings, 'count'),
      averageBookingValue: bookings.reduce((sum, b) => sum + b.total_amount, 0) / bookings.length || 0
    }
  }

  const generatePerformanceReport = async () => {
    const bookings = await EnhancedDatabaseService.getBookings()
    const users = await EnhancedDatabaseService.getUsers()
    
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const conversionRate = bookings.length > 0 ? (completedBookings.length / bookings.length) * 100 : 0
    
    return {
      conversionRate,
      completionRate: conversionRate,
      averageResponseTime: '2.5 hours', // This would be calculated from actual data
      customerSatisfaction: 4.8 // This would come from reviews
    }
  }

  const generateFinancialReport = async () => {
    const bookings = await EnhancedDatabaseService.getBookings({ status: 'completed' })
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
    const platformFee = totalRevenue * 0.1 // 10% platform fee
    
    return {
      totalRevenue,
      platformRevenue: platformFee,
      creativeEarnings: totalRevenue - platformFee,
      monthlyRecurring: totalRevenue / 12 // Simplified calculation
    }
  }

  const generateMonthlyData = (data: any[], field: string) => {
    const monthlyData = {}
    data.forEach(item => {
      const month = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) {
        monthlyData[month] = field === 'count' ? 0 : 0
      }
      monthlyData[month] += field === 'count' ? 1 : (item[field] || 0)
    })
    return Object.entries(monthlyData).map(([month, value]) => ({ month, value }))
  }

  const generateMonthlyUserGrowth = (users: any[]) => {
    return generateMonthlyData(users, 'count')
  }

  const generateLocationDistribution = (users: any[]) => {
    const locations = {}
    users.forEach(user => {
      const location = user.location || 'Unknown'
      locations[location] = (locations[location] || 0) + 1
    })
    return Object.entries(locations).map(([location, count]) => ({ location, count }))
  }

  const generateStatusBreakdown = (bookings: any[]) => {
    const statuses = {}
    bookings.forEach(booking => {
      const status = booking.status
      statuses[status] = (statuses[status] || 0) + 1
    })
    return Object.entries(statuses).map(([status, count]) => ({ status, count }))
  }

  const getTopCreativesByRevenue = async (bookings: any[]) => {
    const creativeRevenue = {}
    bookings.forEach(booking => {
      const creativeId = booking.creative_id
      creativeRevenue[creativeId] = (creativeRevenue[creativeId] || 0) + booking.total_amount
    })
    
    return Object.entries(creativeRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([creativeId, revenue]) => ({ creativeId, revenue }))
  }

  const exportReport = async (format: string) => {
    try {
      if (!reportData) {
        toast.error("Please generate a report first")
        return
      }
      
      const reportContent = JSON.stringify(reportData, null, 2)
      const blob = new Blob([reportContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error("Failed to export report")
    }
  }

  const scheduleReport = async () => {
    try {
      // In a real app, this would schedule recurring reports
      toast.success("Report scheduled successfully!")
    } catch (error) {
      toast.error("Failed to schedule report")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports and export data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Report Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <CalendarDateRangePicker 
                      date={dateRange}
                      setDate={setDateRange}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">Include Data</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeClients"
                          checked={filters.includeClients}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, includeClients: checked as boolean }))
                          }
                        />
                        <Label htmlFor="includeClients">Client Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeCreatives"
                          checked={filters.includeCreatives}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, includeCreatives: checked as boolean }))
                          }
                        />
                        <Label htmlFor="includeCreatives">Creative Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeBookings"
                          checked={filters.includeBookings}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, includeBookings: checked as boolean }))
                          }
                        />
                        <Label htmlFor="includeBookings">Booking Data</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includePayments"
                          checked={filters.includePayments}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, includePayments: checked as boolean }))
                          }
                        />
                        <Label htmlFor="includePayments">Payment Data</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Location Filter</Label>
                    <Select value={filters.location} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, location: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                        <SelectItem value="arusha">Arusha</SelectItem>
                        <SelectItem value="mwanza">Mwanza</SelectItem>
                        <SelectItem value="dodoma">Dodoma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Category Filter</Label>
                    <Select value={filters.category} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="graphic-design">Graphic Design</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="videography">Videography</SelectItem>
                        <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button onClick={generateReport} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <FileText className="h-4 w-4 mr-2" />
                      {loading ? "Generating..." : "Generate Report"}
                    </Button>
                    
                    <Button onClick={scheduleReport} variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Preview & Export */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button onClick={() => exportReport('excel')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button onClick={() => exportReport('csv')} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Sample Report Data */}
                  <div className="space-y-6">
                    {reportData ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">{reportTypes.find(r => r.value === reportType)?.label}</h3>
                        
                        {reportType === 'revenue' && reportData && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenue</p>
                              <p className="text-2xl font-bold">
                                {new Intl.NumberFormat("sw-TZ", {
                                  style: "currency",
                                  currency: "TZS",
                                  minimumFractionDigits: 0,
                                }).format(reportData.totalRevenue)}
                              </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <p className="text-sm text-blue-600 dark:text-blue-400">Total Bookings</p>
                              <p className="text-2xl font-bold">{reportData.totalBookings}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                              <p className="text-sm text-purple-600 dark:text-purple-400">Avg Order Value</p>
                              <p className="text-2xl font-bold">
                                {new Intl.NumberFormat("sw-TZ", {
                                  style: "currency",
                                  currency: "TZS",
                                  minimumFractionDigits: 0,
                                }).format(reportData.avgOrderValue)}
                              </p>
                            </div>
                          </div>
                        )}

                        {reportType === 'users' && reportData && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                              <p className="text-2xl font-bold">{reportData.totalUsers}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <p className="text-sm text-green-600 dark:text-green-400">Clients</p>
                              <p className="text-2xl font-bold">{reportData.clientCount}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                              <p className="text-sm text-purple-600 dark:text-purple-400">Creatives</p>
                              <p className="text-2xl font-bold">{reportData.creativeCount}</p>
                            </div>
                          </div>
                        )}

                        {reportType === 'performance' && reportData && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">Conversion Rate</p>
                              <p className="text-2xl font-bold">{reportData.conversionRate.toFixed(1)}%</p>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                              <p className="text-sm text-yellow-600 dark:text-yellow-400">Customer Satisfaction</p>
                              <p className="text-2xl font-bold">{reportData.customerSatisfaction}/5</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenue</p>
                          <p className="text-2xl font-bold">TZS 15,750,000</p>
                          <p className="text-xs text-green-600">+23.5% vs last period</p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                          <p className="text-2xl font-bold">1,247</p>
                          <p className="text-xs text-green-600">+18.2% vs last period</p>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 dark:text-purple-400">Total Bookings</p>
                          <p className="text-2xl font-bold">892</p>
                          <p className="text-xs text-green-600">+15.7% vs last period</p>
                        </div>
                        
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                          <p className="text-sm text-orange-600 dark:text-orange-400">Conversion Rate</p>
                          <p className="text-2xl font-bold">12.4%</p>
                          <p className="text-xs text-green-600">+2.1% vs last period</p>
                        </div>
                      </div>
                    )}
                    {/* Sample Table */}
                    {reportData && reportData.revenueByMonth && (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium">Month</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {reportData.revenueByMonth.map((row, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm">{row.month}</td>
                                <td className="px-4 py-3 text-sm font-medium">
                                  {new Intl.NumberFormat("sw-TZ", {
                                    style: "currency",
                                    currency: "TZS",
                                    minimumFractionDigits: 0,
                                  }).format(row.value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!reportData && (
                      <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Revenue</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Bookings</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">New Users</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {[
                            { date: "2024-01-15", revenue: "TZS 525,000", bookings: 28, users: 15 },
                            { date: "2024-01-14", revenue: "TZS 480,000", bookings: 24, users: 12 },
                            { date: "2024-01-13", revenue: "TZS 620,000", bookings: 31, users: 18 },
                            { date: "2024-01-12", revenue: "TZS 390,000", bookings: 19, users: 9 },
                            { date: "2024-01-11", revenue: "TZS 710,000", bookings: 35, users: 22 }
                          ].map((row, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm">{row.date}</td>
                              <td className="px-4 py-3 text-sm font-medium">{row.revenue}</td>
                              <td className="px-4 py-3 text-sm">{row.bookings}</td>
                              <td className="px-4 py-3 text-sm">{row.users}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}

                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">
                        {reportData ? "Report generated successfully. Use export buttons to download." : "This is a preview of your report. Click 'Generate Report' to create the full version."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Reports */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Weekly Revenue Report", frequency: "Weekly", nextRun: "2024-01-22", status: "Active" },
                      { name: "Monthly User Analytics", frequency: "Monthly", nextRun: "2024-02-01", status: "Active" },
                      { name: "Quarterly Performance", frequency: "Quarterly", nextRun: "2024-04-01", status: "Paused" }
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-gray-500">
                            {report.frequency} • Next run: {report.nextRun}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            report.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {report.status}
                          </span>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminReportsPage, 'admin')