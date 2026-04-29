# Finalização automática de competições

## Objetivo
Quando um grupo do tipo `challenge` passa de `end_date`, marcá-lo como `finished` automaticamente e refletir isso na UI (sumir das listas ativas, aparecer em "Desafios concluídos").

## Migration 1 — Coluna `status` em `groups`
- `ALTER TABLE groups ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`
- `CHECK (status IN ('active','finished'))`
- Backfill imediato: marcar `finished` os grupos `type='challenge'` com `end_date < CURRENT_DATE`
- Index parcial em `(status)` para acelerar o filtro de listagens

## Migration 2 — Extensões + cron horário
- `CREATE EXTENSION IF NOT EXISTS pg_cron;`
- `CREATE EXTENSION IF NOT EXISTS pg_net;` (incluída para uso futuro)
- Função `public.finalize_expired_groups()` (SECURITY DEFINER, search_path travado):
  ```text
  UPDATE groups
     SET status = 'finished'
   WHERE status = 'active'
     AND type = 'challenge'
     AND end_date IS NOT NULL
     AND end_date < CURRENT_DATE;
  ```
- `cron.schedule('finalize-expired-groups', '0 * * * *', 'SELECT public.finalize_expired_groups();')` — roda toda hora cheia
- Idempotente: só toca em linhas ainda `active`. Grupos sem `end_date` ou tipo não-challenge nunca finalizam.

## Frontend — usar `status` em vez de comparar datas

| Arquivo | Mudança |
|---|---|
| `src/hooks/useGroupData.ts` → `useUserGroups` | Filtrar `status='active'` por padrão |
| `src/hooks/useGroupData.ts` (novo) → `useCompletedGroups` | Lista grupos com `status='finished'` |
| `src/hooks/useUserChallenges.ts` → `useUserActiveChallenges` | Filtrar grupos ativos no join |
| `src/pages/CompletedChallenges.tsx` | Substituir EmptyState estático por lista real, card com nome/período/badge "Concluído" |
| `src/components/dashboard/HomeChallengeCard.tsx` | "Dias restantes" só se `status='active'`; senão badge "Concluído" |
| `src/pages/GroupList.tsx` | Mesma regra de exibição condicional |
| `src/pages/Ranking.tsx`, `src/pages/InviteScreen.tsx`, `src/components/challenge/ChallengeGeneralTab.tsx` | "Dias restantes" condicionado a `status='active'` |
| `src/contexts/ActiveGroupContext.tsx` | Se o grupo ativo virar `finished`, limpar a seleção |

Grupos finalizados continuam acessíveis via link/detalhe — só somem das listas "em andamento".

## Detalhes técnicos
- Tipos do Supabase (`src/integrations/supabase/types.ts`) regenerados automaticamente após a migration.
- RLS atual mantida; o cron roda como superuser via SECURITY DEFINER.
- Tabela legada `challenges` permanece intocada (não usada pela UI).

## Fora do escopo
- Notificação ao usuário quando um desafio finaliza.
- Snapshot de ranking final / premiação.
- Migrar a tabela `challenges` legada.
