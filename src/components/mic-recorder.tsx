'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Play, Pause } from 'lucide-react'
import { FileUpload as FileUploadType } from '@/types'

interface MicRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onFilesChange: (files: FileUploadType[]) => void
  files: FileUploadType[]
}

export function MicRecorder({ onRecordingComplete, onFilesChange, files }: MicRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        onRecordingComplete(audioBlob)
        
        // Add to files list
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
        const newFile: FileUploadType = {
          file: audioFile,
          id: Math.random().toString(36).substr(2, 9),
          type: 'audio',
          status: 'completed'
        }
        onFilesChange([...files, newFile])
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      startTimer()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      stopTimer()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        startTimer()
      } else {
        mediaRecorderRef.current.pause()
        stopTimer()
      }
      setIsPaused(!isPaused)
    }
  }

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
    }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setRecordingTime(0)
    setAudioBlob(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Record Audio
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click the microphone to start recording your consultation
            </p>
          </div>

          <div className="flex justify-center">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600"
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}

            {isRecording && (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <Square className="h-8 w-8" />
                </Button>
              </div>
            )}

            {audioBlob && !isRecording && (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={isPlaying ? stopPlayback : playRecording}
                  variant="outline"
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="lg"
                >
                  Record Again
                </Button>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-red-500 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isPaused ? 'Paused' : 'Recording...'}
                </span>
              </div>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="text-center">
              <div className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
                Recording Complete
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Duration: {formatTime(recordingTime)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
