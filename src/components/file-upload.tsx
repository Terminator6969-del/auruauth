'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import { FileUpload as FileUploadType } from '@/types'

interface FileUploadProps {
  onFilesChange: (files: FileUploadType[]) => void
  files: FileUploadType[]
  maxSize?: number
  acceptedTypes?: string[]
}

export function FileUpload({ 
  onFilesChange, 
  files, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['.pdf', '.mp3', '.m4a', '.wav', '.webm']
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    
    const newFiles: FileUploadType[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('audio/') ? 'audio' : 'pdf',
      status: 'pending'
    }))

    // Simulate upload process
    for (const fileUpload of newFiles) {
      fileUpload.status = 'uploading'
      onFilesChange([...files, ...newFiles])
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      fileUpload.status = 'completed'
      onFilesChange([...files, ...newFiles])
    }
    
    setIsUploading(false)
  }, [files, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/mpeg': ['.mp3'],
      'audio/mp4': ['.m4a'],
      'audio/wav': ['.wav'],
      'audio/webm': ['.webm']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id))
  }

  const getFileIcon = (type: string) => {
    return type === 'audio' ? '🎵' : '📄'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your files here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Accepted formats: {acceptedTypes.join(', ')} (max {formatFileSize(maxSize)})
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Uploaded Files</h4>
          {files.map((fileUpload) => (
            <Card key={fileUpload.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(fileUpload.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {fileUpload.file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(fileUpload.file.size)} • {fileUpload.type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fileUpload.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileUpload.id)}
                      disabled={fileUpload.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {fileUpload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
