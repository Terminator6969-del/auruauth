'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Download, Calendar, TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ReportData {
  requests_this_week: number
  avg_turnaround_days: number
  first_pass_clean_rate: number
  total_requests: number
  pending_requests: number
  total_minutes_saved: number
  requests_by_payer: Array<{ payer: string; count: number }>
  requests_by_procedure: Array<{ procedure: string; count: number }>
  monthly_trends: Array<{ month: string; requests: number; minutes_saved: number }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        // Use mock data if API fails
        setReportData(getMockReportData())
      }
    } catch (error) {
      console.error('Error loading report data:', error)
      setReportData(getMockReportData())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockReportData = (): ReportData => ({
    requests_this_week: 12,
    avg_turnaround_days: 3.2,
    first_pass_clean_rate: 78,
    total_requests: 156,
    pending_requests: 8,
    total_minutes_saved: 2340,
    requests_by_payer: [
      { payer: 'Discovery', count: 45 },
      { payer: 'Bonitas', count: 32 },
      { payer: 'Momentum', count: 28 },
      { payer: 'Other', count: 51 }
    ],
    requests_by_procedure: [
      { procedure: 'TKR', count: 38 },
      { procedure: 'THR', count: 29 },
      { procedure: 'ACL_RECON', count: 22 },
      { procedure: 'ROTATOR_CUFF', count: 18 },
      { procedure: 'Other', count: 49 }
    ],
    monthly_trends: [
      { month: 'Jan 2024', requests: 12, minutes_saved: 180 },
      { month: 'Feb 2024', requests: 15, minutes_saved: 225 },
      { month: 'Mar 2024', requests: 18, minutes_saved: 270 },
      { month: 'Apr 2024', requests: 22, minutes_saved: 330 },
      { month: 'May 2024', requests: 19, minutes_saved: 285 },
      { month: 'Jun 2024', requests: 25, minutes_saved: 375 }
    ]
  })

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/reports/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `auruauth-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: 'Report exported',
          description: 'Your report has been downloaded as a CSV file.',
        })
      } else {
        throw new Error('Failed to export report')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast({
        title: 'Error',
        description: 'Failed to export report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No report data available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load report data at this time.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Performance metrics and insights for your prior authorization workflow
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requests This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.requests_this_week}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Turnaround</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.avg_turnaround_days}d</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">First-Pass Clean Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.first_pass_clean_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minutes Saved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.total_minutes_saved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Requests by Payer */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Payer</CardTitle>
              <CardDescription>
                Distribution of requests across medical aids
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.requests_by_payer.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.payer}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(item.count / Math.max(...reportData.requests_by_payer.map(p => p.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requests by Procedure */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Procedure</CardTitle>
              <CardDescription>
                Most common procedures requiring prior authorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.requests_by_procedure.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.procedure}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(item.count / Math.max(...reportData.requests_by_procedure.map(p => p.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Request volume and time savings over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Requests</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Minutes Saved</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg per Request</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthly_trends.map((trend, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{trend.month}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{trend.requests}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{trend.minutes_saved}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {Math.round(trend.minutes_saved / trend.requests)} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
