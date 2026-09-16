CREATE SEQUENCE IF NOT EXISTS public.enrollment_number_seq;
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq;

GRANT USAGE, SELECT ON SEQUENCE public.enrollment_number_seq TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ticket_number_seq TO authenticated, service_role;