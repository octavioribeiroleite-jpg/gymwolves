

## Splash Screen — Rosto de Lobo Neon + Fundo Cinza

### Mudanças

**1. Fundo da Splash** — Trocar `#1C1C1E` por `#F3F4F6` (mesmo cinza claro do app). O título "GYM WOLVES" e tagline passam a ser escuros para manter contraste. As partículas e glows verdes ficam mais sutis no fundo claro.

**2. Rosto de lobo neon (SVG inline animado com framer-motion)**

Criar um componente `WolfFace` usando SVG paths que desenham:
- **Olhos** maiores e mais agressivos (formato amendoado/angular, ~40px largura cada), com pupilas verdes brilhantes e glow intenso
- **Nariz** triangular estilizado abaixo dos olhos
- **Contorno do focinho** — linhas neon verdes sutis traçando o formato do rosto (estilo lobisomem/predador)
- Tudo em stroke verde `#22C55E` com `strokeWidth: 1.5-2px` e glow via filter `drop-shadow`

**3. Animação do rosto:**
- **Fase 0 (0-0.8s)**: Olhos aparecem fechados (linha horizontal), depois abrem com animação de "blink reverso" — pálpebras se afastam revelando os olhos verdes brilhantes
- **Fase 0.5 (0.5-1.5s)**: Contorno do focinho e nariz desenham-se progressivamente (stroke-dasharray animation)
- **Fase 0.8 (0.8-1.8s)**: Olhos fazem uma piscada lenta e imponente (fecham e abrem devagar)
- **Fase 1 (1.8s)**: Rosto faz fade out → logo aparece

**4. Timing ajustado:**
- 0-1.8s: Rosto do lobo neon com animação de olhos
- 1.8-3.2s: Logo + título + tagline
- 3.2-3.7s: Fade out

### Arquivo alterado
1. **`src/components/SplashScreen.tsx`** — Reescrever `WolfEyes` como `WolfFace` com SVG paths neon, atualizar fundo para cinza claro, ajustar cores de texto

### Resultado
Splash com fundo cinza claro consistente com o app, e uma silhueta de lobo/lobisomem em neon verde que pisca de forma imponente antes de revelar a logo.

