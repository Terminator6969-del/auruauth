import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load rules from file
    try {
      const rulesPath = path.join(process.cwd(), 'rules', 'sa_orthopedics_rules.json')
      const rulesData = fs.readFileSync(rulesPath, 'utf8')
      const rules = JSON.parse(rulesData)
      return NextResponse.json(rules)
    } catch (error) {
      console.error('Error loading rules:', error)
      return NextResponse.json({ error: 'Failed to load rules' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in GET /api/admin/rules:', error)
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
    const { rules } = body

    if (!rules) {
      return NextResponse.json({ error: 'Rules data is required' }, { status: 400 })
    }

    // Validate JSON structure
    try {
      JSON.stringify(rules)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON structure' }, { status: 400 })
    }

    // Save rules to file
    try {
      const rulesPath = path.join(process.cwd(), 'rules', 'sa_orthopedics_rules.json')
      fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2))
      return NextResponse.json({ success: true, message: 'Rules saved successfully' })
    } catch (error) {
      console.error('Error saving rules:', error)
      return NextResponse.json({ error: 'Failed to save rules' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/admin/rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
