# Tela "Atualizar check-ins"

## Objetivo
Permitir que o usuário recupere check-ins esquecidos selecionando vários dias faltantes do mês de uma vez e marcando todos como treinados em um único clique.

## Fluxo
1. Na Dashboard, o link **"Esqueceu algum dia? Atualizar check-ins"** (já existe em `WorkoutStatusCard`) passa a navegar para `/atualizar-checkins` em vez de só rolar até o heatmap.
2. A nova tela mostra:
   - Header com título e botão voltar.
   - Seletor de mês (← mês →, sem permitir mês futuro).
   - Lista vertical agrupando os dias **faltantes** do mês (passados, sem check-in, excluindo hoje e dias antes da entrada do usuário no primeiro grupo — opcional, ver técnico).
   - Cada item: data ("Quarta, 8 de mai"), dia da semana, checkbox à direita.
   - Ações no topo da lista: **"Selecionar todos"** / **"Limpar"** + contador "X dias selecionados".
   - Empty state: "Nenhum dia faltante neste mês 🎉".
3. Botão fixo no rodapé: **"Marcar X dias como treinados"** (desabilitado se 0 selecionados).
4. Ao confirmar, dispara `useCreateCheckinAll` (ou `useCreateCheckin`) **uma vez por dia selecionado**, sequencialmente, com `checkinDate` correspondente. Mostra toast de progresso/sucesso e volta para a Dashboard.
5. Cada check-in criado no modo "lote" é tipo **rápido** (`title: "Treino"`, `workout_type: "musculacao"`, sem foto/notas), igual ao "Marcar como ido" do `MarkPastDaySheet`.

## Detalhes técnicos

### Nova rota
- `src/pages/UpdateCheckins.tsx`
- Adicionar `<Route path="/atualizar-checkins" element={<ProtectedRoute><UpdateCheckins /></ProtectedRoute>} />` em `src/App.tsx`.

### Cálculo dos dias faltantes
- Reusa `useAllUserCheckins(allGroupIds)` + `useUserGroups` (mesmo padrão da Dashboard).
- Constrói `Set<string>` de datas com check-in (`yyyy-MM-dd`).
- `eachDayOfInterval(startOfMonth, min(endOfMonth, hoje - 1))`, filtra os que **não** estão no Set. Hoje é excluído (já existe o card principal pra isso).
- Mês atual por padrão; permitir navegar para meses anteriores.

### Estado
- `selectedMonth: Date`
- `selected: Set<string>` (chaves yyyy-MM-dd)
- Toggle por item; "Selecionar todos" preenche com todos os dias faltantes do mês visível.

### Submissão (lote)
- Pega `activeChallenges` via `useUserActiveChallenges` (já usado na Dashboard para `MarkPastDaySheet`).
- Para cada data selecionada, em série (await em loop), chama `createCheckinAll.mutateAsync({ challenges, title: "Treino", workoutType: "musculacao", checkinDate: date })`.
   - Em série para evitar problemas com a verificação de duplicatas dentro do hook.
   - Captura erros individuais sem abortar todo o lote (toast resumo no fim: "X dias marcados, Y já existiam").
- Loading global durante o processo + spinner no botão.
- Ao terminar com sucesso, `navigate(-1)` ou `navigate("/")`.

### Atualização do entry point
- `WorkoutStatusCard.tsx`: o botão "Esqueceu algum dia? Atualizar check-ins" passa a usar `navigate("/atualizar-checkins")` em vez de `onUpdatePastCheckins` (rolar+pulse). Manter o pulse/scroll do heatmap funcionando como caminho secundário, mas o link principal vai para a tela.

### Sem mudanças de schema
- RLS de `checkins` já permite inserir com `checkin_at` arbitrário; nada a migrar.

## Fora do escopo
- Marcar dias com foto/notas em lote (continua via `MarkPastDaySheet` → "Detalhar treino").
- Selecionar múltiplos meses ao mesmo tempo.
- Editar/excluir check-ins existentes nessa tela.
- Selecionar quais desafios receberão o check-in (usa todos os ativos, igual ao "Marcar como ido").
