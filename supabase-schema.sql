-- Auruauth Database Schema
-- South African Orthopedics Prior Authorization Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    retention_days INTEGER DEFAULT 180,
    logo_url TEXT,
    baseline_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'clinician', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payer VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) DEFAULT 'orthopedics',
    procedure_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'denied', 'cancelled')),
    patient_name VARCHAR(255),
    procedure_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table (transcripts, summaries, drafts, packets)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('transcript', 'summary', 'draft', 'packet')),
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audits table for compliance tracking
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    scope VARCHAR(50) DEFAULT 'this_request' CHECK (scope IN ('this_request', 'all_requests')),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    citations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_requests_org_id ON requests(org_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_materials_request_id ON materials(request_id);
CREATE INDEX idx_materials_kind ON materials(kind);
CREATE INDEX idx_audits_org_id ON audits(org_id);
CREATE INDEX idx_audits_request_id ON audits(request_id);
CREATE INDEX idx_audits_created_at ON audits(created_at);
CREATE INDEX idx_chat_messages_request_id ON chat_messages(request_id);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified for demo - in production, implement proper user-based policies)
CREATE POLICY "Allow all operations for demo" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON requests FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON materials FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON audits FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON chat_messages FOR ALL USING (true);

-- Insert demo organization
INSERT INTO organizations (id, name, retention_days, baseline_minutes) 
VALUES ('demo-org', 'Demo Orthopedic Practice', 180, 30);

-- Insert demo user
INSERT INTO users (id, org_id, email, role) 
VALUES ('demo-user', 'demo-org', 'demo@auruauth.com', 'admin');

-- Insert some demo requests
INSERT INTO requests (id, org_id, payer, procedure_code, status, patient_name, procedure_name) VALUES
('req-001', 'demo-org', 'Discovery', 'TKR', 'draft', 'John Smith', 'Total Knee Replacement'),
('req-002', 'demo-org', 'Bonitas', 'THR', 'pending', 'Sarah Johnson', 'Total Hip Replacement'),
('req-003', 'demo-org', 'Momentum', 'ACL_RECON', 'approved', 'Michael Brown', 'ACL Reconstruction');

-- Insert demo materials
INSERT INTO materials (request_id, kind, content) VALUES
('req-001', 'transcript', '{"text": "Patient: Good morning, Doctor. I have been having severe knee pain for the past 6 months..."}'),
('req-001', 'summary', '{"subjective": "65-year-old male with 6-month history of progressive right knee pain...", "objective": "Physical examination reveals moderate effusion...", "assessment": "Severe osteoarthritis of the right knee...", "plan": "Total knee replacement recommended..."}'),
('req-002', 'transcript', '{"text": "Patient: Hello Doctor, I have been having terrible hip pain for over a year now..."}'),
('req-003', 'transcript', '{"text": "Patient: Hi Doctor, I injured my knee playing soccer 3 months ago..."}');

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
