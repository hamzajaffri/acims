-- Harden current_user_is_admin by setting search_path
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM public.users 
    WHERE user_id = auth.uid()
    LIMIT 1;
    RETURN COALESCE(user_role = 'admin', false);
END;
$$;