

## Problemas Identificados

1. **"(opcional)" nos labels do formulário** — aparece em 4 locais do `renderField`; remover todos.
2. **Fontes demasiado grandes na pré-visualização** — o `fontSize: '12px'` no ecrã está correcto mas os `<h1>` a `16px` e o `prose-sm` estão a inflacionar; reduzir h1→13px, h2→12px, h3→11px, body→11px **apenas no ecrã** (manter os tamanhos actuais na folha `@media print`).
3. **Informações duplicadas no início do plano** — a IA gera um bloco `<div class="header-info">` com Escola/Professor/Turma/Disciplina que já consta no cabeçalho institucional. Solução: (a) instruir a IA no prompt para **não** gerar esse bloco; (b) limpar no frontend com regex caso venha.
4. **Erro "teacher_id null"** — em modo demo o `supabase.auth.getUser()` retorna `null`. Bloquear o botão Guardar e mostrar toast informativo quando não houver sessão real.
5. **Linhas divisórias cabeçalho/rodapé** — remover `border-bottom` do cabeçalho institucional e `border-top` do rodapé na pré-visualização (e nos `@page` styles).
6. **Ecrã branco / refresh inesperado** — o `onAuthStateChange` dispara com `session=null` quando o token anon expira ou uma query falha, causando logout. Solução: ignorar eventos `SIGNED_OUT` quando existe `sge_dev_user` no sessionStorage; adicionar `staleTime` ao QueryClient para reduzir re-fetches agressivos; envolver o `handleSession` numa protecção.

## Plano de Implementação

### Ficheiro 1: `src/components/lesson-plans/LessonPlanForm.tsx`
- Remover as 4 instâncias de `{isOptional && <span className="text-muted-foreground font-normal ml-1">(opcional)</span>}` nos blocos select, multiselect, textarea e text input do `renderField`.

### Ficheiro 2: `src/components/lesson-plans/LessonPlanPreview.tsx`
- **Ecrã**: Reduzir inline style `fontSize` de `12px` → `11px`. Nos `A4_STYLES`, reduzir h1→13px, h2→12px, h3→11px, p/li→11px.
- **Print styles**: Manter h1 16px, h2 14px, h3 13px, body 12px (bons para impressão). Adicionar bloco `@media print` com tamanhos maiores.
- Remover `border-bottom` do `.header-bar` e `border-top` do rodapé no ecrã.
- Na `cleanContent`, adicionar regex para remover blocos `<div class="header-info">...</div>` gerados pela IA.

### Ficheiro 3: `src/pages/pedagogico/PlanoAulasPage.tsx`
- No `handleSave`: antes de chamar `savePlan.mutate`, verificar se `user?.id?.startsWith('dev-')`. Se sim, mostrar toast "Funcionalidade disponível apenas com sessão autenticada" e retornar sem salvar.

### Ficheiro 4: `src/contexts/AuthContext.tsx`
- No listener `onAuthStateChange`: quando `event === 'SIGNED_OUT'`, verificar se existe `sge_dev_user` no sessionStorage; se existir, **restaurar** o dev user em vez de fazer logout. Isto impede o ecrã branco.
- Adicionar `try/catch` no `handleSession` para evitar que erros inesperados crashem o estado.

### Ficheiro 5: `src/App.tsx`
- Configurar `QueryClient` com `defaultOptions.queries.staleTime: 5 * 60 * 1000` e `retry: 1` para reduzir re-fetches agressivos que podem disparar erros em cascata.

### Ficheiro 6: `supabase/functions/generate-lesson-plan/index.ts`
- Na secção `INFORMAÇÕES GERAIS` do prompt, reforçar: **"NÃO crie blocos de dados da escola, professor, turma ou disciplina. NÃO inclua `<div class='header-info'>`. Comece directamente pelo título `<h1>PLANO DE AULA AEP</h1>` seguido de `<h2>1. 📌 INFORMAÇÕES GERAIS</h2>`."**

### Detalhe Técnico: Protecção contra ecrã branco

```typescript
// AuthContext.tsx — dentro do onAuthStateChange
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    try {
      const stored = sessionStorage.getItem('sge_dev_user');
      if (stored) {
        dispatch({ type: 'DEV_BYPASS', payload: JSON.parse(stored) });
        return; // Não fazer logout
      }
    } catch {}
  }
  handleSession(session);
});
```

```typescript
// PlanoAulasPage.tsx — handleSave
const isDevUser = user?.id?.startsWith('dev-');
if (isDevUser) {
  toast({ title: 'Sessão de demonstração', description: 'Guardar planos requer autenticação real. Use Imprimir ou Descarregar PDF.', variant: 'destructive' });
  return;
}
```

