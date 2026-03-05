

## Splash Screen — Estilo Glow Difuso (como a referência)

O problema atual: os olhos usam SVG com traços visíveis (linhas de pálpebra) e retângulos sólidos (pupilas). O resultado parece técnico/duro. A referência mostra apenas **dois brilhos suaves e difusos** em formato de elipse/amêndoa, sem contornos visíveis nem pupila central separada.

### Abordagem

Reescrever o SVG dos olhos para usar apenas **elipses com blur gaussiano pesado**, criando o efeito de glow difuso da referência:

- **Remover**: todas as `motion.path` (pálpebras) e `motion.rect` (pupilas retangulares)
- **Cada olho** será composto por:
  - Uma elipse grande com fill `#22C55E` e `filter: blur(25px)` para o halo verde difuso
  - Uma elipse menor com fill branco (`#ffffff`) e `filter: blur(8px)` para o centro brilhante
- **Formato**: elipse vertical (mais alta que larga), como na referência — forma de amêndoa/olho de gato
- Sem contornos, sem strokes, sem pupilas separadas

### Animação (mesmas 8 fases, mesmos timings)

As fases continuam iguais, mas agora animam opacidade e escala das elipses difusas:
- **Fase 0-1**: Tela vazia + partículas convergem
- **Fase 2**: Elipses aparecem (opacity 0→1, scale surge)
- **Fase 3-4**: Elipses expandem levemente (scaleY aumenta = olhos "abrindo"), glow intensifica
- **Fase 5**: scaleY comprime (blink)
- **Fase 6**: opacity→0 (LED shutdown)
- **Fase 7**: Partículas dissolvem, fade out

### Arquivo alterado

1. **`src/components/SplashScreen.tsx`** — Substituir o bloco SVG (linhas 98-222) por dois conjuntos de `motion.div` com elipses CSS usando `border-radius: 50%`, `background: radial-gradient`, e `filter: blur()` para replicar o efeito difuso da imagem de referência. Manter partículas e lógica de fases intactas.

