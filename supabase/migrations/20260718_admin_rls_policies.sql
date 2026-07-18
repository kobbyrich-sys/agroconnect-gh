-- Allow admins to SELECT and UPDATE all orders
CREATE POLICY "orders_select_admin" ON public.orders FOR SELECT USING (is_admin());
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (is_admin());

-- Allow admins to SELECT and UPDATE all products
CREATE POLICY "products_select_admin" ON public.products FOR SELECT USING (is_admin());
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (is_admin());

-- Allow admins to SELECT reviews
CREATE POLICY "reviews_select_admin" ON public.reviews FOR SELECT USING (is_admin());

-- Allow admins to SELECT and UPDATE withdrawal requests
CREATE POLICY "withdrawal_requests_select_admin" ON public.withdrawal_requests FOR SELECT USING (is_admin());
CREATE POLICY "withdrawal_requests_update_admin" ON public.withdrawal_requests FOR UPDATE USING (is_admin());

-- Allow admins to SELECT product images
CREATE POLICY "product_images_select_admin" ON public.product_images FOR SELECT USING (is_admin());
