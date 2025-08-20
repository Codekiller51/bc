"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Camera, 
  Briefcase, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Plus,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/enhanced-auth-provider"
import { AvatarUploadService } from "@/lib/services/avatar-upload-service"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import { toast } from "sonner"

interface ProfileCompletionWizardProps {
  onComplete: () => void
  userType: 'client' | 'creative'
}

export function ProfileCompletionWizard({ onComplete, userType }: ProfileCompletionWizardProps) {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  const totalSteps = userType === 'creative' ? 4 : 3

  const [profileData, setProfileData] = useState({
    // Basic Info
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    avatar_url: user?.avatar_url || "",
    
    // Client specific
    company_name: "",
    industry: "",
    
    // Creative specific
    title: "",
    category: "",
    bio: "",
    hourly_rate: 50000,
    skills: [] as string[],
    
    // Portfolio
    portfolio_items: [] as Array<{
      title: string
      description: string
      category: string
      image_url?: string
    }>
  })

  const [newSkill, setNewSkill] = useState("")
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    category: ""
  })

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        avatar_url: user.avatar_url || ""
      }))
      
      if (!user.avatar_url) {
        const defaultAvatar = AvatarUploadService.getAvatarUrl(user.id)
        setAvatarPreview(defaultAvatar)
      } else {
        setAvatarPreview(user.avatar_url)
      }
    }
  }, [user])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = AvatarUploadService.validateFile(file)
      if (!validation.isValid) {
        toast.error(validation.error)
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
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

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.description.trim()) {
      setProfileData(prev => ({
        ...prev,
        portfolio_items: [...prev.portfolio_items, { ...newPortfolioItem }]
      }))
      setNewPortfolioItem({ title: "", description: "", category: "" })
    }
  }

  const removePortfolioItem = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      portfolio_items: prev.portfolio_items.filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    try {
      let avatarUrl = profileData.avatar_url

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const uploadResult = await AvatarUploadService.uploadAvatar(avatarFile, user.id)
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url
        }
      }

      // Update user profile
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        avatar_url: avatarUrl
      })

      if (userType === 'creative') {
        // Update creative profile
        const creativeProfile = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
        if (creativeProfile) {
          await UnifiedDatabaseService.updateCreativeProfile(creativeProfile.id, {
            title: profileData.title,
            category: profileData.category,
            bio: profileData.bio,
            hourly_rate: profileData.hourly_rate,
            skills: profileData.skills,
            avatar_url: avatarUrl
          })

          // Add portfolio items
          for (const item of profileData.portfolio_items) {
            await UnifiedDatabaseService.createPortfolioItem({
              creative_id: creativeProfile.id,
              title: item.title,
              description: item.description,
              category: item.category
            })
          }
        }
      } else {
        // Update client profile
        await UnifiedDatabaseService.updateClientProfile(user.id, {
          full_name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          company_name: profileData.company_name,
          industry: profileData.industry,
          avatar_url: avatarUrl
        })
      }

      toast.success('Profile completed successfully!')
      onComplete()
    } catch (error) {
      console.error('Failed to complete profile:', error)
      toast.error('Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Basic Information"
      case 2: return userType === 'creative' ? "Professional Details" : "Company Information"
      case 3: return userType === 'creative' ? "Skills & Expertise" : "Complete Profile"
      case 4: return "Portfolio & Showcase"
      default: return "Profile Setup"
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Complete Your Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let's set up your profile to get the most out of Brand Connect
            </p>
            
            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === 1 && <User className="h-5 w-5" />}
                {currentStep === 2 && <Briefcase className="h-5 w-5" />}
                {currentStep === 3 && <Star className="h-5 w-5" />}
                {currentStep === 4 && <Camera className="h-5 w-5" />}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Avatar Upload */}
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-24 w-24 mx-auto">
                          <AvatarImage src={avatarPreview} alt="Profile" />
                          <AvatarFallback className="text-2xl">
                            {profileData.name.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Click to upload your profile photo
                      </p>
                    </div>

                    {/* Basic Info Form */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+255 123 456 789"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select
                          value={profileData.location}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, location: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your location" />
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
                  </motion.div>
                )}

                {/* Step 2: Professional/Company Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {userType === 'creative' ? (
                      <>
                        <div>
                          <Label htmlFor="title">Professional Title *</Label>
                          <Input
                            id="title"
                            value={profileData.title}
                            onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Graphic Designer, Photographer"
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={profileData.category}
                            onValueChange={(value) => setProfileData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your category" />
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
                        </div>

                        <div>
                          <Label htmlFor="hourly_rate">Hourly Rate (TZS)</Label>
                          <Input
                            id="hourly_rate"
                            type="number"
                            min="0"
                            value={profileData.hourly_rate}
                            onChange={(e) => setProfileData(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                          />
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
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            value={profileData.company_name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, company_name: e.target.value }))}
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
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="hospitality">Hospitality</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Skills (Creative) or Complete (Client) */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {userType === 'creative' ? (
                      <>
                        <div>
                          <Label>Skills & Expertise</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              placeholder="Add a skill"
                              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            />
                            <Button onClick={addSkill} variant="outline">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {profileData.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                                onClick={() => removeSkill(skill)}
                              >
                                {skill}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Almost Done!</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your profile is ready to be completed. Click finish to start using Brand Connect.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Portfolio (Creative only) */}
                {currentStep === 4 && userType === 'creative' && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label>Portfolio Items (Optional)</Label>
                      <p className="text-sm text-gray-500 mb-4">
                        Add some of your best work to showcase your skills
                      </p>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            value={newPortfolioItem.title}
                            onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Project title"
                          />
                          <Select
                            value={newPortfolioItem.category}
                            onValueChange={(value) => setNewPortfolioItem(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Logo Design">Logo Design</SelectItem>
                              <SelectItem value="Web Design">Web Design</SelectItem>
                              <SelectItem value="Photography">Photography</SelectItem>
                              <SelectItem value="Branding">Branding</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea
                          value={newPortfolioItem.description}
                          onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Project description"
                          rows={3}
                        />
                        <Button onClick={addPortfolioItem} variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Portfolio Item
                        </Button>
                      </div>

                      {/* Portfolio Items List */}
                      {profileData.portfolio_items.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {profileData.portfolio_items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.category}</p>
                              </div>
                              <Button
                                onClick={() => removePortfolioItem(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? "Completing..." : "Complete Profile"}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}