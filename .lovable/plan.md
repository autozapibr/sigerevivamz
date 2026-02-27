

## Problems Identified

1. **White text on white background**: The preview uses Tailwind's `prose` classes which inherit the dark theme's foreground color (white). The AI-generated HTML content renders white text on the white paper background.

2. **Font sizes too large**: The prose classes use default sizing; need smaller, print-appropriate sizes.

3. **Incomplete plan (missing sections 8-12)**: The AI likely hits the token limit or the prompt doesn't enforce completion strongly enough. Need to increase token limit and add a stronger completion instruction.

4. **Download is HTML, not PDF**: User wants PDF download. Need to generate a proper PDF using the print-to-PDF approach via a hidden iframe.

5. **White screen / redirect to login**: The `devBypassLogin` creates a mock user in memory only. When an unhandled promise rejection occurs (e.g., from a failed Supabase query with no real auth), it crashes the app and the auth state resets, redirecting to login. Need: (a) `try/catch` in `handleGenerate`, (b) global `unhandledrejection` listener, (c) persist dev bypass state in `sessionStorage`.

6. **Action buttons**: User wants only 3 icon buttons (Print, Download PDF, Share) plus Save.

## Plan

### Task 1: Fix preview text color and typography
**File: `src/components/lesson-plans/LessonPlanPreview.tsx`**
- Force `color: #1a1a1a` on the content div to override dark theme prose colors
- Reduce font sizes: `prose-sm` with explicit overrides for h1 (14px), h2 (13px), h3 (12px), body text (11px)
- Ensure all text inside the white paper area is dark-colored regardless of theme

### Task 2: Fix white screen crash with error handling
**File: `src/pages/pedagogico/PlanoAulasPage.tsx`**
- Wrap `handleGenerate` in `try/catch` with toast error feedback
- Prevent unhandled promise rejection from crashing the app

**File: `src/App.tsx`**
- Add global `unhandledrejection` event listener in App component to prevent white screen crashes

**File: `src/contexts/AuthContext.tsx`**
- Persist dev bypass user in `sessionStorage` so page reloads don't lose the session
- Restore dev user from `sessionStorage` on mount

### Task 3: PDF download instead of HTML
**File: `src/components/lesson-plans/LessonPlanPreview.tsx`**
- Replace HTML download with a PDF generation approach using `window.print()` to a hidden iframe with `@media print` CSS
- The `handleDownload` function will open the full HTML in a hidden iframe and trigger `print()` with the browser's "Save as PDF" option
- Alternatively, use a simpler approach: open the HTML in a new window with print dialog (same as print, but user can choose "Save as PDF")
- Simplify action bar to 3 icon-only buttons (Printer, Download/PDF, Share) + Save button

### Task 4: Ensure complete plan generation
**File: `supabase/functions/generate-lesson-plan/index.ts`**
- Increase `fullPlanMaxTokens` to 12000 to ensure all 12 sections are generated
- Add stronger instruction at the end of the prompt: "OBRIGATÓRIO: O plano DEVE conter TODAS as 12 secções. NÃO termine antes da secção 12 (Conclusão)."

### Technical Details

**Text color fix** (critical):
```css
/* Force dark text on white paper */
.prose { color: #1a1a1a !important; }
```
Applied via inline style `color: '#1a1a1a'` on the content wrapper div.

**Session persistence for dev bypass**:
```typescript
// On devBypassLogin: 
sessionStorage.setItem('dev_user', JSON.stringify(devUser));

// On AuthProvider mount:
const stored = sessionStorage.getItem('dev_user');
if (stored) dispatch({ type: 'DEV_BYPASS', payload: JSON.parse(stored) });

// On logout:
sessionStorage.removeItem('dev_user');
```

**Error boundary in handleGenerate**:
```typescript
const handleGenerate = async (...) => {
  try {
    const result = await generatePlan.mutateAsync({...});
    setGeneratedContent(result);
  } catch (error) {
    toast.error('Erro ao gerar plano de aula');
  }
};
```

**PDF-style download**: Open full HTML in new tab, user uses browser print > Save as PDF. This is the most reliable cross-browser PDF approach without adding heavy dependencies.

