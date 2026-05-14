I will implement the requested features to adapt the system for Mozambican teachers and pedagogical management.

### Phase 1: Teacher Access & Filtering
1.  **Teacher Identity**: Create a hook to identify the logged-in teacher by their email.
2.  **Filter Assignments**: Update the Evaluations page to only show classes and subjects assigned to the logged-in teacher (either as Class Director or subject teacher).
3.  **Permissions**: Ensure that only authorised personnel (Admins/Pedagogical) can see all data, while teachers see only their own.

### Phase 2: Attendance (Faltas) Integration
1.  **Attendance Tab**: Add an "Attendance" (Faltas) tab to the Evaluations page.
2.  **Daily Recording**: Allow teachers to record daily attendance for their classes and subjects.
3.  **Monthly/Trimestral Summary**: Display attendance statistics in the teacher's view.

### Phase 3: Caderneta do Aluno (Report Card)
1.  **Report Card Generation**: Create a dedicated view and PDF export for the "Caderneta do Aluno".
2.  **SiGER Standards**: Ensure the report card follows the Mozambican SiGER standards, including ACS1, ACS2, ACS3, AT, and Trimestral Averages.
3.  **Comprehensive View**: Include overall attendance, behavior, and final results.

### Phase 4: Pedagogical Release Logic
1.  **Release Controls**: Implement a mechanism for the Pedagogical Department to "Release" (Release for Viewing) grades and report cards.
2.  **Visibility**: Students and parents will only see the updated grades once released by the department.

### Technical Steps
- **Migration**: Add `released_at` and `release_status` to a new `pedagogical_settings` table.
- **Hooks**: Create `useCurrentTeacher` and update `useGrades` / `useAttendance`.
- **UI**: Enhance `Evaluations.tsx`, create `StudentReportCard.tsx`, and add a report card link in the class details.