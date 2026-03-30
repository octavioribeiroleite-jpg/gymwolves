

## Plano: Refatoração completa da Home do GymWolves

Reorganizar e refinar visualmente a tela inicial seguindo a referência enviada, priorizando hierarquia visual, escaneabilidade e experiência premium.

### Estrutura final (de cima pra baixo)

1. **Header compacto** — saudação + subtítulo grupo ativo + ícones
2. **Card principal do dia** — status dominante (treinou / não treinou) com foto, tipo, ações
3. **Card "Sua semana"** — meta, anel, métricas, WeekDots
4. **Métricas rápidas** — linha horizontal compacta (sequência, dias ativos, recorde)
5. **Grupo/desafio ativo** — card único do grupo ativo com ranking top 3 e progresso
6. **Atividade da matilha** — preview de 2-3 itens + "Ver feed completo"
7. **Mapa de treinos compacto** — título + botão "Abrir calendário", heatmap colapsado
8. **Últimos check-ins** — máximo 2 itens + "Ver histórico completo"

### Alterações por arquivo

| Arquivo | Mudança |
|---|---|
| `Dashboard.tsx` | Reordenar seções na nova ordem; passar dados do grupo ativo; adicionar padding-bottom para FAB/nav |
| `DashboardHeader.tsx` | Reduzir altura; adicionar subtítulo "Grupo ativo: X" clicável; remover ícone MoreVertical desnecessário |
| `WorkoutStatusCard.tsx` | Redesenhar como card dominante: cenário A (treinou) com foto mini, tipo, hora relativa, botões "Ver check-in" e "Desfazer"; cenário B (não treinou) com CTA verde grande + "Modo rápido" |
| `WeeklySummary.tsx` | Adicionar título "Sua semana" dentro do card; mostrar "Meta semanal: X/Y" com ícone editar; layout mais integrado com métricas em linha |
| `HomeWelcome.tsx` → Renomear para `QuickStats.tsx` | Transformar em linha horizontal compacta (não 3 cards grandes); formato: ícone + valor + label inline, ocupando pouca altura |
| `HomeChallengeCard.tsx` | Refinar: mostrar apenas o grupo ativo, com posição no ranking, dias restantes, top 3 compacto horizontal, botão "Ver ranking" |
| `HomeChallengesList.tsx` | Simplificar: mostrar apenas o grupo ativo (não lista de todos); manter botões criar/entrar abaixo apenas se não houver grupo |
| `ActivityFeed.tsx` | Criar versão compacta para Home: limitar a 3 itens, adicionar botão "Ver feed completo" que navega para a página do grupo |
| `MonthlyHeatmap.tsx` | Criar modo compacto: esconder navegação de mês, mostrar apenas mês atual resumido, botão "Abrir calendário" que expande ou navega |
| `RecentHistory.tsx` | Limitar a 2 itens na Home; adicionar botão "Ver histórico completo" que navega para /historico |
| `DashboardFAB.tsx` | Ajustar posição: `bottom-20` para ficar acima da BottomNav com espaçamento; esconder no scroll down, reaparecer no scroll up |
| `BottomNav.tsx` | Refinar visual: remover borda superior, usar sombra sutil para cima, melhorar espaçamento e estado ativo mais evidente |

### Novos componentes

- `QuickStats.tsx` — substitui HomeWelcome, linha horizontal compacta de 3 métricas
- Nenhum outro componente novo necessário, apenas refatoração dos existentes

### Regras seguidas

- Reutiliza todos os dados e hooks existentes (useAllUserCheckins, useProfile, useUserGroups, etc.)
- Não altera lógica de negócio
- Mantém compatibilidade PWA e responsividade
- Mantém pull-to-refresh, notificações realtime, CheckinDialog
- Foco em CSS/layout/hierarquia, não em funcionalidade nova

