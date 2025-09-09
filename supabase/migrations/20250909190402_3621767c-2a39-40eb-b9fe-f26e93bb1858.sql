-- Allow admins to delete cases as well as owners
DROP POLICY IF EXISTS "Case owners can delete their cases" ON public.cases;
CREATE POLICY "Admins and owners can delete cases"
ON public.cases
FOR DELETE
USING (
  get_current_user_role() = 'admin' OR created_by = auth.uid()
);
