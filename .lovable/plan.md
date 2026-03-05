

## Problema

A pupila aparece como linha horizontal porque o container pai do olho aplica `scaleY` (ex: 0.15 na piscada, valores variados nas outras fases). A pupila herda essa compressão vertical, achatando-a.

## Solução

1. **Tirar a pupila de dentro do container do olho** — mover cada `motion.div` da pupila para fora do `motion.div` do olho, posicionando-a absolutamente no container `gap-12`. Assim ela não herda o `scaleY` do pai.

2. **Melhorar o visual da pupila** — formato de fenda vertical de lobo mais realista:
   - Largura: 6px (era 4px), altura: 28px (fixa, não percentual)
   - `border-radius` elíptico (`3px / 14px`) para forma de amêndoa vertical
   - Gradiente radial interno (branco no centro → verde neon nas bordas)
   - `box-shadow` com múltiplas camadas para glow mais intenso e difuso

3. **Animação independente da pupila**:
   - Fases 2-4: visível com `scaleY: 1`
   - Fase 5 (piscada): `scaleY: 0` e `opacity: 0` (some junto com a piscada)
   - Fases 6-7: permanece oculta

### Arquivo alterado

**`src/components/SplashScreen.tsx`** — Reestruturar: mover as pupilas para fora dos containers dos olhos (ficam como siblings no flex container), com posicionamento absoluto centralizado sobre cada olho. Atualizar dimensões e estilo para fenda vertical mais realista.

