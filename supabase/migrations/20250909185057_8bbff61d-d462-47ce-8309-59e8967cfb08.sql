-- Fix RLS policies for proper data visibility based on user roles

-- 1. First, create a helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'viewer') 
  FROM public.users 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- 2. Update Cases RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all cases" ON public.cases;
CREATE POLICY "Users can view cases based on role and ownership" 
ON public.cases 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  created_by = auth.uid() OR
  auth.uid() = ANY(assigned_to)
);

-- 3. Update Audit Logs RLS policies to allow admins to see all logs
DROP POLICY IF EXISTS "Select own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view audit logs based on role" 
ON public.audit_logs 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  user_id = auth.uid()
);

-- 4. Update Users table policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "Users can view users based on role" 
ON public.users 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR 
  user_id = auth.uid()
);

-- 5. Update Victims RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all victims" ON public.victims;
CREATE POLICY "Users can view victims based on case access" 
ON public.victims 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);

-- 6. Update Suspects RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all suspects" ON public.suspects;
CREATE POLICY "Users can view suspects based on case access" 
ON public.suspects 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);

-- 7. Update Evidence RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all evidence" ON public.evidence;
CREATE POLICY "Users can view evidence based on case access" 
ON public.evidence 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);

-- 8. Update Reports RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all reports" ON public.reports;
CREATE POLICY "Users can view reports based on case access" 
ON public.reports 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);

-- 9. Update Case Notes RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all case notes" ON public.case_notes;
CREATE POLICY "Users can view case notes based on case access" 
ON public.case_notes 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);

-- 10. Update Chain of Custody RLS policies
DROP POLICY IF EXISTS "Authenticated users can select all chain entries" ON public.chain_of_custody;
CREATE POLICY "Users can view chain of custody based on evidence access" 
ON public.chain_of_custody 
FOR SELECT 
USING (
  get_current_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM public.evidence e
    JOIN public.cases c ON c.id = e.case_id 
    WHERE e.id = evidence_id 
    AND (c.created_by = auth.uid() OR auth.uid() = ANY(c.assigned_to))
  )
);