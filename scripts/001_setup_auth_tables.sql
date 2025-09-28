-- Create profiles table that extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('handwerker', 'kunde')),
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  website TEXT,
  description TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- Allow public read access to handwerker profiles for browsing
CREATE POLICY "profiles_select_handwerker_public" ON public.profiles 
  FOR SELECT USING (user_type = 'handwerker');

-- Create handwerker_profiles table for additional handwerker-specific data
CREATE TABLE IF NOT EXISTS public.handwerker_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_category VARCHAR(100),
  experience_years INTEGER,
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  service_radius_km INTEGER,
  available_for_emergency BOOLEAN DEFAULT FALSE,
  license_number TEXT,
  insurance_valid_until DATE,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.handwerker_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for handwerker_profiles
CREATE POLICY "handwerker_profiles_select_own" ON public.handwerker_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "handwerker_profiles_insert_own" ON public.handwerker_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "handwerker_profiles_update_own" ON public.handwerker_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "handwerker_profiles_delete_own" ON public.handwerker_profiles 
  FOR DELETE USING (auth.uid() = id);

-- Allow public read access for browsing handwerker profiles
CREATE POLICY "handwerker_profiles_select_public" ON public.handwerker_profiles 
  FOR SELECT USING (true);

-- Create kunde_profiles table for customer-specific data
CREATE TABLE IF NOT EXISTS public.kunde_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kunde_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kunde_profiles
CREATE POLICY "kunde_profiles_select_own" ON public.kunde_profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "kunde_profiles_insert_own" ON public.kunde_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "kunde_profiles_update_own" ON public.kunde_profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "kunde_profiles_delete_own" ON public.kunde_profiles 
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'kunde'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create specific profile based on user type
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'kunde') = 'handwerker' THEN
    INSERT INTO public.handwerker_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.kunde_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
