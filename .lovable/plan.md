

## Plano: Reestruturar a Home em seções claras

### Problema atual
O Dashboard mostra tudo misturado: saudação, status do treino, progresso, stats, feed de atividade e ranking -- tudo no mesmo fluxo linear, amarrado a um único grupo ativo. Fica difícil visualizar os desafios e seus dados.

### Nova estrutura da Home

```text
┌─────────────────────────────────┐
│  Header (menu + notificações)   │
├─────────────────────────────────┤
│  "Olá, Octávio 👋"             │
│  Resumo pessoal: sequência,     │
│  dias ativos, treino de hoje    │
├─────────────────────────────────┤
│  WorkoutStatusCard (check-in)   │
├─────────────────────────────────┤
│  SEÇÃO: "Meus Desafios"        │
│  ┌─ GroupCard (desafio 1) ────┐ │
│  │ Nome, dias restantes       │ │
│  │ Mini ranking top 3 inline  │ │
│  │ Meu progresso (barra)      │ │
│  └────────────────────────────┘ │
│  ┌─ GroupCard (desafio 2) ────┐ │
│  │ ...                        │ │
│  └────────────────────────────┘ │
│  [+ Criar/Entrar]              │
├─────────────────────────────────┤
│  Atividade recente (feed)       │
└─────────────────────────────────┘
```

### Mudanças

**1. Novo header da Home (`DashboardHeader.tsx`)**
- Trocar o nome do grupo pelo greeting: "Olá, {nome} 👋"
- Manter menu lateral e notificações

**2. Seção de boas-vindas + métricas pessoais (novo componente `HomeWelcome.tsx`)**
- Saudação personalizada com nome do perfil
- Stats gerais do usuário (sequência atual, total de dias ativos) agregados de TODOS os grupos
- Botão de check-in (WorkoutStatusCard) logo abaixo

**3. Seção "Meus Desafios" (novo componente `HomeChallengesList.tsx`)**
- Usa `useUserGroups()` para listar TODOS os grupos do usuário (não só o ativo)
- Cada card de desafio mostra:
  - Nome do desafio + ícone de tipo (troféu/escudo)
  - Dias restantes (se challenge com end_date)
  - Quantidade de membros
  - Mini ranking inline: top 3 com avatares + medalhas em uma linha
  - Barra de progresso pessoal (dias/meta)
- Ao clicar em um card, navega para a página de detalhes do grupo (ou seta o grupo como ativo)
- Botões "Criar desafio" e "Entrar com código" no final

**4. Novo componente `HomeChallengeCard.tsx`**
- Card expandido para cada grupo com:
  - Header: nome + badge de tipo + membros count
  - Mini podium horizontal (top 3 avatares com medalhas)
  - Progress bar pessoal
  - Footer: dias restantes

**5. Refatorar `Dashboard.tsx`**
- Remover a dependência de `activeGroupId` para a home inteira
- A home agora mostra todos os grupos
- O `activeGroupId` continua sendo usado apenas para o check-in dialog
- Estrutura: `HomeWelcome` > `WorkoutStatusCard` > `HomeChallengesList` > `ActivityFeed` (do grupo ativo)

### Arquivos afetados
- `src/pages/Dashboard.tsx` — reestruturar layout
- `src/components/dashboard/DashboardHeader.tsx` — greeting com nome
- `src/components/dashboard/HomeWelcome.tsx` — novo, saudação + stats globais
- `src/components/dashboard/HomeChallengeCard.tsx` — novo, card de desafio com mini ranking
- `src/components/dashboard/HomeChallengesList.tsx` — novo, lista de desafios na home

