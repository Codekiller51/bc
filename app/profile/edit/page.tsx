"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Save, Upload, Eye, EyeOff, User, Mail, Phone, MapPin, Briefcase, Camera } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, withAuth } from "@/components/enhanced-auth-provider"
import { EnhancedDatabaseService } from "@/lib/services/enhanced-database-service"
import { validateEmail, validateTanzanianPhone } from "@/lib/utils/validation"

function ProfileEditPage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    title: "",
    category: "",
    hourlyRate: 0,
    skills: [] as string[],
    company: "",
    industry: "",
    avatar_url: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      if (!user) return

      if (user.role === 'creative') {
        const profile = await EnhancedDatabaseService.getCreativeProfileById(user.id)
        if (profile) {
          setProfileData({
            name: profile.title || "",
            email: user.email,
            phone: user.phone || "",
            location: user.location || "",
            bio: profile.bio || "",
            title: profile.title || "",
            category: profile.category || "",
            hourlyRate: profile.hourly_rate || 0,
            skills: profile.skills || [],
            company: "",
            industry: "",
            avatar_url: profile.avatar_url || ""
          })
        }
      } else {
        // Load client profile
        setProfileData({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          location: user.location || "",
          bio: "",
          title: "",
          category: "",
          hourlyRate: 0,
          skills: [],
          company: user.company_name || "",
          industry: user.industry || "",
          avatar_url: user.avatar_url || ""
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile data')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!validateEmail(profileData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (profileData.phone && !validateTanzanianPhone(profileData.phone)) {
      newErrors.phone = "Please enter a valid Tanzanian phone number"
    }

    if (user?.role === 'creative') {
      if (!profileData.title.trim()) {
        newErrors.title = "Professional title is required"
      }
      if (!profileData.category) {
        newErrors.category = "Category is required"
      }
      if (profileData.hourlyRate < 0) {
        newErrors.hourlyRate = "Hourly rate must be positive"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (passwordData.newPassword) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = "Current password is required"
      }
      if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters"
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const updates = {
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        avatar_url: profileData.avatar_url
      }

      if (user?.role === 'creative') {
        await EnhancedDatabaseService.updateCreativeProfile(user.id, {
          title: profileData.title,
          bio: profileData.bio,
          category: profileData.category,
          hourly_rate: profileData.hourlyRate,
          skills: profileData.skills,
          avatar_url: profileData.avatar_url
        })
      } else {
        await EnhancedDatabaseService.updateClientProfile(user.id, {
          full_name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          company_name: profileData.company,
          industry: profileData.industry,
          avatar_url: profileData.avatar_url
        })
      }

      await updateProfile(updates)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) return

    setLoading(true)
    try {
      await EnhancedDatabaseService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      toast.success('Password updated successfully!')
    } catch (error) {
      console.error('Failed to update password:', error)
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload to storage and get URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar_url: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and profile information
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} alt={profileData.name} />
                      <AvatarFallback className="text-2xl">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click the upload button to change your profile photo
                  </p>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+255 123 456 789"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select
                          value={profileData.location}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                            <SelectItem value="arusha">Arusha</SelectItem>
                            <SelectItem value="mwanza">Mwanza</SelectItem>
                            <SelectItem value="dodoma">Dodoma</SelectItem>
                            <SelectItem value="mbeya">Mbeya</SelectItem>
                            <SelectItem value="tanga">Tanga</SelectItem>
                            <SelectItem value="morogoro">Morogoro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {user.role === 'creative' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Professional Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Professional Title *</Label>
                              <Input
                                id="title"
                                value={profileData.title}
                                onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Graphic Designer"
                                className={errors.title ? "border-red-500" : ""}
                              />
                              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                              <Label htmlFor="category">Category *</Label>
                              <Select
                                value={profileData.category}
                                onValueChange={(value) => setProfileData(prev => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                                  <SelectItem value="Photography">Photography</SelectItem>
                                  <SelectItem value="Videography">Videography</SelectItem>
                                  <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                  <SelectItem value="Web Design">Web Design</SelectItem>
                                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="hourlyRate">Hourly Rate (TZS)</Label>
                            <Input
                              id="hourlyRate"
                              type="number"
                              min="0"
                              value={profileData.hourlyRate}
                              onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                              className={errors.hourlyRate ? "border-red-500" : ""}
                            />
                            {errors.hourlyRate && <p className="text-sm text-red-500 mt-1">{errors.hourlyRate}</p>}
                          </div>

                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={profileData.bio}
                              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Tell clients about yourself and your experience..."
                              rows={4}
                            />
                          </div>

                          <div>
                            <Label>Skills</Label>
                            <div className="flex gap-2 mb-2">
                              <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill"
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              />
                              <Button onClick={addSkill} variant="outline">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {profileData.skills.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeSkill(skill)}
                                >
                                  {skill} ×
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {user.role === 'client' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Business Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="company">Company Name</Label>
                              <Input
                                id="company"
                                value={profileData.company}
                                onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="Your company name"
                              />
                            </div>

                            <div>
                              <Label htmlFor="industry">Industry</Label>
                              <Select
                                value={profileData.industry}
                                onValueChange={(value) => setProfileData(prev => ({ ...prev, industry: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="technology">Technology</SelectItem>
                                  <SelectItem value="healthcare">Healthcare</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                  <SelectItem value="education">Education</SelectItem>
                                  <SelectItem value="retail">Retail</SelectItem>
                                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Keep your account secure by using a strong password and enabling two-factor authentication.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Change Password</h3>
                  
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={errors.currentPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.currentPassword && <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={errors.newPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.newPassword}
                    variant="outline"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Download Account Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive booking updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Communications</Label>
                        <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Contact Information</Label>
                        <p className="text-sm text-gray-500">Display your contact details on your profile</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default withAuth(ProfileEditPage)