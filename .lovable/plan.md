

## Plano: Check-in retroativo com seleção de data

### O que muda

Adicionar um seletor de data opcional nos dois modos de check-in (Rápido e Completo), permitindo registrar treinos de dias anteriores.

### Alterações

**1. `src/hooks/useCheckins.ts`** — Aceitar parâmetro `checkinDate` opcional nos hooks `useCreateCheckin` e `useCreateCheckinAll`
- Se fornecido, usar essa data no `checkin_at` e `workout_date` ao invés de `new Date()`
- Validar que a data não é futura

**2. `src/components/checkin/CheckinQuickMode.tsx`** — Adicionar seletor de data
- Estado `selectedDate` (default: hoje)
- Botão que abre um Popover com Calendar (shadcn) para selecionar data passada
- Exibir data selecionada formatada; se for hoje, mostrar "Hoje"
- Passar `checkinDate` para os hooks de criação

**3. `src/components/checkin/CheckinFullWizard.tsx`** — Mesmo seletor de data
- Adicionar no início do wizard (step "photo") o mesmo componente de seleção de data
- Propagar para `handleConfirm`

**4. `src/components/checkin/CheckinConfirmation.tsx`** — Exibir a data selecionada (se diferente de hoje) na tela de confirmação

### Componente de seleção de data

Um botão compacto com ícone de calendário + Popover com `Calendar` do shadcn. Restrição: `disabled={(date) => date > new Date()}` para impedir datas futuras. Estilo consistente com os cards existentes (rounded-[16px], bg-secondary).

