

## Plano: Check-in da Home registra em todos os desafios

### Problema atual

O check-in da tela Home está vinculado apenas ao `activeGroupId` (um único grupo). Quando o usuário registra um treino, ele só é salvo nesse grupo, ignorando os outros desafios em que participa.

### Solução

Modificar o fluxo para que, ao fazer check-in pela Home, o treino seja registrado automaticamente em **todos os desafios ativos** do usuário. Isso envolve:

1. **Criar hook `useUserActiveChallenges`** — busca todos os desafios ativos em que o usuário participa (via `challenge_participants` + `challenges` com status `active`)

2. **Modificar `useCreateCheckin`** — adicionar uma variante que aceita múltiplos `groupId`s/`challengeId`s e insere registros em batch:
   - Inserir um `checkin` para cada grupo associado aos desafios ativos
   - Inserir um `workout_log` para cada desafio ativo
   - Tudo numa única mutação

3. **Atualizar `Dashboard.tsx`** — em vez de passar apenas `activeGroupId` ao `CheckinDialog`, passar a lista de todos os desafios/grupos ativos do usuário

4. **Atualizar `CheckinDialog.tsx`** — quando chamado da Home, usar a mutação em batch que registra em todos os desafios de uma vez. Mostrar feedback tipo "Treino registrado em 3 desafios! 💪"

5. **Invalidar queries** — após o check-in em batch, invalidar as queries de checkins de todos os grupos afetados para atualizar a UI

### Alterações por arquivo

| Arquivo | O que muda |
|---|---|
| `src/hooks/useUserChallenges.ts` | **Novo** — hook para buscar todos os desafios ativos do usuário |
| `src/hooks/useCheckins.ts` | Adicionar mutação `useCreateCheckinAll` que insere em múltiplos grupos/desafios |
| `src/pages/Dashboard.tsx` | Passar lista de desafios ativos ao CheckinDialog |
| `src/components/CheckinDialog.tsx` | Suportar modo "todos os desafios" com inserção em batch e feedback adequado |

