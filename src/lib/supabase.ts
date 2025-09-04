import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          retention_days: number
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          retention_days?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          retention_days?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          org_id: string
          email: string
          role: 'admin' | 'clinician' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role?: 'admin' | 'clinician' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: 'admin' | 'clinician' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          org_id: string
          payer: string
          specialty: string
          procedure_code: string
          status: 'draft' | 'pending' | 'approved' | 'denied' | 'cancelled'
          patient_name: string | null
          procedure_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          payer: string
          specialty: string
          procedure_code: string
          status?: 'draft' | 'pending' | 'approved' | 'denied' | 'cancelled'
          patient_name?: string | null
          procedure_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          payer?: string
          specialty?: string
          procedure_code?: string
          status?: 'draft' | 'pending' | 'approved' | 'denied' | 'cancelled'
          patient_name?: string | null
          procedure_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          request_id: string
          kind: 'transcript' | 'summary' | 'draft' | 'packet'
          content: any
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          kind: 'transcript' | 'summary' | 'draft' | 'packet'
          content: any
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          kind?: 'transcript' | 'summary' | 'draft' | 'packet'
          content?: any
          created_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          org_id: string
          request_id: string | null
          user_id: string
          action: string
          old_status: string | null
          new_status: string | null
          ip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          request_id?: string | null
          user_id: string
          action: string
          old_status?: string | null
          new_status?: string | null
          ip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          request_id?: string | null
          user_id?: string
          action?: string
          old_status?: string | null
          new_status?: string | null
          ip?: string | null
          created_at?: string
        }
      }
    }
  }
}
