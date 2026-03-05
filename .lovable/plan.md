

## Comentários Inline Estilo Instagram

Atualmente, ao clicar no ícone de comentários, abre um `Drawer` (bottom sheet). O estilo Instagram mostra os comentários diretamente abaixo do post, inline, com um campo de input para comentar sem sair do feed.

### Alterações

**1. `src/components/challenge/PostCard.tsx`** — Expandir para mostrar comentários inline:
- Ao clicar no ícone de comentários, fazer toggle de uma seção expandível abaixo das ações do post
- Mostrar preview dos 2 últimos comentários sempre visíveis (como o Insta)
- Quando expandido, mostrar todos os comentários + campo de input
- Cada comentário: **nome em bold** + texto na mesma linha, com timestamp discreto
- Input inline com botão "Publicar" no estilo Instagram (texto azul/primary)
- Link "Ver todos os X comentários" quando há mais de 2

**2. `src/components/challenge/ChallengeFeedTab.tsx`** e **`src/components/challenge/ChallengeGeneralTab.tsx`**:
- Remover o `CommentsSheet` e o state `commentPostId`
- O `onComment` no PostCard deixa de ser necessário como prop externa — a lógica fica interna ao PostCard
- Passar `challengeId` ao PostCard para que ele possa buscar/enviar comentários

**3. `src/components/challenge/CommentsSheet.tsx`** — Pode ser removido ou mantido sem uso

### Visual (como na referência)
- Abaixo de likes/comments count: "Ver todos os X comentários" em cinza
- Preview: `**Nome** texto do comentário` em uma linha
- Input: campo com placeholder "Adicione um comentário..." e avatar do usuário logado à esquerda

