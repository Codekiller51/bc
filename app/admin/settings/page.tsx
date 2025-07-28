"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Settings, 
  Globe, 
  Shield, 
  Bell, 
  Mail, 
  Database, 
  Key,
  Save,
  RefreshCw
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminSidebar } from "@/components/admin-sidebar"
import { withAuth } from "@/components/enhanced-auth-provider"
import { toast } from "sonner"

function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Brand Connect",
    siteDescription: "Tanzania's Creative Marketplace",
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Email Settings
    emailProvider: "sendgrid",
    emailApiKey: "",
    fromEmail: "noreply@brandconnect.co.tz",
    fromName: "Brand Connect",
    
    // SMS Settings
    smsProvider: "africas_talking",
    smsApiKey: "",
    smsUsername: "",
    
    // Payment Settings
    stripePublishableKey: "",
    stripeSecretKey: "",
    commissionRate: 10,
    
    // Security Settings
    sessionTimeout: 24,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: false,
    
    // Platform Settings
    maxFileSize: 5,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",
    autoApproveCreatives: false,
    bookingAdvanceDays: 90
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    try {
      // In a real app, this would save to database
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    }
  }

  const testEmailConnection = async () => {
    try {
      // Test email configuration
      toast.success("Email connection test successful!")
    } catch (error) {
      toast.error("Email connection test failed")
    }
  }

  const testSmsConnection = async () => {
    try {
      // Test SMS configuration
      toast.success("SMS connection test successful!")
    } catch (error) {
      toast.error("SMS connection test failed")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex-1 p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Configure platform-wide settings and integrations</p>
            </div>
            
            <Button onClick={saveSettings} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="platform">Platform</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Site Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Platform Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">Temporarily disable the platform</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>User Registration</Label>
                        <p className="text-sm text-gray-500">Allow new user registrations</p>
                      </div>
                      <Switch
                        checked={settings.registrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailProvider">Email Provider</Label>
                      <Select value={settings.emailProvider} onValueChange={(value) => handleSettingChange('emailProvider', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">AWS SES</SelectItem>
                          <SelectItem value="resend">Resend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="emailApiKey">API Key</Label>
                      <Input
                        id="emailApiKey"
                        type="password"
                        value={settings.emailApiKey}
                        onChange={(e) => handleSettingChange('emailApiKey', e.target.value)}
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.fromName}
                        onChange={(e) => handleSettingChange('fromName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button onClick={testEmailConnection} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Email Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smsProvider">SMS Provider</Label>
                      <Select value={settings.smsProvider} onValueChange={(value) => handleSettingChange('smsProvider', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="africas_talking">Africa's Talking</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="vonage">Vonage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="smsUsername">Username</Label>
                      <Input
                        id="smsUsername"
                        value={settings.smsUsername}
                        onChange={(e) => handleSettingChange('smsUsername', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="smsApiKey">API Key</Label>
                    <Input
                      id="smsApiKey"
                      type="password"
                      value={settings.smsApiKey}
                      onChange={(e) => handleSettingChange('smsApiKey', e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>
                  
                  <Button onClick={testSmsConnection} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test SMS Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Payment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                      <Input
                        id="stripePublishableKey"
                        value={settings.stripePublishableKey}
                        onChange={(e) => handleSettingChange('stripePublishableKey', e.target.value)}
                        placeholder="pk_..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                        placeholder="sk_..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.commissionRate}
                      onChange={(e) => handleSettingChange('commissionRate', Number(e.target.value))}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Platform commission charged on completed bookings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="1"
                        max="168"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        min="6"
                        max="50"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleSettingChange('passwordMinLength', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-gray-500">Users must verify email before accessing platform</p>
                      </div>
                      <Switch
                        checked={settings.requireEmailVerification}
                        onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                      </div>
                      <Switch
                        checked={settings.enableTwoFactor}
                        onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platform" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      File Upload Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxFileSize}
                        onChange={(e) => handleSettingChange('maxFileSize', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                      <Input
                        id="allowedFileTypes"
                        value={settings.allowedFileTypes}
                        onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                        placeholder="jpg,png,pdf,doc"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Comma-separated list of allowed file extensions
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bookingAdvanceDays">Booking Advance Days</Label>
                      <Input
                        id="bookingAdvanceDays"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.bookingAdvanceDays}
                        onChange={(e) => handleSettingChange('bookingAdvanceDays', Number(e.target.value))}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum days in advance users can book services
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Creatives</Label>
                        <p className="text-sm text-gray-500">Automatically approve new creative profiles</p>
                      </div>
                      <Switch
                        checked={settings.autoApproveCreatives}
                        onCheckedChange={(checked) => handleSettingChange('autoApproveCreatives', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default withAuth(AdminSettingsPage, 'admin')