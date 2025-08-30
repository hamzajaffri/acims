-- Enable RLS and add secure policies across all tables

-- 1) Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_of_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- 2) Helper functions with secure search_path
CREATE OR REPLACE FUNCTION public.is_case_owner(_case_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = _case_id
      AND c.created_by = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_evidence_owner(_evidence_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.evidence e
    JOIN public.cases c ON c.id = e.case_id
    WHERE e.id = _evidence_id
      AND c.created_by = auth.uid()
  );
$$;

-- 3) Auto-provision public.users row on signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username, role)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_users ON auth.users;
CREATE TRIGGER on_auth_user_created_users
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user_to_users();

-- 4) Update updated_at automatically where present
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_victims_updated_at ON public.victims;
CREATE TRIGGER update_victims_updated_at
  BEFORE UPDATE ON public.victims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_suspects_updated_at ON public.suspects;
CREATE TRIGGER update_suspects_updated_at
  BEFORE UPDATE ON public.suspects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_evidence_updated_at ON public.evidence;
CREATE TRIGGER update_evidence_updated_at
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) POLICIES

-- users: self-access only
DROP POLICY IF EXISTS "Users can view own user row" ON public.users;
CREATE POLICY "Users can view own user row"
ON public.users FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user row" ON public.users;
CREATE POLICY "Users can update own user row"
ON public.users FOR UPDATE
USING (auth.uid() = user_id);

-- cases: owner-only access
DROP POLICY IF EXISTS "Users can select own cases" ON public.cases;
CREATE POLICY "Users can select own cases"
ON public.cases FOR SELECT
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;
CREATE POLICY "Users can insert own cases"
ON public.cases FOR INSERT
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
CREATE POLICY "Users can update own cases"
ON public.cases FOR UPDATE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;
CREATE POLICY "Users can delete own cases"
ON public.cases FOR DELETE
USING (created_by = auth.uid());

-- victims: access if owns parent case
DROP POLICY IF EXISTS "Select victims by case ownership" ON public.victims;
CREATE POLICY "Select victims by case ownership"
ON public.victims FOR SELECT
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Insert victims by case ownership" ON public.victims;
CREATE POLICY "Insert victims by case ownership"
ON public.victims FOR INSERT
WITH CHECK (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Update victims by case ownership" ON public.victims;
CREATE POLICY "Update victims by case ownership"
ON public.victims FOR UPDATE
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Delete victims by case ownership" ON public.victims;
CREATE POLICY "Delete victims by case ownership"
ON public.victims FOR DELETE
USING (public.is_case_owner(case_id));

-- suspects: same as victims
DROP POLICY IF EXISTS "Select suspects by case ownership" ON public.suspects;
CREATE POLICY "Select suspects by case ownership"
ON public.suspects FOR SELECT
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Insert suspects by case ownership" ON public.suspects;
CREATE POLICY "Insert suspects by case ownership"
ON public.suspects FOR INSERT
WITH CHECK (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Update suspects by case ownership" ON public.suspects;
CREATE POLICY "Update suspects by case ownership"
ON public.suspects FOR UPDATE
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Delete suspects by case ownership" ON public.suspects;
CREATE POLICY "Delete suspects by case ownership"
ON public.suspects FOR DELETE
USING (public.is_case_owner(case_id));

-- evidence: based on case ownership
DROP POLICY IF EXISTS "Select evidence by case ownership" ON public.evidence;
CREATE POLICY "Select evidence by case ownership"
ON public.evidence FOR SELECT
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Insert evidence by case ownership" ON public.evidence;
CREATE POLICY "Insert evidence by case ownership"
ON public.evidence FOR INSERT
WITH CHECK (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Update evidence by case ownership" ON public.evidence;
CREATE POLICY "Update evidence by case ownership"
ON public.evidence FOR UPDATE
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Delete evidence by case ownership" ON public.evidence;
CREATE POLICY "Delete evidence by case ownership"
ON public.evidence FOR DELETE
USING (public.is_case_owner(case_id));

-- chain_of_custody: based on evidence ownership
DROP POLICY IF EXISTS "Select chain entries by evidence ownership" ON public.chain_of_custody;
CREATE POLICY "Select chain entries by evidence ownership"
ON public.chain_of_custody FOR SELECT
USING (public.is_evidence_owner(evidence_id));

DROP POLICY IF EXISTS "Insert chain entries by evidence ownership" ON public.chain_of_custody;
CREATE POLICY "Insert chain entries by evidence ownership"
ON public.chain_of_custody FOR INSERT
WITH CHECK (public.is_evidence_owner(evidence_id));

DROP POLICY IF EXISTS "Update chain entries by evidence ownership" ON public.chain_of_custody;
CREATE POLICY "Update chain entries by evidence ownership"
ON public.chain_of_custody FOR UPDATE
USING (public.is_evidence_owner(evidence_id));

DROP POLICY IF EXISTS "Delete chain entries by evidence ownership" ON public.chain_of_custody;
CREATE POLICY "Delete chain entries by evidence ownership"
ON public.chain_of_custody FOR DELETE
USING (public.is_evidence_owner(evidence_id));

-- case_notes: based on case ownership
DROP POLICY IF EXISTS "Select notes by case ownership" ON public.case_notes;
CREATE POLICY "Select notes by case ownership"
ON public.case_notes FOR SELECT
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Insert notes by case ownership" ON public.case_notes;
CREATE POLICY "Insert notes by case ownership"
ON public.case_notes FOR INSERT
WITH CHECK (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Update notes by case ownership" ON public.case_notes;
CREATE POLICY "Update notes by case ownership"
ON public.case_notes FOR UPDATE
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Delete notes by case ownership" ON public.case_notes;
CREATE POLICY "Delete notes by case ownership"
ON public.case_notes FOR DELETE
USING (public.is_case_owner(case_id));

-- reports: based on case ownership
DROP POLICY IF EXISTS "Select reports by case ownership" ON public.reports;
CREATE POLICY "Select reports by case ownership"
ON public.reports FOR SELECT
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Insert reports by case ownership" ON public.reports;
CREATE POLICY "Insert reports by case ownership"
ON public.reports FOR INSERT
WITH CHECK (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Update reports by case ownership" ON public.reports;
CREATE POLICY "Update reports by case ownership"
ON public.reports FOR UPDATE
USING (public.is_case_owner(case_id));

DROP POLICY IF EXISTS "Delete reports by case ownership" ON public.reports;
CREATE POLICY "Delete reports by case ownership"
ON public.reports FOR DELETE
USING (public.is_case_owner(case_id));

-- audit_logs: self only
DROP POLICY IF EXISTS "Select own audit logs" ON public.audit_logs;
CREATE POLICY "Select own audit logs"
ON public.audit_logs FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Insert own audit logs" ON public.audit_logs;
CREATE POLICY "Insert own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

-- file_uploads: self only
DROP POLICY IF EXISTS "Select own uploads" ON public.file_uploads;
CREATE POLICY "Select own uploads"
ON public.file_uploads FOR SELECT
USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Insert own uploads" ON public.file_uploads;
CREATE POLICY "Insert own uploads"
ON public.file_uploads FOR INSERT
WITH CHECK (uploaded_by = auth.uid());