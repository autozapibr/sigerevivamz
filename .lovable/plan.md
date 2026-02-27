

## Diagnóstico Completo

### Configuração actual da LLM no backend

| Parâmetro | Valor actual | Problema |
|---|---|---|
| `llm_provider` | `google` (API directa) | Usa Google AI Studio directamente, **não** o Lovable AI Gateway |
| `model` | `google/gemini-2.5-flash` | Tem prefixo `google/` mas o código faz `model.split("/").pop()` → `gemini-2.5-flash` — funciona, mas é o modelo **mais fraco** da família |
| `temperature` | `0.4` | OK, mas para consistência de layout deveria ser **0.2** |
| `max_tokens` | `4000` | Configurado como 4000, mas o código força `Math.max(4000, 12000)` = **12000** — inconsistência |
| Google API Key | **SET** (activa) | Está a usar a chave directa do Google AI Studio |

### Contexto / Memória entre planos

**Cada plano é completamente sem estado (stateless).** A edge function faz uma única chamada `messages: [system, user]` sem qualquer histórico de conversas anteriores. Isto significa:
- Não há memória entre planos
- Cada geração começa do zero
- A IA não aprende com outputs anteriores

Isto **não causa alucinações** directamente — o problema real é a **duplicação e conflito de instruções**.

### Causas raiz dos problemas de layout

1. **Prompt duplicado e conflituante**: O `system_prompt` na base de dados tem uma estrutura completa (CABEÇALHO com Escola/Professor/Turma/Disciplina), **e** o `userPrompt` hardcoded no código (linhas 416-504) tem OUTRA estrutura que diz "NÃO crie blocos de dados da escola". A IA recebe instruções contraditórias.

2. **Modelo fraco**: `gemini-2.5-flash` é o modelo mais barato/rápido — sacrifica precisão em formatação HTML e seguimento de instruções complexas. Para um prompt tão longo e detalhado (~3000 tokens de sistema + ~2000 de contexto + training docs), precisa de um modelo mais capaz.

3. **Limpeza frágil no frontend**: `cleanContent()` tenta remover headers duplicados via regex, mas a IA gera variações que escapam ao padrão.

---

## Plano de Correcção

### 1. Unificar o prompt do sistema (edge function)

- **Remover** o `system_prompt` da tabela `lesson_plan_config` (ou ignorá-lo)
- Manter **apenas** o prompt hardcoded no `userPrompt` da edge function como fonte única de verdade
- Simplificar a instrução de cabeçalho: em vez de "NÃO crie blocos de dados", simplesmente não mencionar cabeçalho e dizer "Comece DIRECTAMENTE com `<h2>1. TEMA</h2>`" — assim a IA não tem duas instruções contraditórias

### 2. Mudar para Lovable AI Gateway com modelo mais capaz

- Alterar `llm_provider` para `lovable_ai`
- Alterar modelo para `google/gemini-2.5-pro` (melhor em seguir instruções complexas de formatação HTML)
- Reduzir temperatura para `0.2` para maior consistência
- Alinhar `max_tokens` para `12000` na config (já é o valor real usado)

### 3. Refactorizar o prompt para eliminar ambiguidade

No `userPrompt` (edge function):
- Remover a secção "INFORMAÇÕES GERAIS" da estrutura obrigatória — esses dados já estão no cabeçalho do `LessonPlanPreview`
- Começar a estrutura directamente pelo **TEMA** como secção 1
- Renumerar as 12 secções para 11 (sem a duplicação do cabeçalho)
- Adicionar um **exemplo de output HTML** (few-shot) com ~200 tokens mostrando exactamente o formato esperado das primeiras 2 secções

### 4. Melhorar a limpeza no frontend (LessonPlanPreview)

- Reforçar o regex de `cleanContent()` para remover qualquer bloco que contenha "Escola:", "Professor:", "Classe/Turma:", "Disciplina:" nos primeiros 500 caracteres
- Remover também `<h1>PLANO DE AULA AEP</h1>` gerado pela IA (já existe no cabeçalho visual do componente)

### 5. Actualizar a config na base de dados

Executar SQL para actualizar:
- `llm_provider` → `lovable_ai`
- `model` → `google/gemini-2.5-pro`
- `temperature` → `0.2`
- `max_tokens` → `12000`
- `system_prompt` → prompt unificado e limpo

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `supabase/functions/generate-lesson-plan/index.ts` | Unificar prompt, adicionar few-shot, remover secção "Informações Gerais" da estrutura |
| `src/components/lesson-plans/LessonPlanPreview.tsx` | Melhorar `cleanContent()` regex |
| `src/components/settings/LLMConfigSection.tsx` | Aumentar limite max_tokens para 12000 no UI |
| Migration SQL | Actualizar `lesson_plan_config` com novos valores |

