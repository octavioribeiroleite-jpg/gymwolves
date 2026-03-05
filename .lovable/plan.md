

## Plano: Barra inferior contextual por página

### Problema identificado
A barra de navegação inferior atualmente é estática — mostra os mesmos 5 ícones sem nenhuma informação contextual da página aberta. O usuário quer que cada aba "converse" com a página correspondente, mostrando informações relevantes.

### O que será feito

**1. Adicionar badges/indicadores contextuais na barra inferior**
- **Início**: Badge com indicador se o treino do dia já foi feito (bolinha verde) ou pendente (bolinha laranja)
- **Grupos**: Badge com número de grupos ativos
- **Histórico**: Contador pequeno com dias treinados no mês
- **Ranking**: Posição atual do usuário (ex: "#2")
- **Perfil**: Indicador de notificação se houver algo pendente

**2. Label dinâmica sob o ícone ativo**
- Quando a aba está ativa, o label pode mostrar um texto contextual curto (ex: na aba Ranking ativa, mostrar "3º lugar" em vez de apenas "Ranking")

**3. Garantir que todas as páginas tenham header consistente**
- Cada página acessada pela barra inferior terá um header padronizado que corresponde ao item da navegação
- Dashboard (Início), GroupList (Grupos), History (Histórico), Ranking (Ranking), Profile (Perfil) — todos com o mesmo padrão visual de cabeçalho

### Implementação técnica

- Atualizar `BottomNav.tsx` para aceitar props de contexto (badges, contadores)
- Criar um wrapper ou hook `useNavContext` que calcula os dados contextuais (treino feito hoje, posição no ranking, dias treinados no mês, número de grupos)
- O `BottomNav` consumirá esse hook e renderizará badges sobre os ícones relevantes
- Manter a mesma estrutura visual (tema escuro, verde como destaque)

### Arquivos afetados
- `src/components/BottomNav.tsx` — adicionar badges e labels contextuais
- Novo: `src/hooks/useNavContext.ts` — hook para dados de cada aba
- Ajustes menores nos headers de `Dashboard.tsx`, `GroupList.tsx`, `History.tsx`, `Ranking.tsx`, `Profile.tsx` para consistência

