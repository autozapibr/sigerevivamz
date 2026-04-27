-- Garantir RLS habilitado
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admin can manage roadmap" ON public.roadmap_items;
DROP POLICY IF EXISTS "Staff can view roadmap" ON public.roadmap_items;

-- Leitura: qualquer membro do staff (ADMIN, DIRETORIA, SECRETARIA, FINANCEIRO, PROFESSOR, PEDAGOGICO)
CREATE POLICY "Staff can view roadmap"
  ON public.roadmap_items
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Escrita exclusiva para ADMIN (INSERT/UPDATE/DELETE separados para clareza)
CREATE POLICY "Only ADMIN can insert roadmap"
  ON public.roadmap_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'ADMIN'::public.app_role));

CREATE POLICY "Only ADMIN can update roadmap"
  ON public.roadmap_items
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'ADMIN'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'ADMIN'::public.app_role));

CREATE POLICY "Only ADMIN can delete roadmap"
  ON public.roadmap_items
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'ADMIN'::public.app_role));