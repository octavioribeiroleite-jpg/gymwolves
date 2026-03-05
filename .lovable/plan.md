

## Splash Screen — Olhos de Lobo (Imagem + Animação)

Usar a imagem enviada pelo usuario como base da splash screen. Sem logo, sem titulo, sem tagline. Apenas os olhos com animacao de abertura e piscada.

### Abordagem

1. **Copiar a imagem** para `src/assets/wolf-eyes.png`
2. **Reescrever `SplashScreen.tsx`** com animacao simples usando a imagem real:
   - A imagem fica centralizada na tela com fundo `#F3F4F6`
   - Animacao via `clipPath` ou `scaleY` para simular abertura dos olhos (uma faixa horizontal que expande verticalmente revelando a imagem)
   - Glow verde pulsante ao redor via box-shadow animado

### Sequencia de Animacao (framer-motion)

1. **0-0.6s**: Tela cinza vazia, glow verde sutil aparece no centro
2. **0.6-1.4s**: Olhos "abrem" — a imagem aparece via `clipPath: inset(45% 0 45% 0)` animando para `inset(0 0 0 0)`, simulando palpebras abrindo
3. **1.4-2.4s**: Olhos abertos, glow pulsa. Piscada lenta (clipPath fecha parcialmente e reabre)
4. **2.4-3.0s**: Olhos fecham (clipPath volta a fechar) + fade out
5. **3.0-3.5s**: Tela limpa, app inicia (onFinish)

### Arquivo alterado
1. **`src/components/SplashScreen.tsx`** — Reescrever completamente. Remover WolfFace SVG, Particles, logo, titulo, tagline. Usar apenas a imagem PNG com animacoes de clipPath

### Resultado
Splash minimalista: fundo cinza, os olhos verdes neon da imagem aparecem como se o lobo abrisse os olhos, pisca uma vez de forma imponente, depois fecha e o app inicia.

