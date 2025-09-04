'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import { getConfidenceColor } from '@/lib/utils'

interface MissingInfo {
  field: string
  label: string
  confidence: 'high' | 'medium' | 'low'
  value?: string
  autoFillAvailable?: boolean
}

interface MissingRailProps {
  missingInfo: MissingInfo[]
  onFieldClick: (field: string) => void
  onAutoFill: (field: string) => void
  className?: string
}

export function MissingRail({ missingInfo, onFieldClick, onAutoFill, className }: MissingRailProps) {
  const highConfidence = missingInfo.filter(item => item.confidence === 'high')
  const mediumConfidence = missingInfo.filter(item => item.confidence === 'medium')
  const lowConfidence = missingInfo.filter(item => item.confidence === 'low')

  const getConfidenceIcon = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-600" />
      case 'low':
        return <AlertTriangle className="h-3 w-3 text-red-600" />
    }
  }

  const getConfidenceBadgeColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  const renderMissingGroup = (items: MissingInfo[], title: string, icon: React.ReactNode) => {
    if (items.length === 0) return null

    return (
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => onFieldClick(item.field)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  {item.value && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {item.value}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadgeColor(item.confidence)}`}>
                    {getConfidenceIcon(item.confidence)}
                    <span className="ml-1 capitalize">{item.confidence}</span>
                  </span>
                </div>
              </div>
              {item.autoFillAvailable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-1 h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAutoFill(item.field)
                  }}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Auto-fill from transcript
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={`sticky-rail ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Missing Info</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {missingInfo.length} field{missingInfo.length !== 1 ? 's' : ''} need attention
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {missingInfo.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All required information is complete
            </p>
          </div>
        ) : (
          <div>
            {renderMissingGroup(highConfidence, 'High Confidence', <CheckCircle className="h-4 w-4 text-green-600" />)}
            {renderMissingGroup(mediumConfidence, 'Medium Confidence', <Clock className="h-4 w-4 text-yellow-600" />)}
            {renderMissingGroup(lowConfidence, 'Low Confidence', <AlertTriangle className="h-4 w-4 text-red-600" />)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
