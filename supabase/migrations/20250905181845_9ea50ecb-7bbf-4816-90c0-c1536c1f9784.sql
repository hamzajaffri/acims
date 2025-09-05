-- First, temporarily disable RLS to clear all policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users; 
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can view own record or admins can view all" ON public.users;

-- Create a simple, non-recursive function to check if current user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the role directly without using RLS
    SELECT role INTO user_role
    FROM public.users 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "users_select_policy"
ON public.users
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR current_user_is_admin()
);

CREATE POLICY "users_insert_policy" 
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (current_user_is_admin());

CREATE POLICY "users_update_policy"
ON public.users
FOR UPDATE  
TO authenticated
USING (current_user_is_admin());