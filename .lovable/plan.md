

## Plano: Câmera + Legenda + Notificações no Check-in

### 1. Modo Rápido: Abrir câmera (não só galeria) + legenda

**Arquivo: `CheckinQuickMode.tsx`**
- Substituir o input único de galeria por dois botões: "Câmera" (com `capture="environment"`) e "Galeria" (sem capture), igual ao que já existe no Modo Completo
- Adicionar campo de legenda (`Textarea`) abaixo da foto, com placeholder "Escreva uma legenda..." (opcional)
- A legenda digitada substitui a legenda automática gerada no `postToFeed`
- Se não tiver legenda, manter a lógica atual (emoji + stats ou "Check-in do dia ✅")

### 2. Modo Completo: Legenda na foto do feed

**Arquivo: `CheckinConfirmation.tsx`**
- Adicionar campo de legenda (`Textarea`) abaixo da seção "Foto para o feed"
- Propagar a legenda para o `onConfirm` callback
- Se o usuário não escrever legenda, usar a automática (stats)

**Arquivo: `CheckinFullWizard.tsx`**
- Receber a legenda do `CheckinConfirmation` e passar para `postToFeed`

### 3. Notificações popup quando alguém do grupo faz check-in

**Abordagem: Realtime do banco de dados**
- Habilitar realtime na tabela `checkins` (migração SQL: `ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins`)
- Criar um hook `useCheckinNotifications` que escuta inserts na tabela `checkins` via canal realtime
- Filtrar: só notificar se o `user_id` do novo checkin **não** é o usuário logado e o `group_id` pertence a um dos grupos do usuário
- Buscar o nome do usuário via profiles para exibir na notificação
- Exibir toast estilizado (sonner) com avatar, nome e tipo de treino: "🏋️ Cíntia acabou de treinar!"
- Integrar o hook no `Dashboard.tsx` ou `App.tsx` para funcionar globalmente

### Resumo de alterações

| Arquivo | Mudança |
|---|---|
| `CheckinQuickMode.tsx` | 2 botões (câmera/galeria) + campo de legenda |
| `CheckinConfirmation.tsx` | Campo de legenda para foto do feed |
| `CheckinFullWizard.tsx` | Propagar legenda customizada |
| Migração SQL | Habilitar realtime em `checkins` |
| Novo `useCheckinNotifications.ts` | Hook de notificações realtime |
| `App.tsx` ou `Dashboard.tsx` | Integrar hook de notificações |

