-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('customer_to_handwerker', 'handwerker_to_customer')),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, reviewer_id, reviewee_id) -- One review per job per reviewer-reviewee pair
);

-- Create review responses table (for replies to reviews)
CREATE TABLE IF NOT EXISTS public.review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, responder_id) -- One response per review per responder
);

-- Create review helpful votes table
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, voter_id) -- One vote per review per voter
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
-- Public reviews can be read by anyone
CREATE POLICY "reviews_public_read" ON public.reviews 
  FOR SELECT USING (is_public = true);

-- Users can read reviews they are involved in (even private ones)
CREATE POLICY "reviews_participant_read" ON public.reviews 
  FOR SELECT USING (
    auth.uid() = reviewer_id OR auth.uid() = reviewee_id
  );

-- Users can create reviews for jobs they participated in
CREATE POLICY "reviews_participant_insert" ON public.reviews 
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_id 
      AND (j.customer_id = auth.uid() OR j.assigned_handwerker_id = auth.uid())
    )
  );

-- Users can update their own reviews
CREATE POLICY "reviews_owner_update" ON public.reviews 
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "reviews_owner_delete" ON public.reviews 
  FOR DELETE USING (reviewer_id = auth.uid());

-- RLS Policies for review responses
-- Anyone can read responses to public reviews
CREATE POLICY "review_responses_public_read" ON public.review_responses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.id = review_id AND r.is_public = true
    )
  );

-- Users can read responses to reviews they are involved in
CREATE POLICY "review_responses_participant_read" ON public.review_responses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.id = review_id 
      AND (r.reviewer_id = auth.uid() OR r.reviewee_id = auth.uid())
    )
  );

-- Users can respond to reviews about them
CREATE POLICY "review_responses_reviewee_insert" ON public.review_responses 
  FOR INSERT WITH CHECK (
    auth.uid() = responder_id AND
    EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.id = review_id AND r.reviewee_id = auth.uid()
    )
  );

-- Users can update their own responses
CREATE POLICY "review_responses_owner_update" ON public.review_responses 
  FOR UPDATE USING (responder_id = auth.uid());

-- RLS Policies for review votes
-- Anyone can read votes on public reviews
CREATE POLICY "review_votes_public_read" ON public.review_votes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.id = review_id AND r.is_public = true
    )
  );

-- Users can vote on public reviews (but not their own)
CREATE POLICY "review_votes_public_insert" ON public.review_votes 
  FOR INSERT WITH CHECK (
    auth.uid() = voter_id AND
    EXISTS (
      SELECT 1 FROM public.reviews r 
      WHERE r.id = review_id 
      AND r.is_public = true 
      AND r.reviewer_id != auth.uid()
    )
  );

-- Users can update their own votes
CREATE POLICY "review_votes_owner_update" ON public.review_votes 
  FOR UPDATE USING (voter_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON public.reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON public.reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);

-- Add updated_at triggers
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON public.review_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate average rating for a user
CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_id UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT ROUND(AVG(rating::DECIMAL), 2) INTO avg_rating
  FROM public.reviews
  WHERE reviewee_id = user_id AND is_public = true;
  
  RETURN COALESCE(avg_rating, 0.00);
END;
$$;

-- Function to get review count for a user
CREATE OR REPLACE FUNCTION public.get_user_review_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  review_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO review_count
  FROM public.reviews
  WHERE reviewee_id = user_id AND is_public = true;
  
  RETURN COALESCE(review_count, 0);
END;
$$;

-- Function to get rating distribution for a user
CREATE OR REPLACE FUNCTION public.get_user_rating_distribution(user_id UUID)
RETURNS TABLE(rating INTEGER, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT r.rating, COUNT(*) as count
  FROM public.reviews r
  WHERE r.reviewee_id = user_id AND r.is_public = true
  GROUP BY r.rating
  ORDER BY r.rating DESC;
END;
$$;

-- Function to check if user can review a job
CREATE OR REPLACE FUNCTION public.can_user_review_job(
  p_job_id UUID,
  p_reviewer_id UUID,
  p_reviewee_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  can_review BOOLEAN := FALSE;
  job_status VARCHAR(20);
  job_customer_id UUID;
  job_handwerker_id UUID;
BEGIN
  -- Get job details
  SELECT status, customer_id, assigned_handwerker_id 
  INTO job_status, job_customer_id, job_handwerker_id
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- Check if job is completed
  IF job_status != 'completed' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if reviewer was involved in the job
  IF p_reviewer_id != job_customer_id AND p_reviewer_id != job_handwerker_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if reviewee was involved in the job
  IF p_reviewee_id != job_customer_id AND p_reviewee_id != job_handwerker_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if reviewer and reviewee are different
  IF p_reviewer_id = p_reviewee_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if review already exists
  IF EXISTS (
    SELECT 1 FROM public.reviews 
    WHERE job_id = p_job_id 
    AND reviewer_id = p_reviewer_id 
    AND reviewee_id = p_reviewee_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add review statistics to profiles view
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.company_name,
  p.user_type,
  p.trade_category,
  p.location_city,
  p.location_postal_code,
  COALESCE(public.get_user_average_rating(p.id), 0.00) as average_rating,
  COALESCE(public.get_user_review_count(p.id), 0) as review_count,
  COALESCE(job_stats.completed_jobs, 0) as completed_jobs,
  COALESCE(job_stats.total_jobs, 0) as total_jobs
FROM public.profiles p
LEFT JOIN (
  SELECT 
    CASE 
      WHEN user_type = 'kunde' THEN customer_id
      ELSE assigned_handwerker_id
    END as user_id,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(*) as total_jobs
  FROM public.jobs j
  JOIN public.profiles pr ON (pr.id = j.customer_id OR pr.id = j.assigned_handwerker_id)
  GROUP BY 
    CASE 
      WHEN pr.user_type = 'kunde' THEN j.customer_id
      ELSE j.assigned_handwerker_id
    END
) job_stats ON job_stats.user_id = p.id;
