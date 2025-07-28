"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
} from "lucide-react"

import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import { withAuth } from "@/components/enhanced-auth-provider"
import type { User, CreativeProfile } from "@/lib/database/types"

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [creativeProfiles, setCreativeProfiles] = useState<CreativeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadUsers()
    loadCreativeProfiles()
  }, [roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const filters = roleFilter !== "all" ? { role: roleFilter } : undefined
      const data = await UnifiedDatabaseService.getUsers(filters)
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCreativeProfiles = async () => {
    try {
      const data = await UnifiedDatabaseService.getCreativeProfiles()
      setCreativeProfiles(data)
    } catch (error) {
      console.error("Failed to load creative profiles:", error)
    }
  }

  const handleApproveCreative = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await UnifiedDatabaseService.updateCreativeProfile(profileId, {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      
      // Refresh data
      loadCreativeProfiles()
      toast.success('Creative professional approved successfully!')
      
      // Send approval notification
      // await EnhancedNotificationService.sendApprovalNotification(profileId, 'approved')
    } catch (error) {
      console.error("Failed to approve creative:", error)
      toast.error('Failed to approve creative professional')
    }
  }

  const handleRejectCreative = async (profileId: string) => {
    try {
      await UnifiedDatabaseService.updateCreativeProfile(profileId, {
        approval_status: 'rejected'
      })
      
      // Refresh data
      loadCreativeProfiles()
      toast.success('Creative professional rejected')
      
      // Send rejection notification
      // await EnhancedNotificationService.sendApprovalNotification(profileId, 'rejected')
    } catch (error) {
      console.error("Failed to reject creative:", error)
      toast.error('Failed to reject creative professional')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: UserCheck },
      approved: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      client: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      creative: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      admin: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    }

    return (
      <Badge className={roleConfig[role as keyof typeof roleConfig] || roleConfig.client}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const pendingCreatives = creativeProfiles.filter(p => p.approval_status === 'pending')
  const approvedCreatives = creativeProfiles.filter(p => p.approval_status === 'approved')
  const rejectedCreatives = creativeProfiles.filter(p => p.approval_status === 'rejected')

  const stats = {
    totalUsers: users.length,
    clients: users.filter(u => u.role === 'client').length,
    creatives: users.filter(u => u.role === 'creative').length,
    pendingApprovals: pendingCreatives.length,
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage users and approve creative professionals</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clients</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.creatives}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creatives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals Section */}
          {pendingCreatives.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Creative Approvals ({pendingCreatives.length})
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review and approve creative professionals to make them visible to clients
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCreatives.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={profile.user?.avatar_url || "/placeholder.svg"} alt={profile.user?.name} />
                          <AvatarFallback>{profile.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{profile.title || 'Creative Professional'}</h3>
                          <p className="text-sm text-gray-500">{profile.category}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>Applied: {new Date(profile.created_at).toLocaleDateString()}</span>
                            {profile.bio && <span>• Bio: {profile.bio.substring(0, 50)}...</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // In a real app, this would open a detailed view modal
                            toast.info(`Viewing profile for ${profile.title}`)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveCreative(profile.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectCreative(profile.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                    <SelectItem value="creative">Creatives</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          {[...Array(6)].map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const creativeProfile = creativeProfiles.find(p => p.user_id === user.id)
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Phone className="h-3 w-3" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                              {user.role === 'creative' && creativeProfile ? 
                                getStatusBadge(creativeProfile.approval_status) :
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  Active
                                </Badge>
                              }
                            </TableCell>
                            <TableCell>{user.location || 'Not specified'}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  {user.role === 'creative' && creativeProfile?.approval_status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleApproveCreative(creativeProfile.id)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRejectCreative(creativeProfile.id)}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {user.role === 'creative' && creativeProfile?.approval_status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => handleApproveCreative(creativeProfile.id)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Re-approve
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-red-600">
                                    <UserX className="h-4 w-4 mr-2" />
                                    Suspend User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">No users found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminUsersPage, 'admin')