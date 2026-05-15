# Feed estilo Instagram na Home

## Objetivo
Mostrar um feed unificado dos posts (foto + legenda + curtidas + comentários) de todos os desafios dos grupos que o usuário participa, abaixo da seção "Seus grupos" na Dashboard, para incentivar interação social na página inicial.

## O que muda

### 1. Novo hook `useHomeFeed`
Arquivo: `src/hooks/useHomeFeed.ts`

- Busca todos os `challenge_id` em que o usuário é participante ativo (via `challenge_participants`).
- Faz `useInfiniteQuery` em `challenge_posts` com `.in("challenge_id", ids)`, ordenado por `created_at desc`, página de 10.
- Inclui join com `profiles` (display_name, avatar_url) e `challenges` (name) para mostrar autor + nome do desafio no card.
- Reaproveita `useUserLikes` e `useToggleLike` já existentes em `useChallengePosts.ts`.

### 2. Novo componente `HomeFeed`
Arquivo: `src/components/dashboard/HomeFeed.tsx`

- Renderiza header "Feed da matilha".
- Lista os posts usando o `PostCard` já existente (`src/components/challenge/PostCard.tsx`) para manter visual idêntico ao do desafio (foto grande, autor, like, comentário).
- Adiciona um pequeno chip/label com o nome do desafio em cima de cada card (já que agora vem de vários desafios).
- Mostra os 5 primeiros posts inicialmente; botão "Ver mais" carrega próxima página.
- Empty state amigável: "Ninguém postou ainda. Seja o primeiro do seu grupo!" com CTA para abrir o grupo ativo.

### 3. Integração na Dashboard
Arquivo: `src/pages/Dashboard.tsx`

Inserir `<HomeFeed />` logo **abaixo de `<HomeGroupsList />`** e **acima de `<ActivityFeed />`**:

```
1. WorkoutStatusCard
2. WeeklySummary
3. QuickStats
4. HomeChallengesList
5. HomeGroupsList
6. HomeFeed                ← NOVO (Instagram-style)
7. ActivityFeed (compact)  ← mantido (atividade textual rápida)
8. MonthlyHeatmap
9. RecentHistory
```

Opcional: avaliar se `ActivityFeed` ainda faz sentido nessa posição — proposta é manter por enquanto (é mais "log textual" enquanto o feed novo é visual).

## Detalhes técnicos

- **RLS**: `challenge_posts` já tem policy `is_group_member(auth.uid(), challenge_id)`, então qualquer post retornado é automaticamente válido para o usuário. Não precisa de migrations.
- **Performance**: limitar a página inicial a 5 posts; lazy-load das imagens via `loading="lazy"` (já feito no `PostCard`).
- **Like/comentário**: usa as mesmas mutations existentes (`useToggleLike`, `CommentsSheet`), sem duplicação.
- **Navegação**: clicar no chip do desafio leva para `/challenge/{id}` (rota já existente).
- **Cache**: query key `["home-feed", userId]`, invalidada quando um novo post é criado em qualquer desafio (adicionar invalidação em `useCreatePost`).

## Fora do escopo
- Criar post direto da home (continua sendo dentro do desafio via FAB).
- Stories ou reels.
- Notificações de novos posts.
