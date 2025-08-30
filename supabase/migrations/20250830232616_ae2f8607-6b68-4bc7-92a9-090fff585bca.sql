-- Create comprehensive database schema for Case Investigation Manager

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'investigator', 'analyst', 'viewer');
CREATE TYPE public.case_status AS ENUM ('open', 'active', 'closed', 'archived');
CREATE TYPE public.case_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE public.evidence_type AS ENUM ('digital', 'physical');
CREATE TYPE public.evidence_status AS ENUM ('collected', 'processing', 'analyzed', 'archived');
CREATE TYPE public.custody_action AS ENUM ('collected', 'transferred', 'analyzed', 'returned', 'archived');
CREATE TYPE public.note_type AS ENUM ('note', 'update', 'finding', 'response');

-- Create users table (extended profile)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  role user_role DEFAULT 'viewer',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  badge_number TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status case_status DEFAULT 'open',
  priority case_priority DEFAULT 'medium',
  assigned_to UUID[] DEFAULT ARRAY[]::UUID[],
  created_by UUID NOT NULL REFERENCES public.users(user_id),
  case_password TEXT,
  location TEXT,
  category TEXT,
  estimated_close_date DATE,
  actual_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create victims table
CREATE TABLE public.victims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cnic_id TEXT,
  age INTEGER,
  gender gender_type DEFAULT 'unknown',
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suspects table
CREATE TABLE public.suspects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cnic_id TEXT,
  age INTEGER,
  gender gender_type DEFAULT 'unknown',
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  criminal_history TEXT,
  notes TEXT,
  is_arrested BOOLEAN DEFAULT false,
  arrest_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evidence table
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type evidence_type NOT NULL,
  category TEXT,
  description TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  file_path TEXT,
  hash TEXT,
  evidence_number TEXT,
  location TEXT,
  storage_location TEXT,
  collected_by UUID NOT NULL REFERENCES public.users(user_id),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status evidence_status DEFAULT 'collected',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chain of custody table
CREATE TABLE public.chain_of_custody (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  handled_by UUID NOT NULL REFERENCES public.users(user_id),
  handled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action custody_action NOT NULL,
  notes TEXT,
  location TEXT
);

-- Create case notes table
CREATE TABLE public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID NOT NULL REFERENCES public.users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type note_type DEFAULT 'note'
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  report_type TEXT,
  generated_by UUID NOT NULL REFERENCES public.users(user_id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT,
  is_final BOOLEAN DEFAULT false
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file uploads table
CREATE TABLE public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  upload_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(user_id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_entity TEXT NOT NULL,
  related_entity_id UUID NOT NULL
);