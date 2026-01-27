-- Create enums for ticket system
CREATE TYPE public.ticket_status AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO', 'RESOLVIDO', 'FECHADO');
CREATE TYPE public.ticket_priority AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');
CREATE TYPE public.ticket_category AS ENUM ('RECLAMACAO', 'INFORMACAO', 'SUGESTAO', 'SUPORTE', 'FINANCEIRO', 'PEDAGOGICO', 'RH', 'OUTRO');

-- Create tickets table
CREATE TABLE public.tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category ticket_category NOT NULL DEFAULT 'OUTRO',
  priority ticket_priority NOT NULL DEFAULT 'NORMAL',
  status ticket_status NOT NULL DEFAULT 'ABERTO',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL,
  created_by_role TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name TEXT,
  assigned_department TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket messages table
CREATE TABLE public.ticket_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- For staff-only notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket notifications table
CREATE TABLE public.ticket_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Generate ticket number trigger
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  
  SELECT COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(ticket_number, '[^0-9]', '', 'g'), '')::INT
  ), 0) + 1
  INTO next_number
  FROM public.tickets
  WHERE ticket_number LIKE 'TKT-' || year_suffix || '-%';
  
  NEW.ticket_number := 'TKT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_number();

-- Update timestamp trigger
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets (all authenticated users can participate)
CREATE POLICY "Users can view their own tickets"
ON public.tickets FOR SELECT
USING (auth.uid() = created_by OR auth.uid() = assigned_to OR is_staff(auth.uid()));

CREATE POLICY "Users can create tickets"
ON public.tickets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update tickets"
ON public.tickets FOR UPDATE
USING (auth.uid() = created_by OR is_staff(auth.uid()));

CREATE POLICY "Staff can delete tickets"
ON public.tickets FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

-- RLS for messages
CREATE POLICY "Users can view messages on their tickets"
ON public.ticket_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id 
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_staff(auth.uid()))
  )
  AND (NOT is_internal OR is_staff(auth.uid()))
);

CREATE POLICY "Users can send messages"
ON public.ticket_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id 
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_staff(auth.uid()))
  )
);

-- RLS for notifications
CREATE POLICY "Users can view own notifications"
ON public.ticket_notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.ticket_notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.ticket_notifications FOR INSERT
WITH CHECK (true);

-- Demo policies for anon (testing)
CREATE POLICY "Anon can view tickets for demo"
ON public.tickets FOR SELECT USING (true);

CREATE POLICY "Anon can insert tickets for demo"
ON public.tickets FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update tickets for demo"
ON public.tickets FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete tickets for demo"
ON public.tickets FOR DELETE USING (true);

CREATE POLICY "Anon can view ticket_messages for demo"
ON public.ticket_messages FOR SELECT USING (true);

CREATE POLICY "Anon can insert ticket_messages for demo"
ON public.ticket_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can view ticket_notifications for demo"
ON public.ticket_notifications FOR SELECT USING (true);

CREATE POLICY "Anon can update ticket_notifications for demo"
ON public.ticket_notifications FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anon can insert ticket_notifications for demo"
ON public.ticket_notifications FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_notifications_user_id ON public.ticket_notifications(user_id);
CREATE INDEX idx_ticket_notifications_unread ON public.ticket_notifications(user_id, is_read) WHERE is_read = false;