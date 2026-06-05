## Contract Management System Improvement Plan

We will enhance the existing contract management system for teachers and collaborators at Escola Reviva, focusing on automation, tracking, and full data integration.

### 1. Data Integration & Backend
- Update the `useContracts` hook to fetch complete profile data (BI, NUIT, Address, Bank details) for both teachers and employees.
- Refine the `contract_signatures` table logic to better track the lifecycle of a contract (Draft -> Sent -> Signed).
- Add database triggers or a system check to flag contracts near expiry (30 days).

### 2. Contract Renewal & Lifecycle
- Implement a **"Renovar Contrato"** (Renew Contract) action in the main list.
- Automate the renewal process by pre-filling the next contract's start date (day after current end) and incrementing the contract version/number.
- Improve the status tracking: differentiate between "Signed Digitally" and "Signed Physically".

### 3. Enhanced Generation & Editing
- Improve `ContractGeneratorDialog` to allow editing specific clauses before final generation.
- Add support for "Custom Clauses" in the `ContractTemplates`.
- Ensure the "Digital Signature" flow is integrated, allowing the admin to send a link to the collaborator via WhatsApp/Email.

### 4. UI/UX Improvements
- Add a "Status de Assinatura" (Signature Status) column to the contracts table.
- Create a specific report for RH showing financial commitments based on active contracts.
- Add bulk actions (e.g., "Export all active contracts to PDF/Excel").

### Technical Details
- **Hooks**: Update `useContracts.ts` to include full staff data.
- **Components**: 
  - Enhance `ContratosPage.tsx` with renewal actions and signature tracking.
  - Modify `ContractGeneratorDialog.tsx` to handle renewals.
  - Update `ContractTemplates.ts` with more robust template logic.
- **Database**: Ensure `contract_signatures` is correctly linked to `teachers` or `employees`.
- **Security**: Maintain existing RLS policies where only Admin and RH can manage contracts.

---
*Note: This plan focuses on making the contract system more robust and integrated with the financial and HR modules.*