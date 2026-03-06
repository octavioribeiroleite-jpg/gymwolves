

## Plano: Corrigir preview da foto + Adicionar opção de excluir check-in do dia

### 1. Corrigir preview da foto (sem corte)

| Arquivo | Alteração |
|---|---|
| `src/components/checkin/CheckinFullWizard.tsx` | Linha 236: trocar `h-40 object-cover` por `max-h-[60vh] w-full object-contain` |

### 2. Adicionar exclusão do check-in de hoje

Quando o usuário já fez check-in hoje, o `WorkoutStatusCard` mostra "Treino concluído!". Vamos adicionar a possibilidade de desfazer:

| Arquivo | Alteração |
|---|---|
| `src/components/dashboard/WorkoutStatusCard.tsx` | Adicionar botão "Desfazer" (ícone X ou Trash) que aparece quando `todayDone=true`. Ao clicar, abre um `AlertDialog` de confirmação ("Tem certeza que deseja remover o treino de hoje?"). Ao confirmar, chama `onDelete`. |
| `src/pages/Dashboard.tsx` | Buscar o check-in de hoje nos `checkins` carregados, passar o `id` para o `WorkoutStatusCard`. Usar `useDeleteCheckin` para deletar o check-in e também deletar o `workout_log` correspondente do dia. |
| `src/hooks/useCheckins.ts` | Criar hook `useDeleteTodayCheckins` que deleta todos os checkins do usuário de hoje em todos os grupos + deleta os `workout_logs` do dia. Invalida queries relevantes. |

### Fluxo do usuário

```text
[Treino concluído! 💪]  ← toca no card
   ↓
AlertDialog: "Deseja remover o treino de hoje?"
   [Cancelar]  [Remover]
   ↓ (Remover)
Deleta checkins de hoje + workout_logs do dia
Toast: "Treino removido"
Card volta para "Registrar treino"
```

