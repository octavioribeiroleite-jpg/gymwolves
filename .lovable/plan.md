# Curtidas e comentários nos check-ins

## Problema
No Feed da matilha, posts de desafio têm curtir/comentar, mas check-ins (como o da Mirela na print) só mostram a foto — sem nenhuma interação. Por isso "não aparece curtir, comentar etc".

## O que vai ser feito

### 1. Backend (migração)
Criar duas tabelas novas:

- **`checkin_likes`** — `checkin_id`, `user_id`, unique(checkin_id, user_id).
- **`checkin_comments`** — `checkin_id`, `user_id`, `text`.

RLS: qualquer membro de um grupo onde o check-in está pode ver/curtir/comentar. Só o autor pode editar/excluir o próprio comentário. Curtida só o próprio dono remove.

Contadores via subselect no hook (sem coluna desnormalizada por ora, mantém simples).

### 2. Componente `CheckinFeedItem`
Adicionar embaixo do card (mesmo padrão visual do `PostCard`):
- Botão coração (curtir/descurtir) com contador
- Botão balão com contador de comentários
- Preview dos últimos 2 comentários + "Ver todos os X comentários"
- Input inline "Adicione um comentário..." com botão Publicar

### 3. Hooks novos
- `useCheckinLikes(checkinIds)` — retorna Set de IDs curtidos pelo usuário + contagens
- `useToggleCheckinLike()`
- `useCheckinComments(checkinId)` + `useAddCheckinComment()`

Mesmas convenções dos hooks de `challenge_posts` (invalidate queries, optimistic update no like).

### 4. HomeFeed
Passar `likedSet` e `onLike` pro `CheckinFeedItem`, igual já faz com `PostCard`.

## Fora de escopo
- Editar/excluir check-in (não pediu)
- Notificações de curtida/comentário
- Reações além de coração

Confirma que pode seguir? Depois disso eu implemento de uma vez.