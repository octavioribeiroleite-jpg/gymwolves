# Check-in retroativo simplificado

Hoje já existe um seletor de data dentro do diálogo de check-in (`CheckinDatePicker`), mas ele fica "escondido" dentro do fluxo. A proposta é tornar os dias esquecidos **visíveis e clicáveis** direto no calendário do Dashboard.

## O que muda na experiência

1. **Mapa de treinos vira interativo para dias passados sem check-in**
   - Hoje: só dias com treino são clicáveis (abrem detalhes).
   - Novo: dias passados **sem** check-in (do mês corrente e meses anteriores) viram clicáveis também, com um leve ícone "+" sobreposto no hover/active, indicando "marcar como feito".
   - Ao tocar, abre um mini-sheet "Marcar treino em [data]" com:
     - Botão grande **"Marcar como ido"** (cria check-in rápido — modo rápido, sem foto/IA, com `checkinDate` daquele dia)
     - Link secundário **"Detalhar treino"** que abre o wizard completo já com a data pré-selecionada
     - Botão **Cancelar**

2. **Atalho "Atualizar check-ins" no card do dia (`WorkoutStatusCard`)**
   - Adicionar um link discreto abaixo do card: **"Esqueceu algum dia? Atualizar check-ins"**.
   - Ao clicar, faz scroll suave até o `MonthlyHeatmap` e o expande automaticamente, destacando visualmente (pulse 1x) os dias passados sem check-in do mês.

3. **Indicação visual dos dias "faltando"**
   - No grid do calendário, dias passados sem check-in (≠ futuro, ≠ hoje) ganham uma borda tracejada sutil em `border-muted-foreground/30` para sinalizar "disponível para marcar".
   - Hoje já é mostrado com borda primária; mantém.

## Detalhes técnicos

- **`MonthlyHeatmap.tsx`**
  - Adicionar prop opcional `onMarkPastDay?: (date: Date) => void`.
  - Tornar células `past && !done && !future` clicáveis chamando `onMarkPastDay(cell.date)`.
  - Adicionar estilo tracejado nessas células.
  - Aceitar prop `highlightMissing?: boolean` para o efeito pulse temporário.

- **Novo componente `MarkPastDaySheet.tsx`** (drawer/dialog responsivo igual ao `CheckinDialog`)
  - Recebe `date`, `groupId`/`activeChallenges`, callbacks.
  - "Marcar como ido" usa `useCreateCheckinAll` (ou `useCreateCheckin`) com `checkinDate` no parâmetro — a lógica já existe e fixa em `12:00:00 UTC`.
  - "Detalhar" dispara `dispatchCheckinOpen()` com a data, exigindo extensão do evento para aceitar `initialDate` (atualizar `useCheckinEvent.ts` e `CheckinDialog`/`CheckinFullWizard` para consumir).

- **`Dashboard.tsx`**
  - Passar `onMarkPastDay` ao `MonthlyHeatmap` que abre o `MarkPastDaySheet`.
  - Estado `highlightMissing` ativado pelo botão do `WorkoutStatusCard`.

- **`WorkoutStatusCard.tsx`**
  - Adicionar link "Esqueceu algum dia? Atualizar check-ins" com `onClick` que chama um callback novo `onUpdatePastCheckins`.

- **Sem mudanças de schema/RLS** — `checkins` já permite inserir com `checkin_at` arbitrário.

## Fora de escopo
- Editar/excluir check-ins passados (já existe via heatmap details parcialmente).
- Marcar múltiplos dias de uma vez (multi-select) — pode vir depois se útil.
