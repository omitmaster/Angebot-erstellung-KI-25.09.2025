-- Create user profiles table for handwerk app
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('handwerker', 'kunde', 'admin')),
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

-- Create handwerker-specific profiles
CREATE TABLE IF NOT EXISTS public.handwerker_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_category VARCHAR(50) NOT NULL, -- 'elektriker', 'klempner', 'zimmermann', etc.
  experience_years INTEGER,
  license_number TEXT,
  insurance_valid_until DATE,
  service_radius_km INTEGER DEFAULT 50,
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  available_for_emergency BOOLEAN DEFAULT FALSE,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kunde-specific profiles
CREATE TABLE IF NOT EXISTS public.kunde_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handwerker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kunde_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Allow public read access to handwerker profiles for browsing
CREATE POLICY "handwerker_profiles_public_select" ON public.handwerker_profiles FOR SELECT USING (true);
CREATE POLICY "handwerker_profiles_insert_own" ON public.handwerker_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "handwerker_profiles_update_own" ON public.handwerker_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "handwerker_profiles_delete_own" ON public.handwerker_profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for kunde profiles
CREATE POLICY "kunde_profiles_select_own" ON public.kunde_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "kunde_profiles_insert_own" ON public.kunde_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "kunde_profiles_update_own" ON public.kunde_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "kunde_profiles_delete_own" ON public.kunde_profiles FOR DELETE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'kunde'),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Create specific profile based on user type
  IF COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'kunde') = 'handwerker' THEN
    INSERT INTO public.handwerker_profiles (id, trade_category)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'trade_category', 'allgemein')
    );
  ELSE
    INSERT INTO public.kunde_profiles (id)
    VALUES (NEW.id);
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_handwerker_profiles_updated_at BEFORE UPDATE ON public.handwerker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kunde_profiles_updated_at BEFORE UPDATE ON public.kunde_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_handwerker_profiles_trade_category ON public.handwerker_profiles(trade_category);
CREATE INDEX IF NOT EXISTS idx_handwerker_profiles_rating ON public.handwerker_profiles(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_handwerker_profiles_location ON public.handwerker_profiles(service_radius_km);
