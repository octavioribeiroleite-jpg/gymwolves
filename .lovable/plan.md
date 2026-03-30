

## Plano: Pull-to-refresh no Dashboard

Adicionar gesto de "puxar para baixo para atualizar" no painel inicial, funcionando tanto em iOS quanto Android.

### Abordagem

Usar a biblioteca **react-pull-to-refresh** ou implementar manualmente com touch events + framer-motion. Como o app já usa framer-motion, vou implementar um componente `PullToRefresh` customizado com touch events nativos (`touchstart`, `touchmove`, `touchend`) que:

1. Detecta o gesto de arrastar para baixo quando o scroll está no topo
2. Mostra um spinner animado (ícone girando)
3. Dispara o `refetch` de todos os dados do Dashboard (checkins, perfil, desafios)
4. Funciona em PWA standalone no iOS e Android

### Alterações

| Arquivo | Mudança |
|---|---|
| Novo `src/components/PullToRefresh.tsx` | Componente wrapper com touch events + spinner animado |
| `src/pages/Dashboard.tsx` | Envolver conteúdo com `PullToRefresh`, passando função de refresh que revalida queries |

### Detalhes técnicos

- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd` para detectar o gesto
- Threshold de 80px para ativar o refresh
- Spinner com `framer-motion` (rotate animation)
- No refresh: invalidar queries do React Query via `queryClient.invalidateQueries()`
- CSS: `overscroll-behavior-y: contain` no container para evitar o bounce nativo do iOS competir com o componente

