

## Plano: Ajustar FAB e melhorar Mini Ranking no Dashboard

### 1. Reposicionar o FAB (botão verde "+")

O FAB está com `bottom-[88px]` (posição pensada para a barra inferior que foi removida). Sem a barra, ele fica flutuando muito acima.

- Alterar posição para `bottom-6` (24px do fundo da tela)
- Ajustar o menu de ações de `bottom-[140px]` para `bottom-24`

### 2. Melhorar o Mini Ranking no Dashboard

Inspirado na imagem de referência (Gym Rats), o ranking atual é funcional mas pode ser mais visual. Melhorias:

- **Pódio visual para top 3**: Em vez de uma lista simples, exibir os 3 primeiros em formato de pódio horizontal (1o no centro mais alto, 2o à esquerda, 3o à direita) com avatares circulares e medalhas
- **Barra de progresso por membro**: Mostrar uma barra fina indicando o progresso relativo ao líder
- **Destaque do usuário atual**: Se o usuário não está no top 3, mostrar sua posição separadamente abaixo do pódio com destaque verde
- **Unidade de score visível**: Mostrar "X dias" ao lado do score para clareza

### Arquivos afetados
- `src/components/dashboard/DashboardFAB.tsx` — ajustar posições bottom
- `src/components/dashboard/MiniRanking.tsx` — redesign com pódio visual e barras de progresso

