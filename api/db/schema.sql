-- Seed script for appresuelve-onboarding DB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255),
  email VARCHAR(255),
  invite_token VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invite_sent_at TIMESTAMP
);

-- Client forms (JSONB flexible data)
CREATE TABLE IF NOT EXISTS client_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  form_type VARCHAR(50) DEFAULT 'onboarding',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, form_type)
);

-- Client documents
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  document_type VARCHAR(100), -- 'logo', 'catalog', 'photos', 'files', etc.
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255),
  file_url VARCHAR(1024),
  file_size INTEGER,
  storage_provider VARCHAR(50) DEFAULT 'local',
  public_id VARCHAR(255),
  resource_type VARCHAR(20) DEFAULT 'auto',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for invite token lookup
CREATE INDEX IF NOT EXISTS idx_clients_invite_token ON clients(invite_token);
CREATE INDEX IF NOT EXISTS idx_client_forms_client_id ON client_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
