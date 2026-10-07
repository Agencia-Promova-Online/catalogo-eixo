CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION app_private.is_active_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND active = true);
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.is_active_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_active_user(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Active users read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Active users read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (app_private.is_active_user(auth.uid()));
CREATE POLICY "Admins manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Active users read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Active users read categories" ON public.categories
  FOR SELECT TO authenticated USING (app_private.is_active_user(auth.uid()));
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Active users read images" ON public.machine_images;
DROP POLICY IF EXISTS "Admins manage images" ON public.machine_images;
CREATE POLICY "Active users read images" ON public.machine_images
  FOR SELECT TO authenticated USING (app_private.is_active_user(auth.uid()));
CREATE POLICY "Admins manage images" ON public.machine_images
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Active users read machines" ON public.machines;
DROP POLICY IF EXISTS "Admins manage machines" ON public.machines;
CREATE POLICY "Active users read machines" ON public.machines
  FOR SELECT TO authenticated USING (app_private.is_active_user(auth.uid()));
CREATE POLICY "Admins manage machines" ON public.machines
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Own profile readable" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Own profile readable" ON public.profiles
  FOR SELECT TO authenticated
  USING ((id = auth.uid()) OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Roles readable" ON public.user_roles;
CREATE POLICY "Roles readable" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Active users view machine photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload machine photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins update machine photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete machine photos" ON storage.objects;
CREATE POLICY "Active users view machine photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'machine-photos' AND app_private.is_active_user(auth.uid()));
CREATE POLICY "Admins upload machine photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'machine-photos' AND app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update machine photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'machine-photos' AND app_private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete machine photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'machine-photos' AND app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_active_user(uuid);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated, anon;