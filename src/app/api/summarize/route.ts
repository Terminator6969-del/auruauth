import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are a medical assistant specializing in orthopedic consultations. Please analyze the provided consultation transcript and create a SOAP note with the following structure:

SUBJECTIVE: Patient's reported symptoms, concerns, and history
OBJECTIVE: Clinical findings, examination results, and diagnostic tests
ASSESSMENT: Clinical diagnosis and reasoning
PLAN: Recommended treatment plan and next steps

Be concise but comprehensive. Focus on orthopedic-specific information.`
              },
              {
                role: 'user',
                content: `Please create a SOAP note from this consultation transcript:\n\n${transcript}`
              }
            ],
            temperature: 0.1,
            max_tokens: 1000,
          }),
        })

        if (!response.ok) {
          throw new Error('OpenAI API error')
        }

        const result = await response.json()
        const soapText = result.choices[0].message.content

        // Parse the SOAP note into structured format
        const soap = parseSOAPNote(soapText)
        return NextResponse.json({ soap })
      } catch (error) {
        console.error('OpenAI summarization error:', error)
        // Fall back to mock summarization
      }
    }

    // Mock SOAP note for demo purposes
    const mockSOAP = {
      subjective: `65-year-old male with 6-month history of progressive right knee pain. Pain is constant, sharp, and worse with weight-bearing activities. Patient reports significant functional limitation including difficulty walking, climbing stairs, and sleeping due to pain. Has tried 3 months of physiotherapy, NSAIDs, and intra-articular corticosteroid injection with minimal improvement.`,
      
      objective: `Physical examination reveals moderate effusion, crepitus, and limited range of motion (flexion 90°, extension -5°) in right knee. Positive McMurray test. Significant antalgic gait. X-ray shows severe joint space narrowing, osteophytes, and subchondral sclerosis. MRI demonstrates full-thickness cartilage loss, meniscal tears, and bone marrow edema.`,
      
      assessment: `Severe osteoarthritis of the right knee, Kellgren-Lawrence Grade 4. Conservative treatments have been exhausted with minimal benefit. Patient meets criteria for total knee replacement.`,
      
      plan: `1. Total knee replacement (TKR) recommended for right knee
2. Submit prior authorization to medical aid
3. Pre-operative assessment and optimization
4. Patient education regarding procedure and recovery
5. Continue pain management until surgery`
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({ soap: mockSOAP })
  } catch (error) {
    console.error('Error in summarization:', error)
    return NextResponse.json({ error: 'Summarization failed' }, { status: 500 })
  }
}

function parseSOAPNote(soapText: string) {
  const sections = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  }

  // Simple parsing logic - in production, you'd want more robust parsing
  const lines = soapText.split('\n')
  let currentSection = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.toLowerCase().startsWith('subjective:')) {
      currentSection = 'subjective'
      sections.subjective = trimmedLine.substring(11).trim()
    } else if (trimmedLine.toLowerCase().startsWith('objective:')) {
      currentSection = 'objective'
      sections.objective = trimmedLine.substring(10).trim()
    } else if (trimmedLine.toLowerCase().startsWith('assessment:')) {
      currentSection = 'assessment'
      sections.assessment = trimmedLine.substring(11).trim()
    } else if (trimmedLine.toLowerCase().startsWith('plan:')) {
      currentSection = 'plan'
      sections.plan = trimmedLine.substring(5).trim()
    } else if (currentSection && trimmedLine) {
      sections[currentSection as keyof typeof sections] += ' ' + trimmedLine
    }
  }

  return sections
}
