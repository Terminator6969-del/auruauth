'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MissingRail } from '@/components/missing-rail'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Download, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import { Request, Material, SOAPNote, PriorAuthDraft } from '@/types'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const requestId = params.id as string

  const [request, setRequest] = useState<Request | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null)
  const [priorAuthDraft, setPriorAuthDraft] = useState<PriorAuthDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPacket, setIsGeneratingPacket] = useState(false)

  useEffect(() => {
    loadRequestData()
  }, [requestId])

  const loadRequestData = async () => {
    try {
      // Load request details
      const requestResponse = await fetch(`/api/requests/${requestId}`)
      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        setRequest(requestData)
      }

      // Load materials
      const materialsResponse = await fetch(`/api/requests/${requestId}/materials`)
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json()
        setMaterials(materialsData)

        // Extract SOAP note and draft from materials
        const summaryMaterial = materialsData.find((m: Material) => m.kind === 'summary')
        const draftMaterial = materialsData.find((m: Material) => m.kind === 'draft')

        if (summaryMaterial) {
          setSoapNote(summaryMaterial.content as SOAPNote)
        }

        if (draftMaterial) {
          setPriorAuthDraft(draftMaterial.content as PriorAuthDraft)
        }
      }
    } catch (error) {
      console.error('Error loading request data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load request data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePacket = async () => {
    setIsGeneratingPacket(true)
    try {
      const response = await fetch('/api/generate-packet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate packet')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prior-auth-${requestId}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Packet generated',
        description: 'Your prior authorization packet has been downloaded.',
      })
    } catch (error) {
      console.error('Error generating packet:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate packet',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingPacket(false)
    }
  }

  const handleFieldClick = (field: string) => {
    // Scroll to the field in the draft form
    const element = document.getElementById(field)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.focus()
    }
  }

  const handleAutoFill = async (field: string) => {
    // Implement auto-fill logic
    toast({
      title: 'Auto-fill',
      description: `Auto-filling ${field} from transcript...`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Request not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested prior authorization could not be found.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare missing info for the rail
  const missingInfo = priorAuthDraft ? Object.entries(priorAuthDraft.missing || {}).map(([field, label]) => ({
    field,
    label: typeof label === 'string' ? label : field,
    confidence: priorAuthDraft.confidence[field] || 'medium',
    autoFillAvailable: true
  })) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Prior Authorization Request
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {request.payer} • {request.procedure_code} • {request.status}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGeneratePacket}
              disabled={isGeneratingPacket}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPacket ? 'Generating...' : 'Generate DOCX'}
            </Button>
          </div>
        </div>

        {/* AI Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>AI-assisted draft</strong> — clinician review required
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="summary">Summary (SOAP)</TabsTrigger>
                <TabsTrigger value="draft">Prior-Auth Draft</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Transcript</CardTitle>
                    <CardDescription>
                      Original transcription of the consultation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {materials.find(m => m.kind === 'transcript') ? (
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          {materials.find(m => m.kind === 'transcript')?.content}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No transcript available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SOAP Summary</CardTitle>
                    <CardDescription>
                      Structured clinical summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {soapNote ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Subjective</h4>
                          <p className="text-gray-700 dark:text-gray-300">{soapNote.subjective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Objective</h4>
                          <p className="text-gray-700 dark:text-gray-300">{soapNote.objective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Assessment</h4>
                          <p className="text-gray-700 dark:text-gray-300">{soapNote.assessment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Plan</h4>
                          <p className="text-gray-700 dark:text-gray-300">{soapNote.plan}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No SOAP summary available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prior Authorization Draft</CardTitle>
                    <CardDescription>
                      AI-generated draft for review and completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {priorAuthDraft ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Clinical Justification</h4>
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              {priorAuthDraft.draft}
                            </pre>
                          </div>
                        </div>
                        
                        {priorAuthDraft.attachments && priorAuthDraft.attachments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required Attachments</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                              {priorAuthDraft.attachments.map((attachment, index) => (
                                <li key={index}>{attachment}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No draft available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Rail */}
          <div className="lg:col-span-1">
            <MissingRail
              missingInfo={missingInfo}
              onFieldClick={handleFieldClick}
              onAutoFill={handleAutoFill}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
