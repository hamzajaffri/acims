-- Create admin user with hamzajaffri.official@gmail.com
-- First create auth user, then the user record

-- Insert into auth.users (this is handled by a special function)
-- We'll create a user with email hamzajaffri.official@gmail.com
-- Password will be: Admin@2024!

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hamzajaffri.official@gmail.com',
  crypt('Admin@2024!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Hamza","last_name":"Jaffri"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Also ensure RLS policies allow admin user creation
-- Update users policies to allow admin user management
DROP POLICY IF EXISTS "Users can view own user row" ON public.users;
DROP POLICY IF EXISTS "Users can update own user row" ON public.users;

-- Create new policies for admin user management
CREATE POLICY "Users can view users" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can update users" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;