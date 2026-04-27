CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id text PRIMARY KEY,
  phase text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  priority text NOT NULL DEFAULT 'media',
  is_done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view roadmap" ON public.roadmap_items;
CREATE POLICY "Staff can view roadmap"
ON public.roadmap_items FOR SELECT
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin can manage roadmap" ON public.roadmap_items;
CREATE POLICY "Admin can manage roadmap"
ON public.roadmap_items FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE INDEX IF NOT EXISTS roadmap_items_phase_idx ON public.roadmap_items(phase, display_order);