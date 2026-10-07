ALTER TABLE public.machine_images ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.machine_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES public.machines(id) ON DELETE SET NULL,
  machine_label text NOT NULL DEFAULT '',
  user_id uuid,
  field text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.machine_change_log TO authenticated;
GRANT ALL ON public.machine_change_log TO service_role;

ALTER TABLE public.machine_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read change log" ON public.machine_change_log;
CREATE POLICY "Admins read change log" ON public.machine_change_log
  FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.log_machine_money_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  label text := coalesce(NEW.brand, '') || ' ' || coalesce(NEW.model, '');
BEGIN
  IF coalesce(OLD.price, -1) IS DISTINCT FROM coalesce(NEW.price, -1) THEN
    INSERT INTO public.machine_change_log (machine_id, machine_label, user_id, field, old_value, new_value)
    VALUES (NEW.id, label, auth.uid(), 'price', OLD.price::text, NEW.price::text);
  END IF;
  IF coalesce(OLD.down_payment, -1) IS DISTINCT FROM coalesce(NEW.down_payment, -1) THEN
    INSERT INTO public.machine_change_log (machine_id, machine_label, user_id, field, old_value, new_value)
    VALUES (NEW.id, label, auth.uid(), 'down_payment', OLD.down_payment::text, NEW.down_payment::text);
  END IF;
  IF coalesce(OLD.installment, -1) IS DISTINCT FROM coalesce(NEW.installment, -1) THEN
    INSERT INTO public.machine_change_log (machine_id, machine_label, user_id, field, old_value, new_value)
    VALUES (NEW.id, label, auth.uid(), 'installment', OLD.installment::text, NEW.installment::text);
  END IF;
  IF coalesce(OLD.status, '') IS DISTINCT FROM coalesce(NEW.status, '') THEN
    INSERT INTO public.machine_change_log (machine_id, machine_label, user_id, field, old_value, new_value)
    VALUES (NEW.id, label, auth.uid(), 'status', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.log_machine_money_changes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS machines_change_log ON public.machines;
CREATE TRIGGER machines_change_log
AFTER UPDATE ON public.machines
FOR EACH ROW EXECUTE FUNCTION public.log_machine_money_changes();