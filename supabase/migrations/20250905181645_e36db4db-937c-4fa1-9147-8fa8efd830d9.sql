-- Fix the infinite recursion in users table RLS policies
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Recreate policies without recursion
CREATE POLICY "Users can view own record or admins can view all"
ON public.users
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  public.is_admin_user()
);

CREATE POLICY "Admins can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
TO authenticated
USING (public.is_admin_user());