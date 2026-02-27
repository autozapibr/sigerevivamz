
-- Remove remaining demo policies on tickets, ticket_messages, ticket_notifications
DROP POLICY IF EXISTS "Anon can insert ticket_messages for demo" ON public.ticket_messages;
DROP POLICY IF EXISTS "Anon can view ticket_messages for demo" ON public.ticket_messages;
DROP POLICY IF EXISTS "Anon can delete tickets for demo" ON public.tickets;
DROP POLICY IF EXISTS "Anon can insert tickets for demo" ON public.tickets;
DROP POLICY IF EXISTS "Anon can update tickets for demo" ON public.tickets;
DROP POLICY IF EXISTS "Anon can view tickets for demo" ON public.tickets;
DROP POLICY IF EXISTS "Allow all delete on ticket_notifications" ON public.ticket_notifications;
DROP POLICY IF EXISTS "Allow all insert on ticket_notifications" ON public.ticket_notifications;
DROP POLICY IF EXISTS "Allow all select on ticket_notifications" ON public.ticket_notifications;
DROP POLICY IF EXISTS "Allow all update on ticket_notifications" ON public.ticket_notifications;

-- Add proper RLS policies for ticket_notifications
CREATE POLICY "Staff can manage ticket_notifications"
ON public.ticket_notifications FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Users can view own ticket_notifications"
ON public.ticket_notifications FOR SELECT
USING (user_id = auth.uid()::text);
