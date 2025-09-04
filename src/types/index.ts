export interface Organization {
  id: string
  name: string
  retention_days: number
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  role: 'admin' | 'clinician' | 'staff'
  created_at: string
  updated_at: string
}

export interface Request {
  id: string
  org_id: string
  payer: string
  specialty: string
  procedure_code: string
  status: 'draft' | 'pending' | 'approved' | 'denied' | 'cancelled'
  patient_name?: string
  procedure_name?: string
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  request_id: string
  kind: 'transcript' | 'summary' | 'draft' | 'packet'
  content: string | object
  created_at: string
}

export interface Audit {
  id: string
  org_id: string
  request_id?: string
  user_id: string
  action: string
  old_status?: string
  new_status?: string
  ip?: string
  created_at: string
}

export interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface PriorAuthDraft {
  fields: Record<string, any>
  attachments: string[]
  missing: string[]
  draft: string
  confidence: Record<string, 'high' | 'medium' | 'low'>
}

export interface ChatMessage {
  id: string
  request_id: string
  scope: 'this_request' | 'all_requests'
  question: string
  answer: string
  citations: Array<{
    source: 'transcript' | 'summary' | 'draft'
    excerpt: string
  }>
  created_at: string
}

export interface PayerRule {
  payer: string
  procedures: Record<string, {
    code: string
    name: string
    requirements: string[]
    attachments: string[]
    criteria: Record<string, any>
  }>
}

export interface FileUpload {
  file: File
  id: string
  type: 'audio' | 'pdf'
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress?: number
  error?: string
}

export interface KPIStats {
  requests_this_week: number
  avg_turnaround_days: number
  first_pass_clean_rate: number
  total_requests: number
  pending_requests: number
}
