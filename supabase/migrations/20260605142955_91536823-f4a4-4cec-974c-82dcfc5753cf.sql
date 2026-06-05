DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='tickets') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='ticket_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='ticket_notifications') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_notifications';
  END IF;
END $$;

ALTER TABLE public.tickets REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_notifications REPLICA IDENTITY FULL;