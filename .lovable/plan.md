

## Plano: Scroll e animações no menu lateral

### Problemas
1. O conteudo do menu lateral nao rola — quando ha muitos itens (especialmente com a secao Desafio visivel), o conteudo fica cortado embaixo.
2. Nao ha feedback visual (animacao) ao clicar nos itens do menu.

### Solucao

**1. Adicionar scroll ao conteudo do menu**
- Estruturar o `SheetContent` com layout flex vertical: header fixo no topo, area de scroll no meio (com `ScrollArea` do Radix), botao de logout fixo no fundo.
- Isso garante que o header e o logout ficam sempre visiveis, e o conteudo do meio rola.

**2. Adicionar animacoes nos itens**
- Usar `framer-motion` (ja instalado) para:
  - **Stagger de entrada**: Itens aparecem em sequencia com fade+slide ao abrir o menu
  - **Feedback de clique**: Efeito de `scale` (whileTap) nos botoes ao pressionar
  - **Transicao suave** nos icones de chevron

### Arquivo afetado
- `src/components/SidebarMenu.tsx`

### Estrutura resultante
```text
SheetContent (flex col, h-full)
├── Header (fixo, shrink-0)
├── ScrollArea (flex-1, overflow auto)
│   ├── Navegacao (motion stagger)
│   ├── Desafio (motion stagger)
│   └── Geral (motion stagger)
└── Logout (fixo, shrink-0)
```

