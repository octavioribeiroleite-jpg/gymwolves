

## Plano: Compartilhar o app e link do desafio (destaque)

### O que será feito

1. **Perfil (`src/pages/Profile.tsx`)** — Adicionar "Compartilhar o app" como **primeiro item** do menu, com ícone `Share2` e cor primária destacada. Ao clicar, usa `navigator.share()` (mobile) ou copia o link `https://gymwolves.lovable.app` com toast de confirmação. Não navega para outra rota, executa a ação direto.

2. **Detalhes do grupo (`src/pages/GroupDetails.tsx`)** — Melhorar a função `shareCode` para incluir o link do app na mensagem:
   ```
   Entre no desafio "Nome"! Código: XXXX
   Baixe o app: https://gymwolves.lovable.app
   ```

3. **Menu lateral (`src/components/SidebarMenu.tsx`)** — Adicionar "Compartilhar o app" como **primeiro item** da seção "Geral" com ícone `Share2` e cor primária (ao invés de `text-muted-foreground`), para destacar visualmente.

### Detalhes técnicos

- A ação de compartilhar usa `navigator.share()` quando disponível (mobile/PWA) e fallback para `navigator.clipboard.writeText()` + toast.
- Nenhuma alteração de banco de dados necessária.

