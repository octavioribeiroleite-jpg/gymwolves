

## Plano: Corrigir erro de tipo na duração + Suporte a múltiplas fotos

### Problema 1: Erro "invalid input syntax for type integer: 36.76"
A coluna `duration_min` na tabela `checkins` é do tipo `integer`, mas a IA retornou `36.76` (decimal). Precisamos arredondar o valor antes de inserir no banco.

### Problema 2: Suporte a múltiplas fotos
O usuário quer enviar mais de uma foto/print (ex: tela de calorias + tela de frequência cardíaca) para que a IA analise todos juntos e extraia o máximo de dados.

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/hooks/useCheckins.ts` | Aplicar `Math.round()` no `duration_min` antes do insert (linhas 54, 109) para garantir que é inteiro |
| `src/components/checkin/CheckinFullWizard.tsx` | Trocar estado `photo`/`photoPreview` de `File\|null` / `string\|null` para arrays `File[]` / `string[]`. Permitir adicionar múltiplas fotos (botão "+" após primeira foto). Exibir grid de previews com opção de remover cada uma individualmente. Enviar todas as imagens em base64 para a edge function. |
| `supabase/functions/analyze-workout/index.ts` | Aceitar `imageBase64` como string OU array de strings. Montar mensagem com múltiplas `image_url` entries para que a IA analise todas as imagens juntas e extraia dados combinados. |
| `src/components/checkin/CheckinConfirmation.tsx` | Arredondar `duration_min` no display (já editável, sem mudança estrutural) |

### Fluxo com múltiplas fotos

```text
Passo 1: Foto/Print
  [Câmera] [Galeria]
  ↓ (seleciona 1ª foto)
  [Preview 1] [+ Adicionar mais]
  ↓ (seleciona 2ª foto)
  [Preview 1] [Preview 2] [+ Adicionar mais]
  ↓
  [Analisar com IA 🤖]  ← envia todas as imagens
```

A IA recebe todas as imagens e combina os dados extraídos de cada uma num único resultado.

