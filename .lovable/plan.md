# Correção do crash na Landing Page (React error #310)

## Causa

O componente `CommandPalette` (montado globalmente em `App.tsx`) viola as **Rules of Hooks**:

```tsx
const items = useMemo(...)           // ✅ hook 1
if (!isAuthenticated) return null;   // ❌ early return ANTES de todos os hooks
const groups = useMemo(...)          // ❌ hook 2 — só corre se autenticado
```

Quando o `AuthContext` resolve o estado (de `isLoading` → `isAuthenticated=false` ou vice-versa), o número de hooks chamados muda entre renders → React lança o erro **#310** ("Rendered more hooks than during the previous render"). É isto que faz a LandingPage rebentar com "Algo correu mal".

## Correção

**Ficheiro:** `src/components/shared/CommandPalette.tsx`

1. Mover o `useMemo` de `groups` para **antes** do `if (!isAuthenticated) return null;`.
2. Mover também o atalho global `Cmd+K` para só registar listener quando autenticado (opcional mas limpo) — manter como está está OK desde que continue a ser um `useEffect` antes do return.
3. Manter a ordem: todos os hooks (`useState`, `useEffect`, `useMemo` items, `useMemo` groups) → depois o `if (!isAuthenticated) return null;` → depois o JSX.

Resultado: ordem dos hooks fica estável entre renders autenticados e não autenticados, eliminando o erro #310 e restaurando a Landing Page.

## Verificação

- Abrir `/` (landing) sem sessão → deve carregar normalmente.
- Fazer login → `Cmd+K` continua a abrir a palette.
- Fazer logout no dashboard → não deve crashar.

## Fora de âmbito

Nenhuma outra alteração à Fase 2 — apenas hotfix de regressão introduzida pelo CommandPalette.