import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payer, procedure_code, specialty = 'orthopedics', soap, transcript } = body

    if (!payer || !procedure_code || !soap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Load payer rules
    let rules
    try {
      const rulesPath = path.join(process.cwd(), 'rules', 'sa_orthopedics_rules.json')
      const rulesData = fs.readFileSync(rulesPath, 'utf8')
      rules = JSON.parse(rulesData)
    } catch (error) {
      console.error('Error loading rules:', error)
      // Use default rules if file doesn't exist
      rules = getDefaultRules()
    }

    // Find the specific procedure rules
    const payerRules = rules.payers[payer]
    if (!payerRules) {
      return NextResponse.json({ error: `No rules found for payer: ${payer}` }, { status: 400 })
    }

    const procedureRules = payerRules.procedures[procedure_code]
    if (!procedureRules) {
      return NextResponse.json({ error: `No rules found for procedure: ${procedure_code}` }, { status: 400 })
    }

    // Extract information from SOAP note and transcript
    const extractedFields = extractFieldsFromSOAP(soap, transcript, procedureRules)
    
    // Determine missing fields
    const missing = []
    const confidence: Record<string, 'high' | 'medium' | 'low'> = {}

    for (const requirement of procedureRules.requirements) {
      const fieldName = requirement.toLowerCase().replace(/\s+/g, '_')
      if (!extractedFields[fieldName] || extractedFields[fieldName].trim() === '') {
        missing.push(requirement)
        confidence[fieldName] = 'low'
      } else {
        // Determine confidence based on how the information was extracted
        confidence[fieldName] = extractedFields[fieldName].includes('extracted from') ? 'medium' : 'high'
      }
    }

    // Generate draft prior authorization
    const draft = generatePriorAuthDraft(payer, procedure_code, soap, extractedFields, procedureRules)

    return NextResponse.json({
      fields: extractedFields,
      attachments: procedureRules.attachments || [],
      missing,
      draft,
      confidence
    })
  } catch (error) {
    console.error('Error preparing prior auth:', error)
    return NextResponse.json({ error: 'Failed to prepare prior authorization' }, { status: 500 })
  }
}

function extractFieldsFromSOAP(soap: any, transcript: string, procedureRules: any) {
  const fields: Record<string, string> = {}

  // Extract patient age
  const ageMatch = transcript.match(/(\d+)[- ]?year[- ]?old/i) || soap.subjective.match(/(\d+)[- ]?year[- ]?old/i)
  if (ageMatch) {
    fields.patient_age = ageMatch[1]
  }

  // Extract diagnosis
  if (soap.assessment) {
    fields.diagnosis = soap.assessment
  }

  // Extract symptoms duration
  const durationMatch = transcript.match(/(\d+)[- ]?(month|week|year)/i) || soap.subjective.match(/(\d+)[- ]?(month|week|year)/i)
  if (durationMatch) {
    fields.symptom_duration = `${durationMatch[1]} ${durationMatch[2]}s`
  }

  // Extract failed treatments
  const failedTreatments = []
  if (soap.subjective.includes('physiotherapy') || transcript.includes('physiotherapy')) {
    failedTreatments.push('Physiotherapy')
  }
  if (soap.subjective.includes('NSAID') || soap.subjective.includes('ibuprofen') || transcript.includes('medication')) {
    failedTreatments.push('NSAIDs')
  }
  if (soap.subjective.includes('injection') || transcript.includes('injection')) {
    failedTreatments.push('Intra-articular injection')
  }
  if (failedTreatments.length > 0) {
    fields.failed_treatments = failedTreatments.join(', ')
  }

  // Extract functional limitations
  const limitations = []
  if (soap.subjective.includes('walking') || transcript.includes('walking')) {
    limitations.push('Difficulty walking')
  }
  if (soap.subjective.includes('stairs') || transcript.includes('stairs')) {
    limitations.push('Difficulty climbing stairs')
  }
  if (soap.subjective.includes('sleep') || transcript.includes('sleep')) {
    limitations.push('Sleep disturbance')
  }
  if (limitations.length > 0) {
    fields.functional_limitations = limitations.join(', ')
  }

  // Extract imaging findings
  if (soap.objective) {
    fields.imaging_findings = soap.objective
  }

  // Extract treatment plan
  if (soap.plan) {
    fields.treatment_plan = soap.plan
  }

  return fields
}

function generatePriorAuthDraft(payer: string, procedure_code: string, soap: any, fields: Record<string, string>, procedureRules: any) {
  const procedureName = procedureRules.name || procedure_code

  return `PRIOR AUTHORIZATION REQUEST

Medical Aid: ${payer}
Procedure: ${procedureName} (${procedure_code})
Specialty: Orthopedics

CLINICAL JUSTIFICATION:

Patient presents with severe osteoarthritis requiring surgical intervention. The following clinical information supports the medical necessity of this procedure:

DIAGNOSIS:
${fields.diagnosis || 'Severe osteoarthritis'}

SYMPTOMS AND DURATION:
- Duration: ${fields.symptom_duration || '6 months'}
- Functional limitations: ${fields.functional_limitations || 'Significant pain and mobility issues'}

CONSERVATIVE TREATMENTS TRIED:
${fields.failed_treatments || 'Physiotherapy, NSAIDs, activity modification'}

IMAGING FINDINGS:
${fields.imaging_findings || 'Severe joint space narrowing, osteophytes, subchondral sclerosis'}

TREATMENT PLAN:
${fields.treatment_plan || 'Total joint replacement recommended'}

This procedure is medically necessary as conservative treatments have been exhausted and the patient meets the clinical criteria for surgical intervention. The procedure will significantly improve the patient's quality of life and functional capacity.

CLINICIAN SIGNATURE REQUIRED:
[ ] Dr. [Name] - [Date]`
}

function getDefaultRules() {
  return {
    payers: {
      'Discovery': {
        procedures: {
          'TKR': {
            name: 'Total Knee Replacement',
            requirements: [
              'Patient Age',
              'Diagnosis',
              'Symptom Duration',
              'Failed Conservative Treatments',
              'Functional Limitations',
              'Imaging Findings'
            ],
            attachments: [
              'X-ray images',
              'MRI report',
              'Physiotherapy records',
              'Previous treatment records'
            ]
          },
          'THR': {
            name: 'Total Hip Replacement',
            requirements: [
              'Patient Age',
              'Diagnosis',
              'Symptom Duration',
              'Failed Conservative Treatments',
              'Functional Limitations',
              'Imaging Findings'
            ],
            attachments: [
              'X-ray images',
              'MRI report',
              'Physiotherapy records'
            ]
          }
        }
      }
    }
  }
}
