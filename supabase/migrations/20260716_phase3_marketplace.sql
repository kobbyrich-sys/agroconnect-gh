-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'GHS',
  unit TEXT NOT NULL DEFAULT 'unit',
  min_order NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (min_order > 0),
  stock NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON public.product_images(product_id, sort_order);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read, only admins can write
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: sellers manage their own, everyone reads active
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "products_select_own" ON public.products
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "products_insert_seller" ON public.products
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "products_update_own" ON public.products
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "products_delete_own" ON public.products
  FOR DELETE USING (seller_id = auth.uid());

-- Product images: public read, sellers manage their own product images
CREATE POLICY "product_images_select" ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND (status = 'active' OR seller_id = auth.uid()))
  );

CREATE POLICY "product_images_insert_seller" ON public.product_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
  );

CREATE POLICY "product_images_update_seller" ON public.product_images
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
  );

CREATE POLICY "product_images_delete_seller" ON public.product_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
  );

-- Seed categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Grains & Cereals', 'grains-cereals', 'Maize, rice, millet, sorghum, and other grains'),
  ('Vegetables', 'vegetables', 'Fresh tomatoes, onions, peppers, leafy greens, and more'),
  ('Fruits', 'fruits', 'Mangoes, oranges, bananas, pineapples, and tropical fruits'),
  ('Tubers & Roots', 'tubers-roots', 'Yam, cassava, plantain, cocoyam, sweet potatoes'),
  ('Livestock', 'livestock', 'Cattle, goats, sheep, pigs, and poultry'),
  ('Fishery', 'fishery', 'Fresh and processed fish, seafood'),
  ('Processed Foods', 'processed-foods', 'Gari, flour, oils, spices, and value-added products'),
  ('Seeds & Inputs', 'seeds-inputs', 'Farm seeds, fertilizers, and agricultural inputs'),
  ('Equipment', 'equipment', 'Farm tools, machinery, and equipment'),
  ('Other', 'other', 'Other agricultural products and services')
ON CONFLICT (slug) DO NOTHING;
