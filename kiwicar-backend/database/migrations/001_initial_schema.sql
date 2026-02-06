-- KiwiCar Initial Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- ============================================================
-- User profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  region TEXT,
  show_phone BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Listings
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plate_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  ai_description TEXT,
  ai_price_min NUMERIC(10,2),
  ai_price_max NUMERIC(10,2),
  ai_price_recommended NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SOLD','REMOVED','DRAFT')),
  region TEXT NOT NULL DEFAULT '',
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL','DIESEL','HYBRID','ELECTRIC','OTHER')),
  transmission TEXT NOT NULL CHECK (transmission IN ('AUTOMATIC','MANUAL')),
  body_type TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  vin TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at);
CREATE INDEX IF NOT EXISTS idx_listings_make_model ON listings(make, model);
CREATE INDEX IF NOT EXISTS idx_listings_region ON listings(region);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- ============================================================
-- Listing images
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);

-- ============================================================
-- Favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price_alert BOOLEAN DEFAULT false,
  target_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- ============================================================
-- Price history
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_listing ON price_history(listing_id);

-- ============================================================
-- Messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  receiver_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read);

-- ============================================================
-- Vehicle info cache (from NZTA lookups)
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_info (
  plate_number TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  body_style TEXT,
  color TEXT,
  engine_cc INTEGER,
  fuel_type TEXT,
  wof_expiry DATE,
  wof_status TEXT,
  rego_expiry DATE,
  rego_status TEXT,
  first_registered DATE,
  odometer_readings JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Lookup quotas
-- ============================================================
CREATE TABLE IF NOT EXISTS lookup_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- Storage buckets (run these separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (basic policies)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_quotas ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: everyone can read active, owners can manage own
CREATE POLICY IF NOT EXISTS "Active listings are viewable by everyone" ON listings FOR SELECT USING (status = 'ACTIVE' OR user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can insert own listings" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can update own listings" ON listings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can delete own listings" ON listings FOR DELETE USING (user_id = auth.uid());

-- Listing images: viewable by everyone, insertable by authenticated
CREATE POLICY IF NOT EXISTS "Listing images are viewable by everyone" ON listing_images FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert images" ON listing_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Authenticated users can delete images" ON listing_images FOR DELETE USING (auth.role() = 'authenticated');

-- Favorites: users manage own
CREATE POLICY IF NOT EXISTS "Users can view own favorites" ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can update own favorites" ON favorites FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can delete own favorites" ON favorites FOR DELETE USING (user_id = auth.uid());

-- Messages: participants can view
CREATE POLICY IF NOT EXISTS "Users can view own messages" ON messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Receivers can update messages" ON messages FOR UPDATE USING (receiver_id = auth.uid());

-- Price history: viewable by everyone
CREATE POLICY IF NOT EXISTS "Price history is viewable by everyone" ON price_history FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated users can insert price history" ON price_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Vehicle info: viewable by everyone
CREATE POLICY IF NOT EXISTS "Vehicle info is viewable by everyone" ON vehicle_info FOR SELECT USING (true);

-- Lookup quotas: users manage own
CREATE POLICY IF NOT EXISTS "Users can view own quota" ON lookup_quotas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "Users can update own quota" ON lookup_quotas FOR UPDATE USING (user_id = auth.uid());
