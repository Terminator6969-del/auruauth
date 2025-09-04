import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestId = params.id

    // Get materials for this request
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching materials:', error)
      return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/requests/[id]/materials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
