

## Plano: Padronização Global + Grupo Ativo + Multi-grupo na Home

### Contexto

O app já funciona bem. A mudança principal é:
- Tratar "Matilha" como nome de grupo, não como módulo
- Adicionar seção "Seus grupos" na Home
- Enriquecer a tela de Grupos (GroupList) com ranking, dias restantes e ação "Tornar ativo"
- Padronizar visualmente todas as telas
- Tornar o subtítulo do grupo ativo clicável no header

### Alterações

**1. Novo componente `HomeGroupsList.tsx`** — Seção "Seus grupos" na Home
- Mostra até 3 grupos (excluindo o ativo) como mini cards horizontais em scroll
- Cada mini card: nome, progresso (X/Y dias), chip "Ativo" se aplicável
- Botão "Tornar ativo" em cada card (chama `setActiveGroupId`)
- Se houver mais de 3, CTA "Ver todos" → `/grupos`
- Inserir no Dashboard entre `HomeChallengesList` e `ActivityFeed`

**2. `Dashboard.tsx`** — Integrar `HomeGroupsList`
- Importar e renderizar `HomeGroupsList` passando `groups`, `activeGroupId`, `setActiveGroupId`
- Renomear comentário "Atividade da matilha" → "Atividade do grupo"

**3. `DashboardHeader.tsx`** — Subtítulo clicável
- Envolver o nome do grupo ativo em `<Link to="/grupos">` para troca rápida
- Manter estilo atual, apenas adicionar navegação

**4. `GroupList.tsx`** — Enriquecer cards com contexto
- Adicionar chip "Grupo ativo" (verde, `bg-primary/10 text-primary`) no card do grupo ativo
- Adicionar posição do usuário no ranking
- Adicionar dias restantes
- Separar ações: tocar no card → abre detalhes (`/grupos/:id/detalhes`); botão "Tornar ativo" → muda contexto sem navegar
- Borda diferenciada (`border-primary/30`) no card ativo

**5. `HomeChallengesList.tsx`** — Adicionar chip "Ativo" no card do grupo ativo

**6. `AppScaffold.tsx`** — Padronizar spacing global
- Alterar `space-y-4` → `space-y-3` e `px-5` para alinhar com Dashboard
- Manter `py-4`

**7. `BottomNav.tsx`** — Renomear label "Grupos" (já correto, manter)

**8. `SidebarMenu.tsx`** — Renomear seção "Desafio" → "Grupo ativo"

### Padronização visual (aplicar em todas as telas)
- Cards: `rounded-2xl surface-1 border border-subtle` (já usado na maioria)
- Títulos de seção: `text-[13px] font-bold`
- Padding interno: `p-3.5`
- Spacing entre seções: `space-y-3`

### Ordem final da Home
1. Header (subtítulo clicável)
2. Card principal do dia
3. Sua semana
4. Métricas rápidas
5. Desafio ativo (com chip "Ativo")
6. **Seus grupos** (novo)
7. Atividade do grupo ativo
8. Mapa de treinos compacto
9. Últimos check-ins

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| Novo `src/components/dashboard/HomeGroupsList.tsx` | Carrossel de mini cards dos outros grupos |
| `src/pages/Dashboard.tsx` | Inserir HomeGroupsList na posição 6 |
| `src/components/dashboard/DashboardHeader.tsx` | Subtítulo clicável → `/grupos` |
| `src/pages/GroupList.tsx` | Chip ativo, ranking, dias restantes, ações separadas |
| `src/components/dashboard/HomeChallengesList.tsx` | Chip "Ativo" |
| `src/components/ds/AppScaffold.tsx` | `space-y-3 px-5` |
| `src/components/SidebarMenu.tsx` | Renomear "Desafio" → "Grupo ativo" |

### O que NÃO muda
- ActiveGroupContext (já persiste em localStorage)
- Lógica de check-in, notificações, pull-to-refresh
- Hooks de dados existentes
- BottomNav, FAB, cards internos
- Tela de detalhe do grupo (GroupDetails) — já é genérica

