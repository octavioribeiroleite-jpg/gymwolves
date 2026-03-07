

## Plano: Histórico recente e resumo semanal na Home

### O que será construído

Logo abaixo do card "Treino concluído", dois novos componentes:

1. **Resumo da Semana** — card com 3 métricas: minutos totais, calorias gastas e número de treinos da semana atual (segunda a domingo)
2. **Histórico Recente** — lista dos últimos 5 check-ins do usuário com tipo de treino, duração, calorias e data/hora

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/components/dashboard/WeeklySummary.tsx` | **Novo.** Card com grid 3 colunas usando `StatCard` pattern: ⏱ Minutos, 🔥 Calorias, 💪 Treinos. Calcula a partir dos checkins da semana corrente. |
| `src/components/dashboard/RecentHistory.tsx` | **Novo.** Lista dos últimos 5 checkins com ícone do tipo de treino, título, duração/calorias e data relativa. Cards brancos `surface-1 rounded-2xl border-subtle card-shadow`. |
| `src/pages/Dashboard.tsx` | Importa e renderiza `WeeklySummary` e `RecentHistory` entre `WorkoutStatusCard` e `HomeChallengesList`, passando `allCheckins` como prop. |

### Dados utilizados

Já disponíveis em `allCheckins` (hook `useAllUserCheckins`):
- `duration_min` → minutos da semana
- `calories` → calorias da semana
- `checkin_at` → filtro por semana + data no histórico
- `workout_type`, `title` → exibição no histórico

### Layout

```text
[Treino concluído ✅]
[Resumo da Semana]
  ⏱ 145min  |  🔥 1.2k cal  |  💪 4 treinos
[Histórico Recente]
  • Musculação — 45min, 320 cal — há 2h
  • Corrida — 30min, 280 cal — ontem
  • ...
[Meus Desafios]
```

Segue o padrão visual existente: `rounded-2xl`, `surface-1`, `border-subtle`, `card-shadow`, fonte Inter, cores do design system.

