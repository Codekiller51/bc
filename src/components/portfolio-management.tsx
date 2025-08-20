"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  ExternalLink,
  Image as ImageIcon,
  FileText,
  Save,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UnifiedDatabaseService } from "@/lib/services/unified-database-service"
import { AvatarUploadService } from "@/lib/services/avatar-upload-service"
import { useAuth } from "@/components/enhanced-auth-provider"
import { toast } from "sonner"

interface PortfolioItem {
  id: string
  creative_id: string
  title: string
  description?: string
  image_url?: string
  category?: string
  project_url?: string
  created_at: string
}

export function PortfolioManagement() {
  const { user } = useAuth()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    project_url: "",
    image_url: ""
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    loadPortfolioItems()
  }, [user])

  const loadPortfolioItems = async () => {
    if (!user) return

    try {
      setLoading(true)
      const profile = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
      if (profile?.portfolio_items) {
        setPortfolioItems(profile.portfolio_items)
      }
    } catch (error) {
      console.error('Failed to load portfolio items:', error)
      toast.error('Failed to load portfolio items')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = AvatarUploadService.validateFile(file)
      if (!validation.isValid) {
        toast.error(validation.error)
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      project_url: "",
      image_url: ""
    })
    setImageFile(null)
    setImagePreview("")
    setEditingItem(null)
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      project_url: item.project_url || "",
      image_url: item.image_url || ""
    })
    setImagePreview(item.image_url || "")
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!user) return

    try {
      setUploading(true)
      let imageUrl = formData.image_url

      // Upload new image if selected
      if (imageFile) {
        const profile = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
        if (profile) {
          const uploadResult = await AvatarUploadService.uploadPortfolioImage(imageFile, profile.id)
          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url
          }
        }
      }

      const portfolioData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        project_url: formData.project_url,
        image_url: imageUrl
      }

      if (editingItem) {
        // Update existing item
        await UnifiedDatabaseService.updatePortfolioItem(editingItem.id, portfolioData)
        toast.success('Portfolio item updated successfully!')
      } else {
        // Create new item
        const profile = await UnifiedDatabaseService.getCreativeProfileByUserId(user.id)
        if (profile) {
          await UnifiedDatabaseService.createPortfolioItem({
            creative_id: profile.id,
            ...portfolioData
          })
          toast.success('Portfolio item added successfully!')
        }
      }

      setShowAddDialog(false)
      resetForm()
      loadPortfolioItems()
    } catch (error) {
      console.error('Failed to save portfolio item:', error)
      toast.error('Failed to save portfolio item')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return
    }

    try {
      await UnifiedDatabaseService.deletePortfolioItem(itemId)
      toast.success('Portfolio item deleted successfully!')
      loadPortfolioItems()
    } catch (error) {
      console.error('Failed to delete portfolio item:', error)
      toast.error('Failed to delete portfolio item')
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Showcase your best work to attract potential clients
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm()
                setShowAddDialog(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label>Project Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-48 w-full rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setImagePreview("")
                          setImageFile(null)
                          setFormData(prev => ({ ...prev, image_url: "" }))
                        }}
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Upload an image of your work</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="portfolio-image"
                      />
                      <label htmlFor="portfolio-image">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Image
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Logo Design">Logo Design</SelectItem>
                      <SelectItem value="Web Design">Web Design</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Print Design">Print Design</SelectItem>
                      <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project, the client, and your approach..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="project_url">Project URL (Optional)</Label>
                <Input
                  id="project_url"
                  value={formData.project_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => {
                    setShowAddDialog(false)
                    resetForm()
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={uploading || !formData.title.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingItem ? 'Update' : 'Add'} Item
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Portfolio Items Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your portfolio by adding your best work samples
            </p>
            <Button
              onClick={() => {
                resetForm()
                setShowAddDialog(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {portfolioItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        size="sm"
                        variant="outline"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {item.project_url && (
                        <Button
                          onClick={() => window.open(item.project_url, '_blank')}
                          size="sm"
                          variant="outline"
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleDelete(item.id)}
                        size="sm"
                        variant="outline"
                        className="bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>Public</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tips */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Portfolio Tips:</strong> Include 3-6 of your best projects that showcase different skills. 
          High-quality images and detailed descriptions help clients understand your capabilities.
        </AlertDescription>
      </Alert>
    </div>
  )
}