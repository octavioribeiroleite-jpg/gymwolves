

## Nova Animação da Splash Screen — Lobo Cinematográfico

### Conceito
Sequência fluida em 3 fases: **olhos brilham no escuro → boca com dentes aparece abaixo → face se transforma na logo e abre o app**.

### Alterações em `src/components/SplashScreen.tsx`

**Fase 1 (0s–1.2s) — Olhos do Lobo**
- Tela escura total, apenas os dois olhos verdes surgem com glow pulsante
- Olhos posicionados mais ao centro vertical (~45%)

**Fase 2 (1.2s–2.4s) — Sorriso com Dentes**
- Abaixo dos olhos, uma boca estilizada aparece com fade-in
- Desenho minimalista usando SVG: arco curvado (sorriso) com "dentes" triangulares brancos
- Glow sutil nos dentes (branco/verde)
- Olhos continuam visíveis

**Fase 3 (2.4s–3.6s) — Revelação da Logo**
- Olhos e boca fazem fade-out e scale-down juntos
- Logo do GYM WOLVES faz scale-up suave no mesmo ponto central
- Título e tagline surgem por baixo
- Partículas intensificam brevemente

**Fase 4 (3.6s–4.1s) — Transição**
- Tudo faz fade-out + slide-up para abrir o app

### Detalhes técnicos
- Componente `WolfMouth` novo com SVG inline (arco + triângulos para dentes)
- Sistema de fases via `useState<number>` com `useEffect` + `setTimeout` encadeados
- Todas as transições via `framer-motion` (`animate`, `initial`, `exit`)
- Tempo total aumenta de ~3.9s para ~4.1s (sutil, mas mais cinematográfico)
- Os olhos são reposicionados para não sobrepor a logo (ficam mais acima)

### Resultado
Animação sequencial e fluida: olhos brilham → sorriso predador aparece → face se dissolve na logo → app abre.

