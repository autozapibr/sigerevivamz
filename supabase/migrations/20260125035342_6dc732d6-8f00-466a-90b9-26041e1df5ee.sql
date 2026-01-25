-- Grant additional SELECT privileges to anon role for complete dashboard functionality
-- NOTE: This is for development/demo only. Revoke before production.

GRANT SELECT ON TABLE public.student_enrollments TO anon;
GRANT SELECT ON TABLE public.employees TO anon;