

## Plano: Limpar dados + Ranking automático na página do grupo

### Parte 1: Limpar dados do banco
Vou apagar todos os registros das tabelas de dados (checkins, group_members, groups) para resetar o app. Perfil do usuário será mantido.

SQL a executar via insert tool:
```sql
DELETE FROM checkins;
DELETE FROM group_members;
DELETE FROM groups;
```

### Parte 2: Após criar grupo, redirecionar para página do grupo com ranking embutido

Atualmente ao criar um grupo, o usuário vai para a tela de convite (`/grupos/:id/convidar`). O fluxo será:

1. **Criar grupo -> ir direto para a página do grupo** (não mais para convite isolada)
2. **Nova página `GroupDetails` reformulada** que inclui tudo em uma tela só:
   - Header com nome do desafio, datas, barra de tempo
   - Código de convite com botão copiar/compartilhar
   - **Ranking completo inline** (já aparece o criador em 1o lugar com 0 dias)
   - Conforme membros entram e fazem check-in, o ranking atualiza automaticamente
   - Botão de check-in flutuante

### Estrutura da nova página do grupo

```text
┌─────────────────────────────────┐
│  ← Voltar          Detalhes ⚙️  │
├─────────────────────────────────┤
│  🏆 Nome do Desafio             │
│  📅 01 Mar - 31 Dez · 305 dias  │
│  ▓▓▓▓▓░░░░░░░░░░  12% tempo    │
├─────────────────────────────────┤
│  Código: A3F8B2C1  [Copiar]    │
├─────────────────────────────────┤
│  RANKING                        │
│  🥇 Octávio         0 dias     │
│     🔥 0 seguidos               │
│  (novos membros aparecem aqui)  │
├─────────────────────────────────┤
│  [FAB Check-in]                 │
└─────────────────────────────────┘
```

### Mudanças técnicas

**1. Limpar dados** - Executar DELETE nas tabelas via tool

**2. `src/pages/GroupDetails.tsx`** - Reformular completamente:
- Adicionar ranking completo (reusar lógica do `Ranking.tsx`)
- Adicionar barra de progresso temporal (dias passados / total)
- Manter código de convite e lista de membros
- Adicionar seção de atividade recente
- Usar `useGroupCheckins` + ranking computation inline
- Habilitar realtime nos checkins para atualização automática

**3. `src/pages/CreateGroup.tsx`** - Após criar, redirecionar para `/group/:id` (a nova página do grupo) em vez de `/grupos/:id/convidar`

**4. `src/components/dashboard/HomeChallengeCard.tsx`** - Ao clicar, navegar para `/group/:id`

**5. Rota no `App.tsx`** - Adicionar rota `/group/:id` apontando para `GroupDetails` reformulado (ou ajustar a rota existente)

**6. Realtime** - Habilitar realtime na tabela `checkins` para que o ranking atualize automaticamente quando alguém faz check-in

### Arquivos afetados
- `src/pages/GroupDetails.tsx` — reformulação com ranking embutido
- `src/pages/CreateGroup.tsx` — redirect após criar
- `src/App.tsx` — ajustar rotas
- `src/components/dashboard/HomeChallengeCard.tsx` — ajustar navegação
- Migration SQL para habilitar realtime nos checkins

