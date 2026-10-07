-- 1. Ensure spec_validation_status exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spec_validation_status') THEN
        CREATE TYPE public.spec_validation_status AS ENUM ('confirmed', 'review', 'not_confirmed');
    END IF;
END $$;

-- 2. Add columns to machine_change_log for source and validation audit
ALTER TABLE public.machine_change_log
ADD COLUMN IF NOT EXISTS technical_source TEXT,
ADD COLUMN IF NOT EXISTS technical_last_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validator_id UUID REFERENCES auth.users(id);

-- 3. Grants
GRANT SELECT, INSERT ON public.machine_change_log TO authenticated;
GRANT ALL ON public.machine_change_log TO service_role;
