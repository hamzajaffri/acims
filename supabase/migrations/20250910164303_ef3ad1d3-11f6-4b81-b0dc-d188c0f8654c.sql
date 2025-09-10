-- Create system settings table for admin configurations
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage system settings
CREATE POLICY "Admins can view all system settings"
ON public.system_settings
FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (get_current_user_role() = 'admin' AND updated_by = auth.uid());

CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin' AND updated_by = auth.uid());

CREATE POLICY "Admins can delete system settings"
ON public.system_settings
FOR DELETE
USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, category, description) VALUES
('org_name', '"Case Investigation Manager"', 'general', 'Organization name'),
('admin_email', '""', 'general', 'Administrator email address'),
('notifications', 'false', 'general', 'Enable email notifications'),
('dark_mode', 'false', 'ui', 'Enable dark mode'),
('auto_backup', 'false', 'data', 'Enable automatic backup'),
('backup_frequency', '"daily"', 'data', 'Backup frequency'),
('data_retention', '"1year"', 'data', 'Data retention period'),
('two_factor', 'false', 'security', 'Require two-factor authentication'),
('session_timeout', 'false', 'security', 'Enable automatic session timeout'),
('maintenance_mode', 'false', 'security', 'Enable maintenance mode'),
('password_policy', '"medium"', 'security', 'Password policy strength'),
('email_notifications', 'true', 'notifications', 'Enable email notifications'),
('system_alerts', 'true', 'notifications', 'Enable system alerts'),
('case_updates', 'false', 'notifications', 'Enable case update notifications'),
('notification_frequency', '"immediate"', 'notifications', 'Notification frequency'),
('smtp_server', '""', 'email', 'SMTP server address'),
('smtp_port', '"587"', 'email', 'SMTP port'),
('smtp_username', '""', 'email', 'SMTP username'),
('smtp_ssl', 'true', 'email', 'Enable SSL/TLS for email');