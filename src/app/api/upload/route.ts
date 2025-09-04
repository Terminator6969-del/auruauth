import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const requestId = formData.get('requestId') as string
    const kind = formData.get('kind') as string

    if (!file || !requestId || !kind) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create material record
    const { data, error } = await supabase
      .from('materials')
      .insert({
        request_id: requestId,
        kind: kind as 'transcript' | 'summary' | 'draft' | 'packet',
        content: {
          filename: file.name,
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating material:', error)
      return NextResponse.json({ error: 'Failed to create material record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      materialId: data.id,
      message: 'File uploaded successfully' 
    })
  } catch (error) {
    console.error('Error in file upload:', error)
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
  }
}
