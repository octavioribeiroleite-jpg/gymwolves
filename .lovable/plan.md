

## Plano: Remover barra inferior e centralizar navegação no menu lateral

### Problema
- Existem duas formas de navegação simultâneas (barra inferior + menu lateral).
- As 3 primeiras opções da seção "Desafio" no menu lateral (Detalhes, Classificações, Bate-papo) aparecem de forma confusa — "Bate-papo" aponta para "/ranking" (bug), e a seção toda só aparece quando há grupo ativo, sem explicação clara.

### O que será feito

**1. Remover BottomNav de todas as telas**
- Remover `<BottomNav />` de `Dashboard.tsx`, `InviteScreen.tsx`, e `AppScaffold.tsx`
- Remover `pb-24` (padding inferior que compensava a barra) dessas telas
- O arquivo `BottomNav.tsx` pode ser mantido mas não será mais usado

**2. Reestruturar o menu lateral (SidebarMenu)**

Nova estrutura:

```text
┌─────────────────────────┐
│ [Avatar] Nome            │
│          email           │
├─────────────────────────┤
│ NAVEGAÇÃO               │
│  🏠 Início        →     │
│  ⚔️ Grupos         →     │
│  📅 Histórico      →     │
│  🏆 Ranking        →     │
│  👤 Perfil         →     │
├─────────────────────────┤
│ DESAFIO (se ativo)      │
│  📄 Detalhes       →     │
│  🏅 Classificações →     │
│  💬 Bate-papo      →     │
├─────────────────────────┤
│ GERAL                   │
│  ➕ Criar grupo     →     │
│  🔗 Entrar em grupo →    │
│  ✅ Desafios concluídos→  │
│  📱 Meus dispositivos →  │
│  ⚙️ Configurações   →    │
│  ❓ Ajuda & feedback →   │
│  ℹ️ Sobre           →    │
├─────────────────────────┤
│  🚪 Sair da conta        │
└─────────────────────────┘
```

- Adicionar seção "Navegação" com as 5 rotas principais (Início, Grupos, Histórico, Ranking, Perfil)
- Corrigir Bate-papo que apontava para "/ranking" (bug)
- Remover item duplicado do nome do grupo (já existe na seção Desafio)

**3. Ajustar padding das telas**
- Remover `pb-24` que existia para compensar a barra inferior

### Arquivos afetados
- `src/components/SidebarMenu.tsx` — reestruturar itens
- `src/pages/Dashboard.tsx` — remover BottomNav e pb-24
- `src/pages/InviteScreen.tsx` — remover BottomNav
- `src/components/ds/AppScaffold.tsx` — remover BottomNav
- `src/hooks/useNavContext.ts` — pode ser removido (não será mais usado)

