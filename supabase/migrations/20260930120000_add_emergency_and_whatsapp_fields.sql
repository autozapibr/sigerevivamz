-- Contacto de emergência do educando + selos de WhatsApp do encarregado.
-- Aplicado directamente no Supabase (SQL Editor); esta migração fica no repo
-- para histórico e para manter os ambientes em sincronia (idempotente).

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_relationship TEXT;

ALTER TABLE public.guardians
  ADD COLUMN IF NOT EXISTS phone_is_whatsapp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_alt_is_whatsapp BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
