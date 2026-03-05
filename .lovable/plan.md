

## Remover linha persistente no header do GroupDetails

O problema está na página `GroupDetails.tsx`. O `<header>` na linha 94 tem `border-b border-subtle`, e dentro dele o container das tabs (linha 107) também tem `border-b border-subtle`. Isso cria uma linha visível extra abaixo da barra de status/header.

### Alteração

**`src/pages/GroupDetails.tsx`** — Remover `border-b border-subtle` do elemento `<header>` (linha 94), mantendo apenas o `border-b` do container das tabs que é necessário para o indicador ativo.

