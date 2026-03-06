

## Plano: Check-in Inteligente com IA (dois modos + animação de análise + confirmação)

### Conceito

Refatorar o `CheckinDialog` em um fluxo multi-step com dois modos e uma tela de confirmação antes de finalizar:

```text
┌─────────────────────────────┐
│  Como registrar seu treino? │
│                             │
│  ⚡ Check-in Rápido          │
│  📝 Modo Completo            │
└─────────────────────────────┘

── Check-in Rápido ──
  Grid tipos → Confirmar

── Modo Completo ──
  Passo 1: Tipo de treino
  Passo 2: Intensidade (Leve/Moderado/Pesado)
  Passo 3: Duração (minutos)
  Passo 4: Foto opcional (câmera/galeria/print de app)
     ↓
  [IA analisa → animação de loading bonita]
     ↓
  Tela de Resumo/Confirmação
  (calorias estimadas, tipo, duração, dados extraídos)
  [Campos editáveis] + [Confirmar] ou [Voltar]
     ↓
  Salvar check-in
```

### Animação de carregamento da IA

Enquanto a IA processa, exibir uma animação com framer-motion:
- Ícone central pulsando (tipo radar/scan)
- Textos rotativos: "Analisando treino...", "Calculando calorias...", "Quase lá..."
- Barra de progresso animada (indeterminada)
- Transição suave para a tela de resumo quando pronto

### Tela de confirmação

Card visual com os dados retornados pela IA, todos editáveis:
- Tipo de treino, duração, calorias estimadas, frequência cardíaca (se disponível)
- Campos como inputs para o usuário poder corrigir
- Botão "Confirmar e registrar" e botão "Voltar"

### Alterações

| Arquivo | O que muda |
|---|---|
| `supabase/functions/analyze-workout/index.ts` | **Novo** -- Edge function usando Lovable AI (Gemini Flash) para calcular calorias (modo manual) e analisar prints de apps fitness (modo imagem). Retorna JSON estruturado via tool calling |
| `src/components/CheckinDialog.tsx` | Refatorar para fluxo multi-step: tela de seleção de modo → rápido (grid+confirmar) ou completo (tipo→intensidade→duração→foto→IA→resumo editável→confirmar) |
| `src/hooks/useCheckins.ts` | Adicionar campos `duration_min`, `calories`, `distance_km`, `steps` nos inserts das mutações |

### Detalhes da Edge Function

Recebe `{ mode: "manual"|"image", workoutType?, intensity?, durationMin?, imageBase64? }`.
- **Modo manual**: Usa prompt para estimar calorias baseado no tipo+intensidade+duração
- **Modo imagem**: Envia imagem em base64 ao Gemini (multimodal) para extrair dados do print
- Retorna via tool calling: `{ workout_type, duration_min, calories, heart_rate?, distance_km?, steps?, summary }`
- Trata erros 429/402 adequadamente

### Sem alterações no banco

A tabela `checkins` já possui as colunas `calories`, `duration_min`, `distance_km`, `steps` -- basta popular.

