-- =====================================================
-- POLÍTICAS DE ACESSO ANON PARA DEMO/TESTES
-- REMOVER ANTES DA PRODUÇÃO!
-- =====================================================

-- calendar_events - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert calendar_events for demo"
ON public.calendar_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update calendar_events for demo"
ON public.calendar_events FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete calendar_events for demo"
ON public.calendar_events FOR DELETE
USING (true);

-- class_curriculum - ALL para anon
CREATE POLICY "Anon can view class_curriculum for demo"
ON public.class_curriculum FOR SELECT
USING (true);

CREATE POLICY "Anon can insert class_curriculum for demo"
ON public.class_curriculum FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update class_curriculum for demo"
ON public.class_curriculum FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete class_curriculum for demo"
ON public.class_curriculum FOR DELETE
USING (true);

-- attendance - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert attendance for demo"
ON public.attendance FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update attendance for demo"
ON public.attendance FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete attendance for demo"
ON public.attendance FOR DELETE
USING (true);

-- grades - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert grades for demo"
ON public.grades FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update grades for demo"
ON public.grades FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete grades for demo"
ON public.grades FOR DELETE
USING (true);

-- students - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert students for demo"
ON public.students FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update students for demo"
ON public.students FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete students for demo"
ON public.students FOR DELETE
USING (true);

-- teachers - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert teachers for demo"
ON public.teachers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update teachers for demo"
ON public.teachers FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete teachers for demo"
ON public.teachers FOR DELETE
USING (true);

-- classes - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert classes for demo"
ON public.classes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update classes for demo"
ON public.classes FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete classes for demo"
ON public.classes FOR DELETE
USING (true);

-- subjects - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert subjects for demo"
ON public.subjects FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update subjects for demo"
ON public.subjects FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete subjects for demo"
ON public.subjects FOR DELETE
USING (true);

-- academic_years - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert academic_years for demo"
ON public.academic_years FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update academic_years for demo"
ON public.academic_years FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete academic_years for demo"
ON public.academic_years FOR DELETE
USING (true);

-- guardians - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert guardians for demo"
ON public.guardians FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update guardians for demo"
ON public.guardians FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete guardians for demo"
ON public.guardians FOR DELETE
USING (true);

-- student_guardians - ALL para anon
CREATE POLICY "Anon can view student_guardians for demo"
ON public.student_guardians FOR SELECT
USING (true);

CREATE POLICY "Anon can insert student_guardians for demo"
ON public.student_guardians FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update student_guardians for demo"
ON public.student_guardians FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete student_guardians for demo"
ON public.student_guardians FOR DELETE
USING (true);

-- student_enrollments - ALL para anon
CREATE POLICY "Anon can view student_enrollments for demo"
ON public.student_enrollments FOR SELECT
USING (true);

CREATE POLICY "Anon can insert student_enrollments for demo"
ON public.student_enrollments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update student_enrollments for demo"
ON public.student_enrollments FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete student_enrollments for demo"
ON public.student_enrollments FOR DELETE
USING (true);

-- student_documents - ALL para anon
CREATE POLICY "Anon can view student_documents for demo"
ON public.student_documents FOR SELECT
USING (true);

CREATE POLICY "Anon can insert student_documents for demo"
ON public.student_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update student_documents for demo"
ON public.student_documents FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete student_documents for demo"
ON public.student_documents FOR DELETE
USING (true);

-- enrollments - ALL para anon
CREATE POLICY "Anon can view enrollments for demo"
ON public.enrollments FOR SELECT
USING (true);

CREATE POLICY "Anon can insert enrollments for demo"
ON public.enrollments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update enrollments for demo"
ON public.enrollments FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete enrollments for demo"
ON public.enrollments FOR DELETE
USING (true);

-- announcements - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert announcements for demo"
ON public.announcements FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update announcements for demo"
ON public.announcements FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete announcements for demo"
ON public.announcements FOR DELETE
USING (true);

-- tuition_fees - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert tuition_fees for demo"
ON public.tuition_fees FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update tuition_fees for demo"
ON public.tuition_fees FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete tuition_fees for demo"
ON public.tuition_fees FOR DELETE
USING (true);

-- transactions - INSERT/UPDATE/DELETE para anon
CREATE POLICY "Anon can insert transactions for demo"
ON public.transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update transactions for demo"
ON public.transactions FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete transactions for demo"
ON public.transactions FOR DELETE
USING (true);

-- employees - ALL para anon
CREATE POLICY "Anon can view employees for demo"
ON public.employees FOR SELECT
USING (true);

CREATE POLICY "Anon can insert employees for demo"
ON public.employees FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update employees for demo"
ON public.employees FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete employees for demo"
ON public.employees FOR DELETE
USING (true);

-- staff_documents - ALL para anon
CREATE POLICY "Anon can view staff_documents for demo"
ON public.staff_documents FOR SELECT
USING (true);

CREATE POLICY "Anon can insert staff_documents for demo"
ON public.staff_documents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update staff_documents for demo"
ON public.staff_documents FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete staff_documents for demo"
ON public.staff_documents FOR DELETE
USING (true);

-- contract_signatures - INSERT/UPDATE para anon
CREATE POLICY "Anon can insert contract_signatures for demo"
ON public.contract_signatures FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update contract_signatures for demo"
ON public.contract_signatures FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete contract_signatures for demo"
ON public.contract_signatures FOR DELETE
USING (true);

CREATE POLICY "Anon can view contract_signatures for demo"
ON public.contract_signatures FOR SELECT
USING (true);

-- scholarships - ALL para anon
CREATE POLICY "Anon can view scholarships for demo"
ON public.scholarships FOR SELECT
USING (true);

CREATE POLICY "Anon can insert scholarships for demo"
ON public.scholarships FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update scholarships for demo"
ON public.scholarships FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete scholarships for demo"
ON public.scholarships FOR DELETE
USING (true);

-- student_scholarships - ALL para anon
CREATE POLICY "Anon can view student_scholarships for demo"
ON public.student_scholarships FOR SELECT
USING (true);

CREATE POLICY "Anon can insert student_scholarships for demo"
ON public.student_scholarships FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update student_scholarships for demo"
ON public.student_scholarships FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete student_scholarships for demo"
ON public.student_scholarships FOR DELETE
USING (true);

-- payment_agreements - ALL para anon
CREATE POLICY "Anon can view payment_agreements for demo"
ON public.payment_agreements FOR SELECT
USING (true);

CREATE POLICY "Anon can insert payment_agreements for demo"
ON public.payment_agreements FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update payment_agreements for demo"
ON public.payment_agreements FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete payment_agreements for demo"
ON public.payment_agreements FOR DELETE
USING (true);

-- agreement_installments - ALL para anon
CREATE POLICY "Anon can view agreement_installments for demo"
ON public.agreement_installments FOR SELECT
USING (true);

CREATE POLICY "Anon can insert agreement_installments for demo"
ON public.agreement_installments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update agreement_installments for demo"
ON public.agreement_installments FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete agreement_installments for demo"
ON public.agreement_installments FOR DELETE
USING (true);

-- communication_history - ALL para anon
CREATE POLICY "Anon can view communication_history for demo"
ON public.communication_history FOR SELECT
USING (true);

CREATE POLICY "Anon can insert communication_history for demo"
ON public.communication_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update communication_history for demo"
ON public.communication_history FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete communication_history for demo"
ON public.communication_history FOR DELETE
USING (true);

-- scheduled_reminders - ALL para anon
CREATE POLICY "Anon can view scheduled_reminders for demo"
ON public.scheduled_reminders FOR SELECT
USING (true);

CREATE POLICY "Anon can insert scheduled_reminders for demo"
ON public.scheduled_reminders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can update scheduled_reminders for demo"
ON public.scheduled_reminders FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete scheduled_reminders for demo"
ON public.scheduled_reminders FOR DELETE
USING (true);

-- announcement_reads - UPDATE/DELETE para anon
CREATE POLICY "Anon can update announcement_reads for demo"
ON public.announcement_reads FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anon can delete announcement_reads for demo"
ON public.announcement_reads FOR DELETE
USING (true);

CREATE POLICY "Anon can insert announcement_reads for demo"
ON public.announcement_reads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anon can view announcement_reads for demo"
ON public.announcement_reads FOR SELECT
USING (true);