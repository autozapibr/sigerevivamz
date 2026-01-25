-- Grant SELECT privileges to anon role for demo/dashboard visualization
-- NOTE: This is for development/demo only. Revoke before production.

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON TABLE public.students TO anon;
GRANT SELECT ON TABLE public.teachers TO anon;
GRANT SELECT ON TABLE public.classes TO anon;
GRANT SELECT ON TABLE public.transactions TO anon;
GRANT SELECT ON TABLE public.tuition_fees TO anon;
GRANT SELECT ON TABLE public.financial_categories TO anon;
GRANT SELECT ON TABLE public.subjects TO anon;
GRANT SELECT ON TABLE public.guardians TO anon;
GRANT SELECT ON TABLE public.attendance TO anon;
GRANT SELECT ON TABLE public.grades TO anon;
GRANT SELECT ON TABLE public.calendar_events TO anon;
GRANT SELECT ON TABLE public.announcements TO anon;
GRANT SELECT ON TABLE public.academic_years TO anon;