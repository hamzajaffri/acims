-- Update RLS policies to allow all authenticated users to see all cases and related data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can select own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;

-- Create new policies for cases - allow all authenticated users to see all cases
CREATE POLICY "Authenticated users can select all cases" 
ON public.cases 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert cases" 
ON public.cases 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Case owners can update their cases" 
ON public.cases 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Case owners can delete their cases" 
ON public.cases 
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());

-- Update victims policies
DROP POLICY IF EXISTS "Select victims by case ownership" ON public.victims;
DROP POLICY IF EXISTS "Insert victims by case ownership" ON public.victims;
DROP POLICY IF EXISTS "Update victims by case ownership" ON public.victims;
DROP POLICY IF EXISTS "Delete victims by case ownership" ON public.victims;

CREATE POLICY "Authenticated users can select all victims" 
ON public.victims 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert victims" 
ON public.victims 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update victims" 
ON public.victims 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete victims" 
ON public.victims 
FOR DELETE 
TO authenticated
USING (true);

-- Update suspects policies
DROP POLICY IF EXISTS "Select suspects by case ownership" ON public.suspects;
DROP POLICY IF EXISTS "Insert suspects by case ownership" ON public.suspects;
DROP POLICY IF EXISTS "Update suspects by case ownership" ON public.suspects;
DROP POLICY IF EXISTS "Delete suspects by case ownership" ON public.suspects;

CREATE POLICY "Authenticated users can select all suspects" 
ON public.suspects 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert suspects" 
ON public.suspects 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update suspects" 
ON public.suspects 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete suspects" 
ON public.suspects 
FOR DELETE 
TO authenticated
USING (true);

-- Update evidence policies
DROP POLICY IF EXISTS "Select evidence by case ownership" ON public.evidence;
DROP POLICY IF EXISTS "Insert evidence by case ownership" ON public.evidence;
DROP POLICY IF EXISTS "Update evidence by case ownership" ON public.evidence;
DROP POLICY IF EXISTS "Delete evidence by case ownership" ON public.evidence;

CREATE POLICY "Authenticated users can select all evidence" 
ON public.evidence 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert evidence" 
ON public.evidence 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update evidence" 
ON public.evidence 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete evidence" 
ON public.evidence 
FOR DELETE 
TO authenticated
USING (true);

-- Update reports policies
DROP POLICY IF EXISTS "Select reports by case ownership" ON public.reports;
DROP POLICY IF EXISTS "Insert reports by case ownership" ON public.reports;
DROP POLICY IF EXISTS "Update reports by case ownership" ON public.reports;
DROP POLICY IF EXISTS "Delete reports by case ownership" ON public.reports;

CREATE POLICY "Authenticated users can select all reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert reports" 
ON public.reports 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports" 
ON public.reports 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reports" 
ON public.reports 
FOR DELETE 
TO authenticated
USING (true);

-- Update case_notes policies
DROP POLICY IF EXISTS "Select notes by case ownership" ON public.case_notes;
DROP POLICY IF EXISTS "Insert notes by case ownership" ON public.case_notes;
DROP POLICY IF EXISTS "Update notes by case ownership" ON public.case_notes;
DROP POLICY IF EXISTS "Delete notes by case ownership" ON public.case_notes;

CREATE POLICY "Authenticated users can select all case notes" 
ON public.case_notes 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert case notes" 
ON public.case_notes 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update case notes" 
ON public.case_notes 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete case notes" 
ON public.case_notes 
FOR DELETE 
TO authenticated
USING (true);

-- Update chain_of_custody policies
DROP POLICY IF EXISTS "Select chain entries by evidence ownership" ON public.chain_of_custody;
DROP POLICY IF EXISTS "Insert chain entries by evidence ownership" ON public.chain_of_custody;
DROP POLICY IF EXISTS "Update chain entries by evidence ownership" ON public.chain_of_custody;
DROP POLICY IF EXISTS "Delete chain entries by evidence ownership" ON public.chain_of_custody;

CREATE POLICY "Authenticated users can select all chain entries" 
ON public.chain_of_custody 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert chain entries" 
ON public.chain_of_custody 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update chain entries" 
ON public.chain_of_custody 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete chain entries" 
ON public.chain_of_custody 
FOR DELETE 
TO authenticated
USING (true);