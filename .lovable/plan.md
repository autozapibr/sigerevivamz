I will implement a comprehensive enrollment and re-enrollment system that handles new student registration and priority renewals for existing students, including administrative configuration and financial integration.

### Database Changes
- Create `enrollment_periods` table to manage start/end dates for "Matrícula" (New) and "Re-matrícula" (Renewal) for each academic year and education level.
- Add `enrollment_type` (NEW, RENEWAL) to `student_enrollments`.
- Create `education_level_fees` table to define standard fees per level (e.g., Primary, Secondary) for specific academic years.
- Add `previous_enrollment_id` to `student_enrollments` to track student history and continuity.
- Implement a trigger to automatically link re-enrollments to the student's historical data.

### Frontend Components
- **Admin Configuration Page**: A new settings view for Admins and Directors to:
  - Define enrollment periods with start/end dates.
  - Set standard fees (Registration and Monthly) per education level.
- **Enhanced Enrollment Wizard**:
  - Add logic to detect if a student is existing (Re-matrícula) or new (Matrícula).
  - Apply priority rules and validation based on active enrollment periods.
  - Automatically fetch historical data for re-enrolling students.
- **Reporting Dashboard**:
  - Filterable list/charts for enrollment statistics.
  - Specific indicators for "Taxa de Retenção" (Retention Rate) and "Novos Alunos" (New Students).
  - Export capabilities for financial planning.

### Financial Integration
- Automatically generate tuition invoices based on the education level fees configured for the specific academic year.
- Update the financial module to distinguish between registration fees and recurring monthly fees.

### Technical Details
- Use Supabase RLS to restrict configuration access to `ADMIN` and `DIRETORIA` roles.
- Implement React Query hooks for period validation and fee lookups.
- Update `useCreateEnrollment` and `useUpdateEnrollmentStatus` hooks to handle the new logic.

### User Roles
- **Admin/Director**: Can configure periods and fees.
- **Staff/Secretaria**: Can process both types of enrollments.
- **Parents/Students**: Will see appropriate options based on their status and active periods.