

## Plano: Check-in automático em todos os desafios

### Problema
O `CheckinDialog` no Dashboard só renderiza quando `activeGroupId` existe (linha 82). Se o usuário não tem um grupo ativo salvo no localStorage, o dialog nunca abre. Além disso, o `todayDone` só verifica checkins do grupo ativo, não de todos os desafios.

O fluxo batch (`useCreateCheckinAll`) já existe e funciona, mas a dependência do `activeGroupId` para abrir o dialog e verificar status é o gargalo.

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/pages/Dashboard.tsx` | 1. Remover a condição `activeGroupId &&` do `CheckinDialog` — usar o primeiro `groupId` dos `activeChallenges` como fallback. 2. Mudar `todayDone` para checar se o usuário já tem `workout_logs` de hoje em qualquer desafio (via query dedicada ou checando `activeChallenges`). 3. Remover a dependência de `useGroupCheckins(activeGroupId)` para o status do dia — criar uma query que busca checkins de hoje do usuário em qualquer grupo. |
| `src/hooks/useCheckins.ts` | Adicionar hook `useHasCheckedInToday` que faz uma query simples: `checkins` do `user_id` com `checkin_at` de hoje, sem filtrar por grupo. Retorna `boolean`. |
| `src/components/CheckinDialog.tsx` | Tornar `groupId` opcional (com fallback para primeiro grupo dos `activeChallenges`). Quando `activeChallenges` tem dados, sempre usar o batch. |
| `src/components/checkin/CheckinQuickMode.tsx` | Tornar `groupId` opcional — quando `activeChallenges` está disponível, ignorar `groupId` e usar batch. |
| `src/components/checkin/CheckinFullWizard.tsx` | Mesma mudança: `groupId` opcional com prioridade para batch via `activeChallenges`. |

### Fluxo corrigido

```text
Dashboard abre
  ├─ Busca activeChallenges (todos os desafios ativos do usuário)
  ├─ Busca se já treinou hoje (query global, sem filtro de grupo)
  ├─ Botão "Registrar treino" → abre CheckinDialog
  │   └─ Passa activeChallenges ao dialog
  │       └─ Quick ou Full → usa useCreateCheckinAll
  │           └─ Insere checkin em TODOS os grupos + workout_log em TODOS os desafios
  └─ Card verde "Treino concluído" ← baseado na query global
```

