

## Splash Screen — Olhos Neon Minimalistas com Zoom

Remover a imagem PNG e criar os olhos como **contorno neon SVG** (formato amendoado de olho de lobo) com animação de zoom in/out.

### Design
- Dois olhos em SVG: contorno verde neon (`#22C55E`) com `stroke` apenas (sem fill), formato amendoado afiado
- Pupila em fenda vertical como linha central
- Glow via `filter: drop-shadow` verde neon
- Fundo `#F3F4F6`

### Sequência de Animação

1. **0-0.6s**: Olhos aparecem com fade in + scale de 0.5 para 1 (zoom in)
2. **0.6-1.8s**: Olhos visíveis, fazem uma piscada (scaleY comprime e volta) — efeito piscante
3. **1.8-2.6s**: Olhos retraem — zoom out (scale de 1 para 0.3) + fade out
4. **2.6-3.4s**: App faz zoom in (a tela do splash faz scale de 0.3 para 1.2 e some) — sensação de "entrar" no app
5. **3.4s**: `onFinish()` é chamado

### Arquivo alterado
1. **`src/components/SplashScreen.tsx`** — Reescrever: remover imagem PNG, criar componente SVG `NeonEyes` inline, nova sequência de animação zoom in → piscada → zoom out → app abre

