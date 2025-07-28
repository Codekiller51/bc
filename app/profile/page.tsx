"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star, 
  Calendar,
  Edit,
  Settings,
  Award,
  Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"

function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'creative') {
        const profile = await EnhancedDatabaseService.getCreativeProfileById(user.id)
        if (profile) {
          setProfileData({
            ...profile,
            type: 'creative'
          })
        }
      } else if (user?.role === 'client') {
        // For clients, we'll use the user data directly since client profiles are simpler
        setProfileData({
          id: user.id,
          full_name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          company_name: user.company_name || '',
          industry: user.industry || '',
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          type: 'client'
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profileData) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load your profile information.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button 
              onClick={() => router.push('/profile/edit')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage 
                      src={profileData.avatar_url || "/placeholder.svg"} 
                      alt={profileData.full_name || profileData.title || user.name} 
                    />
                    <AvatarFallback className="text-2xl">
                      {(profileData.full_name || profileData.title || user.name).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold mb-1">
                    {profileData.full_name || profileData.title || user.name}
                  </h2>
                  
                  <div className="flex justify-center mb-3">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      {user.role === 'creative' ? 'Creative Professional' : 'Client'}
                    </Badge>
                  </div>

                  {user.role === 'creative' && profileData.category && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {profileData.category}
                    </p>
                  )}

                  {user.role === 'creative' && (
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{profileData.rating || 0}</span>
                      <span className="text-sm text-gray-500">
                        ({profileData.reviews_count || 0} reviews)
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.location && (
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              {user.role === 'creative' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Projects Completed</span>
                      <span className="font-medium">{profileData.completed_projects || 0}</span>
                    </div>
                    
                    {profileData.hourly_rate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("sw-TZ", {
                            style: "currency",
                            currency: "TZS",
                            minimumFractionDigits: 0,
                          }).format(profileData.hourly_rate)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                      <span className="font-medium">
                        {new Date(profileData.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={
                        profileData.approval_status === 'approved' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : profileData.approval_status === 'pending'
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }>
                        {profileData.approval_status || 'Active'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  
                  {user.role === 'creative' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/dashboard/creative')}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Creative Dashboard
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    {/* About Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {user.role === 'creative' && profileData.bio ? (
                          <p className="text-gray-600 dark:text-gray-300">{profileData.bio}</p>
                        ) : user.role === 'client' ? (
                          <div className="space-y-3">
                            {profileData.company_name && (
                              <div>
                                <span className="font-medium">Company: </span>
                                <span className="text-gray-600 dark:text-gray-300">{profileData.company_name}</span>
                              </div>
                            )}
                            {profileData.industry && (
                              <div>
                                <span className="font-medium">Industry: </span>
                                <span className="text-gray-600 dark:text-gray-300">{profileData.industry}</span>
                              </div>
                            )}
                            {!profileData.company_name && !profileData.industry && (
                              <p className="text-gray-500 dark:text-gray-400">
                                No additional information provided. 
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto ml-1"
                                  onClick={() => router.push('/profile/edit')}
                                >
                                  Add details
                                </Button>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            No bio provided. 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto ml-1"
                              onClick={() => router.push('/profile/edit')}
                            >
                              Add bio
                            </Button>
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Skills Section (Creative only) */}
                    {user.role === 'creative' && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profileData.skills && profileData.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.skills.map((skill: string, index: number) => (
                                <Badge 
                                  key={index}
                                  variant="outline"
                                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                              No skills added yet. 
                              <Button 
                                variant="link" 
                                className="p-0 h-auto ml-1"
                                onClick={() => router.push('/profile/edit')}
                              >
                                Add skills
                              </Button>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                        
                        {user.phone ? (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              No phone number provided
                            </span>
                          </div>
                        )}
                        
                        {user.location ? (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{user.location}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              No location provided
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="font-medium">Profile created</p>
                            <p className="text-sm text-gray-500">
                              {new Date(profileData.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            More activity will appear here as you use the platform
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => router.push('/profile/edit')}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => router.push('/dashboard/settings')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Account Settings
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => router.push('/dashboard/messages')}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => router.push('/dashboard/bookings')}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Bookings
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h3 className="font-medium">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Account Type:</span>
                            <span className="ml-2 font-medium capitalize">{user.role}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Member Since:</span>
                            <span className="ml-2 font-medium">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email Verified:</span>
                            <span className="ml-2 font-medium">
                              {user.verified ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {user.role === 'creative' && (
                            <div>
                              <span className="text-gray-500">Profile Status:</span>
                              <span className="ml-2 font-medium capitalize">
                                {profileData.approval_status || 'Active'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default withAuth(ProfilePage)