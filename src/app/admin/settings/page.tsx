'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Save, Upload, Building2, Clock, Image } from 'lucide-react'

interface OrganizationSettings {
  name: string
  retention_days: number
  logo_url?: string
  baseline_minutes: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: 'Demo Orthopedic Practice',
    retention_days: 180,
    baseline_minutes: 30
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: 'Settings saved',
          description: 'Organization settings have been updated successfully.',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // In a real application, you would upload the file to a storage service
    // For demo purposes, we'll just create a local URL
    const logoUrl = URL.createObjectURL(file)
    setSettings(prev => ({ ...prev, logo_url: logoUrl }))
    
    toast({
      title: 'Logo uploaded',
      description: 'Organization logo has been updated.',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure your organization's settings and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name
                </label>
                <Input
                  id="org-name"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Logo
                </label>
                <div className="flex items-center space-x-4">
                  {settings.logo_url && (
                    <div className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={settings.logo_url}
                        alt="Organization logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Logo</span>
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Data Retention</span>
              </CardTitle>
              <CardDescription>
                Configure how long to retain request data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="retention-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retention Period (Days)
                </label>
                <Input
                  id="retention-days"
                  type="number"
                  min="30"
                  max="2555" // 7 years
                  value={settings.retention_days}
                  onChange={(e) => setSettings(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 180 }))}
                  placeholder="180"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Requests and associated data will be automatically deleted after this period. Minimum 30 days, maximum 7 years.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
              <CardDescription>
                Baseline metrics for reporting and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="baseline-minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Baseline Processing Time (Minutes)
                </label>
                <Input
                  id="baseline-minutes"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.baseline_minutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseline_minutes: parseInt(e.target.value) || 30 }))}
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Average time to process a prior authorization request manually. Used for calculating time savings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                  ℹ️
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    POPIA Compliance
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    All data is encrypted at rest and in transit. Personal information is automatically redacted from logs and analytics. 
                    Data retention settings ensure compliance with POPIA requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
