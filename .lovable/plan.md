# Home enxuta + Feed unificado de grupos

## Objetivo
1. Tirar da Home as seções "Desafio ativo" e "Seus grupos" — essas listas ficam **somente** na aba "Grupos" (bottom nav).
2. Reforçar o feed: misturar **posts** dos desafios + **check-ins** dos membros dos grupos em um único feed cronológico, sempre com o nome do grupo/desafio em cima de cada item, para incentivar interação.

## O que muda

### 1. `src/pages/Dashboard.tsx`
- Remover `<HomeChallengesList />` e `<HomeGroupsList />`.
- Remover o `<ActivityFeed groupId={activeGroupId} compact />` (será substituído pelo feed unificado).
- Manter ordem nova:
  1. `DashboardHeader`
  2. `WorkoutStatusCard`
  3. `WeeklySummary`
  4. `QuickStats`
  5. **`HomeFeed`** (agora unificado, expandido)
  6. `MonthlyHeatmap` (compact)
  7. `RecentHistory` (compact)
- Imports de `HomeChallengesList` e `HomeGroupsList` removidos.

### 2. `src/components/dashboard/HomeFeed.tsx` — virar feed unificado
- Renomear o título para `"Feed da matilha"` (já está).
- Mudar a fonte de dados: passa a usar um novo hook `useHomeUnifiedFeed` que retorna itens normalizados de dois tipos:
  - `{ type: "post", id, createdAt, post, challengeName, groupId }`
  - `{ type: "checkin", id, createdAt, checkin, groupName, groupId }`
- Renderiza dois sub-componentes:
  - **PostFeedItem** → reutiliza `PostCard` existente, com chip do nome do desafio em cima (já existe).
  - **CheckinFeedItem** → novo card simples (foto opcional, nome do autor, título do treino, duração/kcal, "ido em <data>"), com chip do nome do grupo em cima.
- Botão "Ver mais" mantém paginação.

### 3. Novo hook `src/hooks/useHomeUnifiedFeed.ts`
- Busca em paralelo:
  - `challenge_posts` dos desafios em que o usuário participa (igual ao hook atual).
  - `checkins` dos grupos do usuário (`useUserGroups` → ids; `.in("group_id", ids)`, ordenado por `checkin_at desc`, limit 30).
- Mescla as duas listas em um array único, ordenado por `created_at` / `checkin_at` desc.
- Pagina via `useInfiniteQuery` simples com cursor por timestamp; página inicial = 8 itens.
- Cache key: `["home-unified-feed", userId]`.

### 4. Novo componente `src/components/dashboard/CheckinFeedItem.tsx`
- Card visual:
  - Header: avatar/initials + nome + "treinou no <Grupo>" + tempo relativo.
  - Se `proof_url`: imagem em destaque (estilo Instagram, `object-contain max-h-[60vh]`).
  - Footer: ícone de halter + título; chips de duração/kcal/distância quando existirem; nota.
- Sem like/comentário (check-in não tem essa interação no schema atual — fora do escopo).

### 5. `BottomNav` / aba Grupos
- A aba `Grupos` já navega para `/grupos` (página `GroupList`) que já lista todos os grupos com "Tornar ativo" — nada a mudar.

## Detalhes técnicos
- RLS: `checkins` já tem `is_group_member` policy → só virão check-ins dos grupos do usuário automaticamente.
- Para enriquecer cada check-in com `display_name`/`avatar_url` do autor, fazer join `profiles:user_id(...)` no select. Para nome do grupo, join `groups:group_id(name)`.
- Deduplicação: cada check-in já é uma linha por `(user, group, dia)`. Se o usuário fez check-in na mesma data em N grupos, vão aparecer N cards (um por grupo) — aceitável, já que o chip do grupo difere e foi a regra de ranking.
  - Opcional (futuro): agregar pelo par `(user_id, yyyy-MM-dd)` mostrando "treinou em N desafios". **Fora do escopo agora**.
- Atualização em tempo real: não adicionamos realtime aqui (memory regra: realtime só no chat). `useInfiniteQuery` com `refetchOnWindowFocus` resolve.

## Fora do escopo
- Like/comentário em check-ins.
- Filtro do feed por grupo.
- Realtime para novos posts/check-ins.
- Stories.
