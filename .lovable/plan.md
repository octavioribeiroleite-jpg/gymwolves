

## Contador de Treinos — App de Desafio em Casal 🏋️

### Visão Geral
App mobile-first para registrar treinos diários, com metas anuais e disputa entre 2 pessoas. Interface toda em português, visual limpo e minimalista.

### Backend (Lovable Cloud / Supabase)
- **Autenticação** com email/senha (telas de login e cadastro em PT-BR)
- **Tabelas**: profiles, groups, group_members, challenges, workout_logs
- **Constraint** UNIQUE(challenge_id, user_id, date) para evitar duplicatas
- **RLS** para segurança dos dados por grupo

### Páginas e Funcionalidades

**1. Login / Cadastro**
- Formulários simples em português com validação

**2. Painel Principal (Dashboard)**
- Botão grande "Marcar treino de hoje ✅" (toggle — pode desfazer)
- Progresso individual: dias concluídos + barra de % da meta
- Progresso do parceiro(a) lado a lado
- Ranking simples (quem está na frente)
- Streak atual e melhor streak de cada um
- Progresso do grupo (total combinado)

**3. Criar/Gerenciar Grupo**
- Criar grupo e gerar código de convite
- Entrar em grupo existente via código
- Status de membros (pendente/ativo)

**4. Criar Desafio/Meta**
- Definir período (data início e fim)
- Meta de dias por pessoa (ex: 200 dias)

**5. Histórico / Calendário**
- Calendário mensal com marcações nos dias treinados (estilo heatmap)
- Navegação entre meses
- Visualização por membro

### Design
- Mobile-first, limpo e minimalista
- Cores motivacionais (verde para sucesso, gradientes sutis)
- Estados de loading, erro e sucesso com feedback visual (toasts)
- Toda interface em português brasileiro

