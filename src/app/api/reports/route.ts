import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get report data from database
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('org_id', 'demo-org')

    if (requestsError) {
      console.error('Error fetching requests for reports:', requestsError)
      return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 })
    }

    // Calculate metrics
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const requestsThisWeek = requests?.filter(r => new Date(r.created_at) >= oneWeekAgo).length || 0
    const totalRequests = requests?.length || 0
    const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0
    
    // Mock calculations for demo
    const avgTurnaroundDays = 3.2
    const firstPassCleanRate = 78
    const totalMinutesSaved = totalRequests * 15 // Assume 15 minutes saved per request

    // Group by payer
    const requestsByPayer = requests?.reduce((acc: any, request) => {
      acc[request.payer] = (acc[request.payer] || 0) + 1
      return acc
    }, {}) || {}

    const payerData = Object.entries(requestsByPayer).map(([payer, count]) => ({
      payer,
      count: count as number
    }))

    // Group by procedure
    const requestsByProcedure = requests?.reduce((acc: any, request) => {
      acc[request.procedure_code] = (acc[request.procedure_code] || 0) + 1
      return acc
    }, {}) || {}

    const procedureData = Object.entries(requestsByProcedure).map(([procedure, count]) => ({
      procedure,
      count: count as number
    }))

    // Mock monthly trends
    const monthlyTrends = [
      { month: 'Jan 2024', requests: 12, minutes_saved: 180 },
      { month: 'Feb 2024', requests: 15, minutes_saved: 225 },
      { month: 'Mar 2024', requests: 18, minutes_saved: 270 },
      { month: 'Apr 2024', requests: 22, minutes_saved: 330 },
      { month: 'May 2024', requests: 19, minutes_saved: 285 },
      { month: 'Jun 2024', requests: 25, minutes_saved: 375 }
    ]

    const reportData = {
      requests_this_week: requestsThisWeek,
      avg_turnaround_days: avgTurnaroundDays,
      first_pass_clean_rate: firstPassCleanRate,
      total_requests: totalRequests,
      pending_requests: pendingRequests,
      total_minutes_saved: totalMinutesSaved,
      requests_by_payer: payerData,
      requests_by_procedure: procedureData,
      monthly_trends: monthlyTrends
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error in GET /api/reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
