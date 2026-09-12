-- ==========================================================
-- „Œÿÿ ﬁ«⁄œ… »Ì«‰«  „ Ã— “ÂÊ— «··Ê ” (Lotus Flowers Store)
-- „‘—Ê⁄ Supabase: https://virecinrnuhpbadrswjj.supabase.co
-- ==========================================================

CREATE TABLE IF NOT EXISTS store_info (
  id TEXT PRIMARY KEY DEFAULT 'lotus_store_info',
  name TEXT NOT NULL DEFAULT '“ÂÊ— «··Ê ” & Lotus Flowers',
  tagline TEXT DEFAULT '„Õ· Ê—œ & Âœ«Ì« & Ã«·Ì—Ì - «·„‰Ì·° «·ﬁ«Â—…',
  phone TEXT DEFAULT '01105746118',
  whatsapp TEXT DEFAULT '201105746118',
  vodafone_cash TEXT DEFAULT '01105746118',
  address TEXT DEFAULT '3 ‘«—⁄ ”⁄Ìœ –Ê «·›ﬁ«—° «·„‰Ì·° «·ﬁ«Â—…° „’—',
  opening_hours TEXT DEFAULT 'ÌÊ„Ì« „‰ 10:00 ’»«Õ« Õ Ï 12:00 „‰ ’› «··Ì·',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/lotus_flowers_eg/',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/share/16LyEtG1Ys',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 35,
  time TEXT DEFAULT 'Œ·«· ”«⁄ Ì‰',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  categories TEXT[],
  flower_type TEXT,
  flower_types TEXT[],
  color TEXT,
  colors TEXT[],
  badge TEXT,
  image TEXT,
  description TEXT,
  sizes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  sku TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  is_gift BOOLEAN DEFAULT FALSE,
  recipient_name TEXT,
  recipient_phone TEXT,
  gift_note TEXT,
  area TEXT,
  address_details TEXT,
  delivery_slot TEXT,
  items JSONB,
  delivery_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'vodafone_cash',
  vodafone_sender_number TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending_payment',
  driver_name TEXT,
  cancel_reason TEXT,
  cancel_notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pass TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  role_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
