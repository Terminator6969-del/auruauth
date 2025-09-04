'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/file-upload'
import { MicRecorder } from '@/components/mic-recorder'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, FileText, Mic } from 'lucide-react'
import { FileUpload as FileUploadType } from '@/types'

export default function NewRequestPage() {
  const [files, setFiles] = useState<FileUploadType[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFilesChange = (newFiles: FileUploadType[]) => {
    setFiles(newFiles)
  }

  const handleRecordingComplete = (audioBlob: Blob) => {
    // The MicRecorder component already adds the file to the files list
    toast({
      title: 'Recording saved',
      description: 'Your audio recording has been added to the request.',
    })
  }

  const handleCreateDraft = async () => {
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please upload at least one file or record audio before creating a draft.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      // Create a new request in the database
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer: 'Discovery', // Default for demo
          specialty: 'orthopedics',
          procedure_code: 'TKR', // Default for demo
          status: 'draft',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create request')
      }

      const request = await response.json()

      // Upload files and create materials
      for (const fileUpload of files) {
        const formData = new FormData()
        formData.append('file', fileUpload.file)
        formData.append('requestId', request.id)
        formData.append('kind', 'transcript') // Will be updated after transcription

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }
      }

      toast({
        title: 'Request created',
        description: 'Your prior authorization request has been created successfully.',
      })

      // Redirect to the request detail page
      router.push(`/requests/${request.id}`)
    } catch (error) {
      console.error('Error creating request:', error)
      toast({
        title: 'Error',
        description: 'Failed to create request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Prior Authorization</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload consultation files or record audio to create a draft
            </p>
          </div>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Files</h2>
            </div>
            <FileUpload
              onFilesChange={handleFilesChange}
              files={files}
            />
          </div>

          {/* Audio Recording */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Mic className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Record Audio</h2>
            </div>
            <MicRecorder
              onRecordingComplete={handleRecordingComplete}
              onFilesChange={handleFilesChange}
              files={files}
            />
          </div>
        </div>

        {/* Files Summary */}
        {files.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
              <CardDescription>
                {files.length} file{files.length !== 1 ? 's' : ''} ready for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((fileUpload) => (
                  <div key={fileUpload.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {fileUpload.type === 'audio' ? '🎵' : '📄'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {fileUpload.file.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {fileUpload.type.toUpperCase()} • {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        fileUpload.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : fileUpload.status === 'uploading'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {fileUpload.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Draft Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCreateDraft}
            disabled={files.length === 0 || isCreating}
            size="lg"
            className="px-8"
          >
            {isCreating ? 'Creating Draft...' : 'Create Draft'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supported formats: PDF documents, MP3, M4A, WAV, and WebM audio files (max 50MB each)
          </p>
        </div>
      </div>
    </div>
  )
}
