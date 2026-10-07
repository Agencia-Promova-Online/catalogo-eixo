-- 1. Create technical validation status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'spec_validation_status') THEN
        CREATE TYPE public.spec_validation_status AS ENUM ('confirmed', 'review', 'not_confirmed');
    END IF;
END $$;

-- 2. Add technical validation and source fields to machines table
ALTER TABLE public.machines
ADD COLUMN IF NOT EXISTS version_config TEXT DEFAULT 'Não especificada',
ADD COLUMN IF NOT EXISTS technical_source TEXT,
ADD COLUMN IF NOT EXISTS technical_last_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS technical_validated_by UUID REFERENCES auth.users(id),
-- Individual status for key technical specs
ADD COLUMN IF NOT EXISTS status_power public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_operating_weight public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_max_digging_depth public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_bucket_capacity public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_max_reach public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_dump_height public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_engine public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_transmission public.spec_validation_status DEFAULT 'not_confirmed',
ADD COLUMN IF NOT EXISTS status_hydraulic_flow public.spec_validation_status DEFAULT 'not_confirmed';

-- 3. Grants
GRANT SELECT, INSERT, UPDATE ON public.machines TO authenticated;
GRANT ALL ON public.machines TO service_role;
