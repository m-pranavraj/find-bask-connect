-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE item_status AS ENUM ('available', 'claimed', 'verified', 'returned');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE item_category AS ENUM (
  'electronics',
  'wallets_purses',
  'keys',
  'bags',
  'documents',
  'jewelry',
  'clothing',
  'accessories',
  'other'
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  reputation_score INTEGER DEFAULT 0,
  items_found INTEGER DEFAULT 0,
  items_claimed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items table (found items)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category item_category NOT NULL,
  
  -- Location details
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  specific_location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Item details
  date_found DATE NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status item_status NOT NULL DEFAULT 'available',
  
  -- Contact preferences
  contact_method TEXT DEFAULT 'chat',
  
  -- Metadata
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Verification requests table
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Verification documents
  purchase_proof_url TEXT,
  identification_marks TEXT,
  photo_with_item_urls TEXT[] DEFAULT '{}',
  additional_proof_urls TEXT[] DEFAULT '{}',
  security_answers JSONB,
  
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(item_id, claimant_id)
);

-- Messages table (chat system)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews table (reputation system)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(item_id, reviewer_id, reviewee_id)
);

-- Create indexes for performance
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_finder_id ON public.items(finder_id);
CREATE INDEX idx_items_city ON public.items(city);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_created_at ON public.items(created_at);
CREATE INDEX idx_items_expires_at ON public.items(expires_at);
CREATE INDEX idx_verification_item_id ON public.verification_requests(item_id);
CREATE INDEX idx_verification_claimant_id ON public.verification_requests(claimant_id);
CREATE INDEX idx_messages_item_id ON public.messages(item_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Items RLS Policies
CREATE POLICY "Items are viewable by everyone"
  ON public.items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = finder_id);

CREATE POLICY "Finders can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = finder_id);

CREATE POLICY "Admins can update any item"
  ON public.items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any item"
  ON public.items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verification Requests RLS Policies
CREATE POLICY "Verification requests viewable by involved parties and admins"
  ON public.verification_requests FOR SELECT
  USING (
    auth.uid() = claimant_id OR
    auth.uid() IN (SELECT finder_id FROM public.items WHERE id = item_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Claimants can create verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Claimants can update their pending requests"
  ON public.verification_requests FOR UPDATE
  USING (auth.uid() = claimant_id AND status = 'pending');

CREATE POLICY "Admins and finders can update verification requests"
  ON public.verification_requests FOR UPDATE
  USING (
    auth.uid() IN (SELECT finder_id FROM public.items WHERE id = item_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Messages RLS Policies
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Reviews RLS Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for items they were involved in"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_items
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_verification
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to delete expired items (items older than 30 days)
CREATE OR REPLACE FUNCTION public.delete_expired_items()
RETURNS void AS $$
BEGIN
  DELETE FROM public.items
  WHERE expires_at < NOW()
  AND status != 'returned';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule automatic cleanup daily at 2 AM
SELECT cron.schedule(
  'delete-expired-items',
  '0 2 * * *',
  $$SELECT public.delete_expired_items()$$
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for item images
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'item-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents (private)
CREATE POLICY "Users can view their own verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );