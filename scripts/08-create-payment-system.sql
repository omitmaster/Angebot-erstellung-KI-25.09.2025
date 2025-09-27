-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer')),
  provider VARCHAR(50) NOT NULL, -- stripe, paypal, etc.
  provider_payment_method_id VARCHAR(255) NOT NULL,
  last_four VARCHAR(4),
  brand VARCHAR(50), -- visa, mastercard, etc.
  expires_month INTEGER,
  expires_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('job_payment', 'deposit', 'refund')),
  provider VARCHAR(50) NOT NULL,
  provider_payment_id VARCHAR(255),
  provider_payment_intent_id VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment disputes table
CREATE TABLE IF NOT EXISTS public.payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  disputer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('not_received', 'defective_work', 'overcharged', 'unauthorized', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment escrow table (for holding payments until job completion)
CREATE TABLE IF NOT EXISTS public.payment_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  release_date TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, payment_id)
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_escrow ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
-- Users can only see their own payment methods
CREATE POLICY "payment_methods_owner_access" ON public.payment_methods 
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for payments
-- Users can see payments they are involved in
CREATE POLICY "payments_participant_access" ON public.payments 
  FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Users can create payments as payer
CREATE POLICY "payments_payer_insert" ON public.payments 
  FOR INSERT WITH CHECK (payer_id = auth.uid());

-- Users can update payments they created (limited fields)
CREATE POLICY "payments_payer_update" ON public.payments 
  FOR UPDATE USING (payer_id = auth.uid());

-- RLS Policies for payment_disputes
-- Users can see disputes they created or are involved in the payment
CREATE POLICY "payment_disputes_participant_access" ON public.payment_disputes 
  FOR SELECT USING (
    disputer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_id 
      AND (p.payer_id = auth.uid() OR p.payee_id = auth.uid())
    )
  );

-- Users can create disputes for payments they are involved in
CREATE POLICY "payment_disputes_participant_insert" ON public.payment_disputes 
  FOR INSERT WITH CHECK (
    disputer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_id 
      AND (p.payer_id = auth.uid() OR p.payee_id = auth.uid())
    )
  );

-- RLS Policies for payment_escrow
-- Users can see escrow for payments they are involved in
CREATE POLICY "payment_escrow_participant_access" ON public.payment_escrow 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p 
      WHERE p.id = payment_id 
      AND (p.payer_id = auth.uid() OR p.payee_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON public.payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_payment_id ON public.payment_disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON public.payment_disputes(status);
CREATE INDEX IF NOT EXISTS idx_payment_escrow_job_id ON public.payment_escrow(job_id);
CREATE INDEX IF NOT EXISTS idx_payment_escrow_status ON public.payment_escrow(status);

-- Add updated_at triggers
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_disputes_updated_at BEFORE UPDATE ON public.payment_disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_escrow_updated_at BEFORE UPDATE ON public.payment_escrow FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate total earnings for a user
CREATE OR REPLACE FUNCTION public.get_user_total_earnings(user_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_earnings DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(amount_cents::DECIMAL / 100), 0.00) INTO total_earnings
  FROM public.payments
  WHERE payee_id = user_id 
  AND status = 'completed';
  
  RETURN total_earnings;
END;
$$;

-- Function to calculate total spent by a user
CREATE OR REPLACE FUNCTION public.get_user_total_spent(user_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_spent DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(amount_cents::DECIMAL / 100), 0.00) INTO total_spent
  FROM public.payments
  WHERE payer_id = user_id 
  AND status = 'completed';
  
  RETURN total_spent;
END;
$$;

-- Function to get payment statistics for a user
CREATE OR REPLACE FUNCTION public.get_user_payment_stats(user_id UUID)
RETURNS TABLE(
  total_earned DECIMAL(10,2),
  total_spent DECIMAL(10,2),
  pending_payments INTEGER,
  completed_payments INTEGER,
  disputed_payments INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(public.get_user_total_earnings(user_id), 0.00) as total_earned,
    COALESCE(public.get_user_total_spent(user_id), 0.00) as total_spent,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM public.payments p 
      WHERE (p.payer_id = user_id OR p.payee_id = user_id) 
      AND p.status IN ('pending', 'processing')
    ), 0) as pending_payments,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM public.payments p 
      WHERE (p.payer_id = user_id OR p.payee_id = user_id) 
      AND p.status = 'completed'
    ), 0) as completed_payments,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM public.payment_disputes pd
      JOIN public.payments p ON p.id = pd.payment_id
      WHERE (p.payer_id = user_id OR p.payee_id = user_id)
      AND pd.status IN ('open', 'investigating')
    ), 0) as disputed_payments;
END;
$$;

-- Function to process payment (simplified version)
CREATE OR REPLACE FUNCTION public.process_payment(
  p_job_id UUID,
  p_payer_id UUID,
  p_payee_id UUID,
  p_amount_cents INTEGER,
  p_payment_method_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_id UUID;
  job_status VARCHAR(20);
BEGIN
  -- Verify job exists and is in correct status
  SELECT status INTO job_status FROM public.jobs WHERE id = p_job_id;
  
  IF job_status IS NULL THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
  
  IF job_status NOT IN ('in_progress', 'completed') THEN
    RAISE EXCEPTION 'Job must be in progress or completed to process payment';
  END IF;
  
  -- Create payment record
  INSERT INTO public.payments (
    job_id,
    payer_id,
    payee_id,
    payment_method_id,
    amount_cents,
    status,
    payment_type,
    provider,
    description
  ) VALUES (
    p_job_id,
    p_payer_id,
    p_payee_id,
    p_payment_method_id,
    p_amount_cents,
    'processing',
    'job_payment',
    'stripe', -- Default provider
    p_description
  ) RETURNING id INTO payment_id;
  
  -- Create escrow record if job is still in progress
  IF job_status = 'in_progress' THEN
    INSERT INTO public.payment_escrow (
      job_id,
      payment_id,
      amount_cents,
      status
    ) VALUES (
      p_job_id,
      payment_id,
      p_amount_cents,
      'held'
    );
  END IF;
  
  RETURN payment_id;
END;
$$;

-- Function to release escrow payment when job is completed
CREATE OR REPLACE FUNCTION public.release_escrow_payment(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  escrow_record RECORD;
BEGIN
  -- Get escrow records for this job
  FOR escrow_record IN 
    SELECT * FROM public.payment_escrow 
    WHERE job_id = p_job_id AND status = 'held'
  LOOP
    -- Update escrow status
    UPDATE public.payment_escrow 
    SET status = 'released', released_at = NOW()
    WHERE id = escrow_record.id;
    
    -- Update payment status
    UPDATE public.payments 
    SET status = 'completed', paid_at = NOW()
    WHERE id = escrow_record.payment_id;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Trigger to automatically release escrow when job is completed
CREATE OR REPLACE FUNCTION public.auto_release_escrow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If job status changed to completed, release escrow
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    PERFORM public.release_escrow_payment(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_release_escrow_trigger
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_release_escrow();
