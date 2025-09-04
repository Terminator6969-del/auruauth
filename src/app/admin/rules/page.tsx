'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Save, RefreshCw, FileText } from 'lucide-react'

export default function RulesPage() {
  const [rules, setRules] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const response = await fetch('/api/admin/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      } else {
        // Load default rules if API fails
        setRules(getDefaultRules())
      }
    } catch (error) {
      console.error('Error loading rules:', error)
      setRules(getDefaultRules())
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rules }),
      })

      if (response.ok) {
        toast({
          title: 'Rules saved',
          description: 'Payer rules have been updated successfully.',
        })
      } else {
        throw new Error('Failed to save rules')
      }
    } catch (error) {
      console.error('Error saving rules:', error)
      toast({
        title: 'Error',
        description: 'Failed to save rules. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getDefaultRules = () => ({
    payers: {
      'Discovery': {
        procedures: {
          'TKR': {
            name: 'Total Knee Replacement',
            code: 'TKR',
            requirements: [
              'Patient Age (minimum 50 years)',
              'Diagnosis of severe osteoarthritis',
              'Symptom Duration (minimum 6 months)',
              'Failed Conservative Treatments',
              'Functional Limitations',
              'Imaging Findings (X-ray/MRI)',
              'Pain Score Documentation'
            ],
            attachments: [
              'X-ray images (AP and lateral views)',
              'MRI report (if available)',
              'Physiotherapy records',
              'Previous treatment records',
              'Pain assessment documentation'
            ]
          }
        }
      }
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payer Rules</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure prior authorization rules for different medical aids
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={loadRules}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        </div>

        {/* Rules Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Rules Configuration</span>
            </CardTitle>
            <CardDescription>
              Edit the JSON configuration for payer rules. Changes will affect all new prior authorization requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="rules-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rules JSON
                </label>
                <textarea
                  id="rules-editor"
                  value={JSON.stringify(rules, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setRules(parsed)
                    } catch (error) {
                      // Invalid JSON, but keep the text for editing
                    }
                  }}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  placeholder="Enter JSON rules configuration..."
                />
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Important Notes
                    </h4>
                    <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Ensure valid JSON syntax before saving</li>
                      <li>• Changes will affect all new prior authorization requests</li>
                      <li>• Test changes with a sample request before deploying</li>
                      <li>• Backup current rules before making major changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Rules Summary */}
        {rules && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Rules Summary</CardTitle>
              <CardDescription>
                Overview of configured payers and procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(rules.payers || {}).map(([payer, payerData]: [string, any]) => (
                  <div key={payer} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{payer}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(payerData.procedures || {}).map(([code, procedure]: [string, any]) => (
                        <div key={code} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{procedure.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Code: {code}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {procedure.requirements?.length || 0} requirements
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
