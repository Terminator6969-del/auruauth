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

    // Get all requests for export
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('org_id', 'demo-org')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching requests for export:', requestsError)
      return NextResponse.json({ error: 'Failed to fetch data for export' }, { status: 500 })
    }

    // Generate CSV content
    const csvHeaders = [
      'Request ID',
      'Patient Name',
      'Procedure Code',
      'Procedure Name',
      'Payer',
      'Status',
      'Created Date',
      'Updated Date'
    ]

    const csvRows = requests?.map(request => [
      request.id,
      request.patient_name || '',
      request.procedure_code,
      request.procedure_name || '',
      request.payer,
      request.status,
      new Date(request.created_at).toLocaleDateString('en-ZA'),
      new Date(request.updated_at).toLocaleDateString('en-ZA')
    ]) || []

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="auruauth-requests-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/reports/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
