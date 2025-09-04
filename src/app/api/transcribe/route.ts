import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const lang = formData.get('lang') as string || 'en'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (openaiApiKey) {
      // Use OpenAI Whisper for transcription
      try {
        const transcriptionFormData = new FormData()
        transcriptionFormData.append('file', file)
        transcriptionFormData.append('model', 'whisper-1')
        transcriptionFormData.append('language', lang)

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: transcriptionFormData,
        })

        if (!response.ok) {
          throw new Error('OpenAI API error')
        }

        const result = await response.json()
        return NextResponse.json({ transcript: result.text })
      } catch (error) {
        console.error('OpenAI transcription error:', error)
        // Fall back to mock transcription
      }
    }

    // Mock transcription for demo purposes
    const mockTranscripts = {
      'audio': `Patient: Good morning, Doctor. I've been having severe knee pain for the past 6 months. It's getting worse and I can barely walk without limping.

Doctor: I can see from your X-rays that you have severe osteoarthritis in your right knee. The joint space is significantly narrowed and there are bone spurs present. 

Patient: Yes, I've tried physiotherapy and pain medication, but nothing seems to help anymore. I can't even sleep properly because of the pain.

Doctor: Based on your symptoms and imaging, I believe you would benefit from a total knee replacement. You're 65 years old, which is an appropriate age for this procedure. The surgery would involve replacing the damaged joint surfaces with artificial components.

Patient: What does the recovery look like?

Doctor: You would typically stay in hospital for 3-5 days, then continue physiotherapy as an outpatient. Most patients are walking with assistance within a day or two, and can return to normal activities within 6-12 weeks.

Patient: That sounds like it would really help my quality of life.

Doctor: I'll submit a prior authorization request to your medical aid for the total knee replacement. We'll need to demonstrate that conservative treatments have been tried and that the procedure is medically necessary.`,

      'pdf': `CONSULTATION REPORT

Patient: John Smith
Date of Birth: 15/03/1958
Date of Consultation: 12/11/2024
Consulting Doctor: Dr. Sarah Johnson

CHIEF COMPLAINT:
Severe right knee pain and functional limitation

HISTORY OF PRESENT ILLNESS:
Mr. Smith is a 65-year-old male who presents with a 6-month history of progressive right knee pain. The pain is described as constant, sharp, and worse with weight-bearing activities. He reports significant functional limitation, including difficulty walking, climbing stairs, and sleeping due to pain.

PAST TREATMENT:
- 3 months of physiotherapy with minimal improvement
- NSAIDs (ibuprofen 400mg TID) with partial relief
- Intra-articular corticosteroid injection 2 months ago with temporary benefit
- Activity modification and weight loss attempts

PHYSICAL EXAMINATION:
- Right knee: Moderate effusion, crepitus, limited range of motion (flexion 90°, extension -5°)
- Positive McMurray test
- Significant antalgic gait
- No signs of infection or instability

IMAGING:
- X-ray right knee: Severe joint space narrowing, osteophytes, subchondral sclerosis
- MRI: Full-thickness cartilage loss, meniscal tears, bone marrow edema

ASSESSMENT:
Severe osteoarthritis of the right knee, Kellgren-Lawrence Grade 4

PLAN:
1. Total knee replacement (TKR) recommended
2. Prior authorization to be submitted to medical aid
3. Pre-operative assessment and optimization
4. Patient education regarding procedure and recovery`
    }

    // Determine file type and return appropriate mock transcript
    const fileType = file.type.startsWith('audio/') ? 'audio' : 'pdf'
    const transcript = mockTranscripts[fileType as keyof typeof mockTranscripts] || mockTranscripts.pdf

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Error in transcription:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
