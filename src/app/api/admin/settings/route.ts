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

    // Get organization settings
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', 'demo-org') // For demo purposes
      .single()

    if (error) {
      console.error('Error fetching organization settings:', error)
      // Return default settings if not found
      return NextResponse.json({
        name: 'Demo Orthopedic Practice',
        retention_days: 180,
        baseline_minutes: 30
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, retention_days, logo_url, baseline_minutes } = body

    // Update organization settings
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        id: 'demo-org',
        name,
        retention_days,
        logo_url,
        baseline_minutes,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating organization settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
