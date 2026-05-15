# Toasts/snackbars consistentes ao marcar dias passados

## Problema atual
1. **Mensagens genéricas**: "Treino registrado! 💪" não diz qual dia foi marcado — ruim para dias passados.
2. **Mensagem de duplicata errada**: o hook `useCreateCheckinAll` lança *"Você já fez check-in hoje em todos os desafios ativos."* mesmo quando a data é passada.
3. **Spam de toasts no batch**: a tela `/atualizar-checkins` itera N datas e dispara o toast do hook a cada uma → o usuário pode ver 5–10 toasts seguidos antes do resumo final.

## O que muda

### 1. `src/hooks/useCheckins.ts`
- Adicionar parâmetro opcional `silent?: boolean` em ambos `useCreateCheckin` e `useCreateCheckinAll`. Quando `true`, não dispara nem o `toast.success` nem o `toast.error` — quem chamou cuida da feedback.
- Ajustar a mensagem de duplicata em `useCreateCheckinAll`:
  - Se `checkinDate` foi passado → `"Você já tem check-in em ${dd/MM} nesses desafios."`
  - Senão → mantém *"Você já fez check-in hoje em todos os desafios ativos."*
- Mensagem de sucesso quando `checkinDate` é informado (e não silent):
  - `"Check-in marcado em ${dd/MM} 💪"` (usa locale ptBR).

### 2. `src/components/checkin/MarkPastDaySheet.tsx`
- Continuar deixando o hook mostrar o toast (não silent), pois o sheet é uma operação única — agora a mensagem já vai conter a data correta.
- Não precisa mudar o componente em si.

### 3. `src/pages/UpdateCheckins.tsx`
- Passar `silent: true` na chamada `createCheckinAll.mutateAsync` para silenciar o toast por iteração.
- Manter a coleta de `ok` / `skipped` / `failed` (separar erros reais de duplicatas via `e.message?.includes("já tem check-in") || e.message?.includes("já fez check-in")`).
- Resumo final único:
  - **Tudo ok** → `toast.success("X dias marcados ✅")`.
  - **Parcial duplicata** → `toast.success("X dias marcados · Y já existiam")` (ainda como sucesso porque algo foi feito).
  - **Tudo duplicata** → `toast.message("Esses dias já tinham check-in")` (info, não erro).
  - **Erro real** → `toast.error("Falha ao marcar Z dias. Tente novamente.")`.
- Em caso de sucesso parcial/total, navegar para `/` ao final (já faz).

### 4. (Pequeno) Melhorar `useCreateCheckin` para também aceitar `silent` — útil caso futuramente apareça outro fluxo em lote.

## Detalhes técnicos
- Sem mudanças de schema, sem RLS, sem nova rota.
- Sonner já está montado globalmente; sem novas dependências.
- A detecção de duplicata por substring de mensagem é frágil mas suficiente; alternativa mais robusta seria o hook lançar um `Error` com `code: "duplicate"` — fora do escopo, mantemos a string check.

## Fora do escopo
- Loading toast persistente durante o batch (poderia usar `toast.loading` + `toast.success` substituindo, mas mantém-se simples).
- Toasts com botão "Desfazer".
