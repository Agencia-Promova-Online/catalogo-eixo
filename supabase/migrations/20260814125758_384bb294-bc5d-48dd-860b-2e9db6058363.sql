ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '';

UPDATE public.machines
SET display_name = btrim(regexp_replace(coalesce(brand,'') || ' ' || coalesce(model,''), '\s+', ' ', 'g'))
WHERE btrim(display_name) = '';

CREATE OR REPLACE FUNCTION public.set_machine_display_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.display_name IS NULL OR btrim(NEW.display_name) = '' THEN
    NEW.display_name := btrim(regexp_replace(coalesce(NEW.brand,'') || ' ' || coalesce(NEW.model,''), '\s+', ' ', 'g'));
  ELSE
    NEW.display_name := btrim(regexp_replace(NEW.display_name, '\s+', ' ', 'g'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS machines_display_name ON public.machines;
CREATE TRIGGER machines_display_name
BEFORE INSERT OR UPDATE ON public.machines
FOR EACH ROW EXECUTE FUNCTION public.set_machine_display_name();