-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'vendedor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND active = true);
$$;

CREATE POLICY "Own profile readable" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Roles readable" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active users read categories" ON public.categories FOR SELECT TO authenticated
  USING (public.is_active_user(auth.uid()));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- MACHINES
CREATE TABLE public.machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text,
  brand text NOT NULL,
  model text NOT NULL,
  category text NOT NULL,
  description text,
  notes text,
  year integer,
  price numeric(14,2),
  down_payment numeric(14,2),
  installment numeric(14,2),
  power text,
  operating_weight text,
  hours text,
  location text,
  status text NOT NULL DEFAULT 'disponivel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machines TO authenticated;
GRANT ALL ON public.machines TO service_role;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active users read machines" ON public.machines FOR SELECT TO authenticated
  USING (public.is_active_user(auth.uid()));
CREATE POLICY "Admins manage machines" ON public.machines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.machine_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  label text,
  is_main boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_images TO authenticated;
GRANT ALL ON public.machine_images TO service_role;
ALTER TABLE public.machine_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active users read images" ON public.machine_images FOR SELECT TO authenticated
  USING (public.is_active_user(auth.uid()));
CREATE POLICY "Admins manage images" ON public.machine_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SETTINGS
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true,
  company_name text NOT NULL DEFAULT 'INVEST INTERMEDIAÇÃO',
  logo_url text,
  phone text,
  whatsapp text,
  whatsapp_template text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_single_row CHECK (id = true)
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active users read settings" ON public.app_settings FOR SELECT TO authenticated
  USING (public.is_active_user(auth.uid()));
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER machines_updated_at BEFORE UPDATE ON public.machines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- new user -> profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'vendedor'))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED
INSERT INTO public.categories (name) VALUES
  ('Escavadeira'), ('Retroescavadeira'), ('Mini Escavadeira'), ('Mini Carregadeira'),
  ('Pá Carregadeira'), ('Máquina Agrícola'), ('Caminhão');

INSERT INTO public.app_settings (id, whatsapp_template) VALUES (true,
'🚜 {MODELO}

💰 Valor: {VALOR}

💳 Entrada: {ENTRADA}

📆 Parcelas a partir de: {PARCELA}

Tenho fotos e informações completas dessa máquina. Posso te enviar?');

INSERT INTO public.machines (code, brand, model, category, price, down_payment, installment, status, notes) VALUES
  ('01', 'VOLVO', '220D/DL', 'Escavadeira', 650900.00, 56300.00, 5900.00, 'disponivel', NULL),
  ('02', 'CATERPILLAR', '320', 'Escavadeira', 647000.00, 50300.00, 6000.00, 'disponivel', NULL),
  ('03', 'VOLVO', 'EC140', 'Escavadeira', 546000.00, 49293.80, 4942.12, 'disponivel', NULL),
  ('04', 'JCB', '3CX', 'Retroescavadeira', 400000.00, 36477.41, 3657.17, 'disponivel', NULL),
  ('05', 'JCB', '4CX', 'Retroescavadeira', 450000.00, 42000.00, 4200.00, 'disponivel', NULL),
  ('06', 'CASE', '580N', 'Retroescavadeira', 416300.00, 37600.00, 3800.00, 'disponivel', NULL),
  ('07', 'CAT', '416', 'Retroescavadeira', 437183.03, 39435.06, 3953.72, 'disponivel', NULL),
  ('08', 'CASE', 'SV185B', 'Mini Carregadeira', 285000.00, 24000.00, 2200.00, 'disponivel', NULL),
  ('09', 'JCB', '35Z-1', 'Mini Escavadeira', 295098.55, 26618.66, 2668.75, 'disponivel', '3,5 toneladas'),
  ('10', 'CATERPILLAR', '250', 'Mini Carregadeira', 284168.97, 25632.78, 2569.91, 'disponivel', NULL),
  ('11', 'SANY', 'SY16C', 'Mini Escavadeira', 273239.40, 21206.27, 2494.01, 'disponivel', NULL),
  ('12', 'BOBCAT', 'S450', 'Mini Carregadeira', 250000.00, 20000.00, 1900.00, 'disponivel', NULL);