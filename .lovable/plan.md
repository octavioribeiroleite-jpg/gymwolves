

## Diagnóstico: Contagens de treinos e check-in em todos os desafios

### Problema raiz identificado

A query `useUserActiveChallenges` retorna `[]` (vazio) porque o usuário **não tem registros na tabela `challenge_participants`**. O app tem dois sistemas paralelos:

1. **`groups` + `group_members`** — onde o usuário realmente está (2 grupos ativos)
2. **`challenges` + `challenge_participants`** — tabela separada, vazia para este usuário

Como `activeChallenges` é `[]`, o batch (`useCreateCheckinAll`) nunca executa. O fallback usa `createCheckin` com apenas 1 `groupId`, registrando o treino em apenas 1 grupo.

### Problema nas métricas do Dashboard

`globalStats` usa `useGroupCheckins(activeGroupId)` que só carrega checkins de **um grupo**. As métricas (sequência, dias ativos, recorde) refletem apenas o grupo ativo, não o total real do usuário.

### Plano de correção

| Arquivo | Alteração |
|---|---|
| `src/hooks/useUserChallenges.ts` | Refatorar `useUserActiveChallenges` para buscar os grupos do usuário via `group_members` (que funciona) em vez de depender de `challenge_participants` (que está vazio). Retornar `{ challengeId: group.id, groupId: group.id }` para cada grupo ativo. |
| `src/pages/Dashboard.tsx` | Substituir a query de checkins de um único grupo por uma query que busca checkins do usuário em **todos os seus grupos**, para que as métricas globais (streak, dias ativos, recorde) sejam corretas. |
| `src/hooks/useCheckins.ts` | Adicionar hook `useAllUserCheckins` que busca checkins do usuário em todos os seus grupos (usando os IDs dos grupos do `useUserGroups`). |

### Fluxo corrigido

```text
Dashboard abre
  ├─ useUserGroups → [grupo1, grupo2] (funciona!)
  ├─ useUserActiveChallenges → usa group_members → [{groupId: g1}, {groupId: g2}]
  ├─ useAllUserCheckins → checkins de TODOS os grupos
  ├─ globalStats → streak/dias/recorde calculados sobre TODOS os checkins
  └─ CheckinDialog → batch insere em TODOS os grupos
```

### Detalhes técnicos

**`useUserActiveChallenges` refatorado:**
- Buscar `group_members` do usuário com `status=active`
- Para cada grupo, retornar como `ActiveChallenge` usando `group_id` tanto para `challengeId` quanto `groupId`
- Isso garante que o batch funcione com os dados existentes

**`useAllUserCheckins`:**
- Recebe array de `groupId`s dos grupos do usuário
- Faz query: `checkins.in('group_id', groupIds)` filtrado pelo `user_id`
- Usado no Dashboard para calcular métricas globais

**`useCreateCheckinAll`:**
- Já funciona corretamente para inserir checkins em múltiplos grupos
- Remover a parte que insere `workout_logs` (tabela `challenges` não está sendo usada)
- Ou manter mas tratar erro silenciosamente se `challenge_participants` estiver vazio

