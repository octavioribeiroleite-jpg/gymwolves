

## Adicionar Pupila LED Forte que Some na Piscada

Adicionar uma fina linha vertical neon brilhante no centro de cada olho (pupila LED), com glow intenso, que aparece junto com os olhos e desaparece na fase de piscada (fase 5), antes do shutdown geral.

### Alteração

**`src/components/SplashScreen.tsx`** — Dentro de cada olho (left eye e right eye), adicionar um `motion.div` representando a pupila:

- **Visual**: Retângulo fino vertical (4px largura × 70% altura), bordas arredondadas, cor `#22C55E` com `box-shadow` intenso (`0 0 12px, 0 0 24px`) para efeito LED forte
- **Animação**:
  - Aparece na fase 2 (junto com os olhos), com scaleY de 0→1
  - Fica visível nas fases 3 e 4 (olhar intenso)
  - **Some na fase 5** (piscada) — opacity→0 e scaleY→0 simultaneamente
  - Não reaparece nas fases 6-7 (já sumiu com a piscada)
- Posicionamento: `absolute`, centralizado horizontal e verticalmente dentro de cada olho

