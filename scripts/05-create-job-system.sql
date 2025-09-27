-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- matches handwerker trade categories
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_postal_code TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
  preferred_start_date DATE,
  estimated_duration_days INTEGER,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  requirements TEXT, -- Special requirements or notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  handwerker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_price DECIMAL(10,2),
  estimated_start_date DATE,
  estimated_duration_days INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, handwerker_id) -- One application per handwerker per job
);

-- Create job views table for tracking who viewed what
CREATE TABLE IF NOT EXISTS public.job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, viewer_id, DATE(viewed_at)) -- One view per user per job per day
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
-- Customers can manage their own jobs
CREATE POLICY "jobs_customer_full_access" ON public.jobs 
  FOR ALL USING (auth.uid() = customer_id);

-- Handwerkers can view open jobs
CREATE POLICY "jobs_handwerker_view_open" ON public.jobs 
  FOR SELECT USING (status = 'open');

-- RLS Policies for job applications
-- Handwerkers can manage their own applications
CREATE POLICY "job_applications_handwerker_own" ON public.job_applications 
  FOR ALL USING (auth.uid() = handwerker_id);

-- Customers can view applications for their jobs
CREATE POLICY "job_applications_customer_view" ON public.job_applications 
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM public.jobs WHERE id = job_id
    )
  );

-- Customers can update application status for their jobs
CREATE POLICY "job_applications_customer_update_status" ON public.job_applications 
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT customer_id FROM public.jobs WHERE id = job_id
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT customer_id FROM public.jobs WHERE id = job_id
    )
  );

-- RLS Policies for job views
CREATE POLICY "job_views_own" ON public.job_views 
  FOR ALL USING (auth.uid() = viewer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location_city ON public.jobs(location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_budget ON public.jobs(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_handwerker_id ON public.job_applications(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- Add updated_at triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically expire old jobs
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.jobs 
  SET status = 'cancelled', updated_at = NOW()
  WHERE status = 'open' 
    AND expires_at < NOW();
END;
$$;

-- Create function to get job statistics
CREATE OR REPLACE FUNCTION public.get_job_stats(user_id UUID)
RETURNS TABLE (
  total_jobs BIGINT,
  open_jobs BIGINT,
  completed_jobs BIGINT,
  total_applications BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is customer or handwerker
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_type = 'kunde') THEN
    -- Customer stats
    RETURN QUERY
    SELECT 
      COUNT(*) as total_jobs,
      COUNT(*) FILTER (WHERE status = 'open') as open_jobs,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
      COALESCE((
        SELECT COUNT(*) 
        FROM public.job_applications ja 
        JOIN public.jobs j ON ja.job_id = j.id 
        WHERE j.customer_id = user_id
      ), 0) as total_applications
    FROM public.jobs 
    WHERE customer_id = user_id;
  ELSE
    -- Handwerker stats
    RETURN QUERY
    SELECT 
      0::BIGINT as total_jobs,
      (SELECT COUNT(*) FROM public.jobs WHERE status = 'open')::BIGINT as open_jobs,
      0::BIGINT as completed_jobs,
      COALESCE((
        SELECT COUNT(*) 
        FROM public.job_applications 
        WHERE handwerker_id = user_id
      ), 0) as total_applications;
  END IF;
END;
$$;
