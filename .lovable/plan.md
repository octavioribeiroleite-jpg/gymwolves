

## Plano: Editar configurações do grupo (admin)

### O que será feito

Adicionar um botão "Editar" na tela de detalhes do grupo, visível apenas para o criador/admin. Ao clicar, abre um Drawer (mobile) ou Dialog (desktop) com formulário para editar: nome, meta de treinos, datas de início/fim e sistema de pontuação.

### Alterações

1. **`src/hooks/useGroupData.ts`** — Adicionar hook `useUpdateGroup` (mutation que faz `supabase.from("groups").update(...)` filtrando pelo `id` do grupo)

2. **`src/pages/GroupDetails.tsx`** — Adicionar:
   - Verificação se o usuário logado é o `created_by` do grupo (admin)
   - Botão "Editar" no header ou no card de info (visível só para admin)
   - State para controlar abertura do modal de edição
   - Componente `EditGroupDialog` inline ou importado

3. **`src/components/EditGroupDialog.tsx`** (novo) — Drawer/Dialog responsivo com:
   - Campos: nome, meta de treinos (`goal_total`), data início, data fim, sistema de pontuação
   - Usa o hook `useUpdateGroup` para salvar
   - Usa `useIsMobile` para alternar entre Drawer e Dialog

### Segurança
A tabela `groups` já permite `UPDATE` via RLS para membros do grupo. A verificação de `created_by` no frontend garante que só o criador veja o botão. Para segurança extra, podemos adicionar uma policy RLS que restringe UPDATE ao `created_by`.

