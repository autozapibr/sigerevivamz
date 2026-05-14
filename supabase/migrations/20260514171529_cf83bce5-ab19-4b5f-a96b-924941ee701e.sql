-- Check if type already exists from previous failed run
DO $$ BEGIN
    CREATE TYPE release_status AS ENUM ('draft', 'review', 'released');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.pedagogical_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    academic_year INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,
    release_status release_status NOT NULL DEFAULT 'draft',
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(academic_year, trimestre)
);

-- Enable RLS
ALTER TABLE public.pedagogical_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view release status" 
ON public.pedagogical_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage pedagogical settings" 
ON public.pedagogical_settings 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('ADMIN', 'PEDAGOGICO', 'DIRETORIA')
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_pedagogical_settings_updated_at ON public.pedagogical_settings;
CREATE TRIGGER update_pedagogical_settings_updated_at
BEFORE UPDATE ON public.pedagogical_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
