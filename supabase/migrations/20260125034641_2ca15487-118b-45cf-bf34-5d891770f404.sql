-- Add development-friendly RLS policies for dashboard visualization
-- These allow the anon role to read data for demo/development purposes

-- Students - allow anon read for dashboard stats
CREATE POLICY "Anon can view students for demo" 
ON public.students 
FOR SELECT 
TO anon
USING (true);

-- Teachers - allow anon read for dashboard stats
CREATE POLICY "Anon can view teachers for demo" 
ON public.teachers 
FOR SELECT 
TO anon
USING (true);

-- Classes - allow anon read for dashboard stats
CREATE POLICY "Anon can view classes for demo" 
ON public.classes 
FOR SELECT 
TO anon
USING (true);

-- Transactions - allow anon read for financial charts
CREATE POLICY "Anon can view transactions for demo" 
ON public.transactions 
FOR SELECT 
TO anon
USING (true);

-- Tuition fees - allow anon read for financial charts
CREATE POLICY "Anon can view tuition_fees for demo" 
ON public.tuition_fees 
FOR SELECT 
TO anon
USING (true);

-- Financial categories - allow anon read
CREATE POLICY "Anon can view financial_categories for demo" 
ON public.financial_categories 
FOR SELECT 
TO anon
USING (true);

-- Attendance - allow anon read for reports
CREATE POLICY "Anon can view attendance for demo" 
ON public.attendance 
FOR SELECT 
TO anon
USING (true);

-- Grades - allow anon read for reports
CREATE POLICY "Anon can view grades for demo" 
ON public.grades 
FOR SELECT 
TO anon
USING (true);

-- Subjects - allow anon read
CREATE POLICY "Anon can view subjects for demo" 
ON public.subjects 
FOR SELECT 
TO anon
USING (true);

-- Guardians - allow anon read for reports
CREATE POLICY "Anon can view guardians for demo" 
ON public.guardians 
FOR SELECT 
TO anon
USING (true);

-- Calendar events - allow anon read
CREATE POLICY "Anon can view calendar_events for demo" 
ON public.calendar_events 
FOR SELECT 
TO anon
USING (true);

-- Announcements - allow anon read
CREATE POLICY "Anon can view announcements for demo" 
ON public.announcements 
FOR SELECT 
TO anon
USING (true);

-- Academic years - already has public read, but ensure anon access
CREATE POLICY "Anon can view academic_years for demo" 
ON public.academic_years 
FOR SELECT 
TO anon
USING (true);