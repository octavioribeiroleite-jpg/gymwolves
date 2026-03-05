

## Padronização Visual — Topo Limpo e Imersivo

Após análise de todos os headers e scaffolds do app, identifiquei os pontos que ainda criam linhas visuais indesejadas.

### Alterações por arquivo

**1. `src/pages/InviteScreen.tsx`**
- Linha 59: remover `border-b border-subtle` do `<header>`
- Linha 78: remover `border-b border-subtle` do container de tabs (manter apenas o `border-b-2` individual de cada tab ativa)

**2. `src/pages/GroupDetails.tsx`**
- Linha 107: remover `border-b border-subtle` do container das tabs (manter apenas o indicador `h-[2px] bg-primary` da tab ativa)

**3. Headers com transparência → fundo sólido**
Todos os headers usam `bg-background/95` com `backdrop-blur-xl`, o que pode criar uma sutil separação visual. Trocar para `bg-background` sólido nos seguintes arquivos:
- `src/components/dashboard/DashboardHeader.tsx` (linha 11)
- `src/components/ds/AppScaffold.tsx` (linha 23)
- `src/pages/GroupDetails.tsx` (linha 94)

Nenhuma alteração de funcionalidade, navegação ou estrutura.

