

## Plano: Reestruturar hierarquia visual da tela de Desafio

### Resumo

Reorganizar a aba "Geral" para melhorar hierarquia visual, compactar cards, embutir o feed na rolagem principal, e adicionar funcionalidade de edição/exclusão de posts. Também adicionar fotos no ranking.

### Alterações

**1. Header do desafio compacto** (`ChallengeGeneralTab.tsx`)
- Remover ícone Trophy grande do header
- Layout compacto: título + subtexto ("2 membros · Desafio ativo") + datas + barra de progresso h-[6px]
- Reduzir padding de `p-5` para `p-4`, espaçamento interno de `space-y-3` para `space-y-2`

**2. Convite compacto** (`ChallengeGeneralTab.tsx`)
- Layout horizontal em uma única linha: `Código: XXXXXXXX [copiar] [compartilhar]`
- Reduzir altura do código de `py-3 text-[18px]` para `py-1.5 text-[14px]`
- Botões de `h-12 w-12` para `h-9 w-9`
- Padding do card de `p-4` para `p-3`

**3. Ranking** (`ChallengeGeneralTab.tsx`)
- Reduzir padding dos items de `p-4` para `p-3`
- Adicionar avatar/foto nos items do ranking (já existe parcialmente, garantir que apareça)
- Manter estrutura visual atual

**4. Estatísticas mini** (`StatCard.tsx`)
- Reduzir `min-h-[110px]` para `min-h-[70px]`
- Reduzir padding de `p-4` para `p-2.5`
- Ícone de `h-5 w-5 mb-2` para `h-4 w-4 mb-1`
- Número de `text-[22px]` para `text-[18px]`

**5. Feed embutido na aba Geral** (`ChallengeGeneralTab.tsx`)
- Após as estatísticas, adicionar seção "Atualizações" com os últimos posts do feed
- Importar e usar `useChallengePosts`, `useUserLikes`, `useToggleLike` do hook existente
- Renderizar posts usando `PostCard` existente
- Botão "Carregar mais" com paginação

**6. Edição e exclusão de posts** (`PostCard.tsx` + `useChallengePosts.ts`)
- Adicionar menu de 3 pontos (MoreVertical) visível apenas para o autor
- Opções: Editar / Excluir
- Editar: abre dialog com textarea preenchida, salva via mutation
- Excluir: confirma e deleta
- Criar mutation `useUpdatePost` e `useDeletePost` no hook
- Necessita política UPDATE na tabela `challenge_posts` (migração SQL)

**7. FAB menor** (`GroupDetails.tsx`)
- Reduzir de `h-14 w-14` para `h-12 w-12`
- Reduzir shadow de `shadow-lg shadow-primary/30` para `shadow-md shadow-primary/20`

**8. Reordenar seções** na aba Geral:
1. Header (compacto)
2. Convite (compacto)
3. Ranking
4. Estatísticas (mini)
5. Feed ("Atualizações")
6. Botão sair

### Migração de banco de dados

Adicionar política UPDATE para posts do próprio autor:
```sql
CREATE POLICY "Users can update own posts"
ON public.challenge_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Arquivos alterados
- `src/components/challenge/ChallengeGeneralTab.tsx` — compactar + embutir feed
- `src/components/ds/StatCard.tsx` — mini cards
- `src/components/challenge/PostCard.tsx` — menu editar/excluir
- `src/hooks/useChallengePosts.ts` — mutations update/delete
- `src/pages/GroupDetails.tsx` — FAB menor
- Migração SQL para UPDATE policy

