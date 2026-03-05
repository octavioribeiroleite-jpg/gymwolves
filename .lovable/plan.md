

## Remover linha divisória do header

A linha cinza visível entre o header e o conteúdo é causada pela classe `border-b border-subtle` nos headers.

### Alterações

1. **`src/components/dashboard/DashboardHeader.tsx`** (linha 11): Remover `border-b border-subtle` do `<header>`
2. **`src/components/ds/AppScaffold.tsx`** (linha 27): Remover `border-b border-subtle` do `<header>`

Isso faz o header e o conteúdo ficarem visualmente contínuos, tudo na mesma cor de fundo.

