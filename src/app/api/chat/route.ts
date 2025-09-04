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

    const body = await request.json()
    const { requestId, scope, question } = body

    if (!requestId || !question) {
      return NextResponse.json({ error: 'Request ID and question are required' }, { status: 400 })
    }

    // Get materials for this request
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (materialsError) {
      console.error('Error fetching materials:', materialsError)
      return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
    }

    // Prepare context from materials
    const context = prepareContext(materials || [])
    
    // Generate answer based on context
    const answer = generateAnswer(question, context)
    
    // Extract citations
    const citations = extractCitations(answer, materials || [])

    return NextResponse.json({
      answer,
      citations
    })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}

function prepareContext(materials: any[]) {
  const context: Record<string, string> = {}
  
  materials.forEach(material => {
    switch (material.kind) {
      case 'transcript':
        context.transcript = typeof material.content === 'string' 
          ? material.content 
          : JSON.stringify(material.content)
        break
      case 'summary':
        context.summary = typeof material.content === 'string' 
          ? material.content 
          : JSON.stringify(material.content)
        break
      case 'draft':
        context.draft = typeof material.content === 'string' 
          ? material.content 
          : JSON.stringify(material.content)
        break
    }
  })
  
  return context
}

function generateAnswer(question: string, context: Record<string, string>) {
  const lowerQuestion = question.toLowerCase()
  
  // Simple rule-based answers for demo purposes
  if (lowerQuestion.includes('pain') || lowerQuestion.includes('symptom')) {
    if (context.transcript) {
      return `Based on the consultation transcript, the patient reports ${extractPainInfo(context.transcript)}. The pain is described as constant and significantly affects daily activities including walking and sleeping.`
    }
  }
  
  if (lowerQuestion.includes('treatment') || lowerQuestion.includes('conservative')) {
    if (context.transcript) {
      return `The patient has tried several conservative treatments including ${extractTreatmentInfo(context.transcript)}. These treatments have provided minimal relief, indicating the need for surgical intervention.`
    }
  }
  
  if (lowerQuestion.includes('imaging') || lowerQuestion.includes('x-ray') || lowerQuestion.includes('mri')) {
    if (context.summary) {
      return `The imaging findings show ${extractImagingInfo(context.summary)}. These findings support the diagnosis and indicate the severity of the condition.`
    }
  }
  
  if (lowerQuestion.includes('procedure') || lowerQuestion.includes('surgery')) {
    if (context.draft) {
      return `The recommended procedure is ${extractProcedureInfo(context.draft)}. This procedure is medically necessary based on the patient's condition and failed conservative treatments.`
    }
  }
  
  // Default answer
  return `Based on the available information in this request, I can help answer your question about the patient's condition and treatment plan. Could you please be more specific about what information you're looking for?`
}

function extractPainInfo(transcript: string): string {
  const painMatches = transcript.match(/pain[^.]*\./gi)
  return painMatches ? painMatches[0] : 'severe pain affecting daily activities'
}

function extractTreatmentInfo(transcript: string): string {
  const treatments = []
  if (transcript.toLowerCase().includes('physiotherapy')) treatments.push('physiotherapy')
  if (transcript.toLowerCase().includes('nsaid') || transcript.toLowerCase().includes('medication')) treatments.push('NSAIDs')
  if (transcript.toLowerCase().includes('injection')) treatments.push('injections')
  return treatments.length > 0 ? treatments.join(', ') : 'conservative treatments'
}

function extractImagingInfo(summary: string): string {
  const imagingMatches = summary.match(/x-ray[^.]*\.|mri[^.]*\./gi)
  return imagingMatches ? imagingMatches[0] : 'significant joint space narrowing and osteophytes'
}

function extractProcedureInfo(draft: string): string {
  const procedureMatches = draft.match(/total [^.]*\.|replacement[^.]*\./gi)
  return procedureMatches ? procedureMatches[0] : 'joint replacement surgery'
}

function extractCitations(answer: string, materials: any[]) {
  const citations = []
  
  // Simple citation extraction based on content matching
  materials.forEach(material => {
    if (material.kind === 'transcript' && answer.toLowerCase().includes('transcript')) {
      citations.push({
        source: 'transcript',
        excerpt: material.content?.substring(0, 100) + '...' || 'No transcript available'
      })
    }
    if (material.kind === 'summary' && answer.toLowerCase().includes('summary')) {
      citations.push({
        source: 'summary',
        excerpt: material.content?.substring(0, 100) + '...' || 'No summary available'
      })
    }
    if (material.kind === 'draft' && answer.toLowerCase().includes('draft')) {
      citations.push({
        source: 'draft',
        excerpt: material.content?.substring(0, 100) + '...' || 'No draft available'
      })
    }
  })
  
  return citations
}
