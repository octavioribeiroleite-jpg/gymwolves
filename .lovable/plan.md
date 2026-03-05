
## Problema

O `HomeChallengeCard` navega para `/group/${group.id}` (linha 68), mas a rota definida no `App.tsx` é `/grupos/:id/detalhes` (linha 54). Resultado: 404.

## Correção

Alterar a navegação no `HomeChallengeCard.tsx` de `/group/${group.id}` para `/grupos/${group.id}/detalhes`.

### Arquivo afetado
- `src/components/dashboard/HomeChallengeCard.tsx` -- corrigir a URL de navegação na função `handleClick`
