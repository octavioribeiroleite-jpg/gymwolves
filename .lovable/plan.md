

## Plano: Separar fotos de IA e fotos do Feed no Modo Completo

### Problema atual
No Modo Completo, as fotos enviadas servem apenas para a IA analisar. Não há opção de enviar uma foto pessoal separada para aparecer no feed social e no histórico recente.

### O que será feito

Adicionar uma segunda seção de foto no fluxo do Modo Completo — uma foto "pessoal" para o feed, separada das fotos de análise da IA.

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/components/checkin/CheckinFullWizard.tsx` | Adicionar estado `feedPhoto`/`feedPhotoPreview` separado. Na tela de confirmação (`CheckinConfirmation`), passar a foto do feed. No `handleConfirm`, fazer upload da foto do feed (não da foto de IA) como `proofUrl` e postar no feed social. |
| `src/components/checkin/CheckinConfirmation.tsx` | Adicionar seção de upload de "Foto para o feed" com câmera/galeria, preview da imagem. Recebe e retorna a foto do feed junto com os dados do treino. |
| `src/components/dashboard/RecentHistory.tsx` | Exibir a `proof_url` do checkin como imagem no card do histórico e no sheet de detalhes, mostrando a foto inteira (`object-contain`). |

### Fluxo atualizado

```text
[Modo Completo]
  1. Fotos para IA (prints do app) → Analisa
  2. Tela de confirmação:
     - Métricas editáveis (já existe)
     - Nova seção: "Foto para o feed" (câmera/galeria)
  3. Confirmar → upload da foto do feed → salva como proof_url + posta no feed
```

### Detalhes
- A foto do feed é opcional
- A foto do feed vai para o storage `checkin-photos` e é salva como `proof_url` no checkin
- No `RecentHistory`, se o checkin tem `proof_url`, exibe a imagem inteira no card e no sheet de detalhes
- As fotos de IA continuam sendo usadas apenas para análise (base64), não são salvas no storage

