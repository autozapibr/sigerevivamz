
-- Allow ALL authenticated users to see Feriado and Evento type calendar events
CREATE POLICY "All users can view holidays and events"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (type IN ('Feriado', 'Evento'));
