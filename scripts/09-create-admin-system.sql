-- Create admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions JSONB DEFAULT '{}',
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'user', 'job', 'payment', 'review', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_roles
-- Only super admins can see all admin roles
CREATE POLICY "admin_roles_super_admin_access" ON public.admin_roles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.role = 'super_admin' 
      AND ar.is_active = true
    )
  );

-- Users can see their own admin role
CREATE POLICY "admin_roles_self_read" ON public.admin_roles 
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for admin_activity_log
-- Only admins can see activity logs
CREATE POLICY "admin_activity_log_admin_access" ON public.admin_activity_log 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.role IN ('super_admin', 'admin') 
      AND ar.is_active = true
    )
  );

-- RLS Policies for system_settings
-- Only super admins can manage system settings
CREATE POLICY "system_settings_super_admin_access" ON public.system_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar 
      WHERE ar.user_id = auth.uid() 
      AND ar.role = 'super_admin' 
      AND ar.is_active = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON public.admin_roles(role);
CREATE INDEX IF NOT EXISTS idx_admin_roles_is_active ON public.admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON public.admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource_type ON public.admin_activity_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- Add updated_at triggers
CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON public.admin_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID, required_role VARCHAR(20) DEFAULT 'admin')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_role BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE admin_roles.user_id = is_admin.user_id 
    AND admin_roles.is_active = true
    AND (
      admin_roles.role = required_role OR
      (required_role = 'admin' AND admin_roles.role = 'super_admin') OR
      (required_role = 'moderator' AND admin_roles.role IN ('admin', 'super_admin'))
    )
  ) INTO has_role;
  
  RETURN has_role;
END;
$$;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  p_admin_id UUID,
  p_action VARCHAR(50),
  p_resource_type VARCHAR(50),
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_admin_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
  total_users INTEGER,
  total_handwerker INTEGER,
  total_customers INTEGER,
  total_jobs INTEGER,
  active_jobs INTEGER,
  completed_jobs INTEGER,
  total_payments DECIMAL(10,2),
  pending_payments INTEGER,
  total_reviews INTEGER,
  pending_disputes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.profiles) as total_users,
    (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE user_type = 'handwerker') as total_handwerker,
    (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE user_type = 'kunde') as total_customers,
    (SELECT COUNT(*)::INTEGER FROM public.jobs) as total_jobs,
    (SELECT COUNT(*)::INTEGER FROM public.jobs WHERE status IN ('open', 'in_progress')) as active_jobs,
    (SELECT COUNT(*)::INTEGER FROM public.jobs WHERE status = 'completed') as completed_jobs,
    (SELECT COALESCE(SUM(amount_cents::DECIMAL / 100), 0.00) FROM public.payments WHERE status = 'completed') as total_payments,
    (SELECT COUNT(*)::INTEGER FROM public.payments WHERE status IN ('pending', 'processing')) as pending_payments,
    (SELECT COUNT(*)::INTEGER FROM public.reviews WHERE is_public = true) as total_reviews,
    (SELECT COUNT(*)::INTEGER FROM public.payment_disputes WHERE status IN ('open', 'investigating')) as pending_disputes;
END;
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('platform_commission_rate', '0.05', 'Platform commission rate (5%)'),
  ('min_job_amount', '50.00', 'Minimum job amount in EUR'),
  ('max_job_amount', '10000.00', 'Maximum job amount in EUR'),
  ('auto_complete_days', '7', 'Days after which jobs are auto-completed'),
  ('review_moderation_enabled', 'true', 'Enable review moderation'),
  ('payment_escrow_enabled', 'true', 'Enable payment escrow for jobs')
ON CONFLICT (key) DO NOTHING;

-- Create a default super admin (you should change this in production)
-- This is just for demo purposes
INSERT INTO public.admin_roles (user_id, role, granted_by) 
SELECT id, 'super_admin', id 
FROM public.profiles 
WHERE email = 'admin@handwerk.de' 
ON CONFLICT (user_id, role) DO NOTHING;
