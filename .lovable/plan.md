

## Plano: Mover a foto para o primeiro passo do Modo Completo

### Problema

Atualmente o fluxo do wizard é: Tipo → Intensidade → Duração → Foto → IA → Confirmação. Mas se o usuário tem um print do app de fitness, o print já contém todos os dados. Não faz sentido pedir tipo/intensidade/duração antes.

### Novo fluxo

```text
Modo Completo
  Passo 1: Foto/Print (opcional)
     ├─ Se enviou foto → IA analisa → Confirmação (pula manual)
     └─ Se pulou foto → Passo 2: Tipo → Passo 3: Intensidade → Passo 4: Duração → IA → Confirmação
```

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/components/checkin/CheckinFullWizard.tsx` | Reordenar steps: `"photo"` passa a ser o primeiro passo. Se o usuário envia foto, vai direto para `"analyzing"` → `"confirm"`. Se pula a foto (botão "Preencher manualmente"), segue para `"type"` → `"intensity"` → `"duration"` → `"analyzing"` → `"confirm"`. Ajustar o step indicator e os botões de navegação. |

Nenhuma alteração no backend ou banco de dados.

