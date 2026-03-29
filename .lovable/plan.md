

## Plano: Melhorar o Painel Inicial

Analisei o Dashboard atual e identifiquei melhorias práticas para torná-lo mais completo, bonito e funcional.

### Layout atual (de cima pra baixo)
1. Header (Olá, Nome 👋)
2. Suas métricas (Sequência / Dias ativos / Recorde)
3. Card de status do treino (Registrar / Concluído)
4. Resumo semanal (treinos, min, kcal + anel)
5. Histórico recente (últimos 5)
6. Meus Desafios (lista de cards)
7. Feed de atividade

### Melhorias propostas

**1. Saudação personalizada com motivação**
- Trocar "Olá, Nome 👋" por mensagens contextuais baseadas no horário e na sequência
  - Manhã: "Bom dia, Nome! ☀️"
  - Se streak > 3: "🔥 5 dias seguidos! Continue assim!"
  - Se não treinou hoje: "Bora treinar hoje?"
- Arquivo: `DashboardHeader.tsx`

**2. Gráfico de atividade semanal (dots/heatmap)**
- Adicionar uma fileira de 7 bolinhas (Seg→Dom) abaixo do resumo semanal, mostrando visualmente quais dias da semana o usuário treinou (verde = treinou, cinza = não treinou)
- Simples, leve e informativo — estilo Apple Activity
- Arquivo: novo componente `WeekDots.tsx`, integrado ao `WeeklySummary.tsx`

**3. Meta semanal editável**
- Trocar o `goal = 7` fixo por um valor salvo no perfil do usuário
- Adicionar botão de edição no anel de progresso para alterar a meta (1-7)
- Migração SQL: adicionar coluna `weekly_goal` na tabela `profiles` (default 5)
- Arquivos: `WeeklySummary.tsx`, migração SQL, `useProfile.ts`

**4. Refinamento visual geral**
- Cards com espaçamento mais uniforme
- Seção de métricas com ícones mais vibrantes e micro-animações no valor
- Melhor hierarquia de títulos (consistência nos `h2`)

### Resumo de alterações

| Arquivo | Mudança |
|---|---|
| `DashboardHeader.tsx` | Saudação contextual com streak |
| `Dashboard.tsx` | Passar streak para o header |
| Novo `WeekDots.tsx` | Visualização dos 7 dias da semana |
| `WeeklySummary.tsx` | Integrar dots + meta editável |
| Migração SQL | `weekly_goal` em profiles |
| `useProfile.ts` | Suporte a atualizar weekly_goal |
| `HomeWelcome.tsx` | Refinamento visual dos stat cards |

