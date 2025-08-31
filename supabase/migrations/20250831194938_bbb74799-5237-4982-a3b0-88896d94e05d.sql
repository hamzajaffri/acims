-- Insert the admin user record manually after creating the auth user
-- First get the user ID from auth.users for hamzajaffri.official@gmail.com

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID for the admin email
    SELECT id INTO admin_user_id
    FROM auth.users 
    WHERE email = 'hamzajaffri.official@gmail.com'
    LIMIT 1;
    
    -- If found, insert into users table
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.users (
            user_id, 
            email, 
            first_name, 
            last_name, 
            role, 
            is_active
        ) VALUES (
            admin_user_id,
            'hamzajaffri.official@gmail.com',
            'Hamza',
            'Jaffri',
            'admin',
            true
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            is_active = true;
            
        -- Log the admin creation
        INSERT INTO public.audit_logs (
            user_id,
            action,
            entity,
            entity_id,
            details
        ) VALUES (
            admin_user_id,
            'CREATE',
            'admin',
            admin_user_id,
            '{"system_generated": true, "role": "admin", "initial_setup": true}'::jsonb
        );
    END IF;
END $$;