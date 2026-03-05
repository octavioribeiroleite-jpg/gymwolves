

## Problema

A barra de status (topo) aparece com fundo diferente (verde ou branco) e a barra de navegação (inferior) também não combina com o fundo escuro do app. Isso acontece porque faltam meta tags de controle de cor no `index.html` e o viewport não está configurado para cobrir a área segura (notch/barra inferior).

## Solução

Ajustar `index.html` para que o navegador/PWA pinte as barras do sistema com a mesma cor de fundo do app (`#0B1220`).

### Alterações em `index.html`

1. Adicionar `viewport-fit=cover` na meta viewport para permitir que o conteúdo se estenda até as bordas
2. Adicionar `<meta name="theme-color" content="#0B1220">` para pintar a barra de status com a cor do fundo do app
3. Adicionar `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` para iOS

### Alterações em `src/index.css`

4. Adicionar `padding` com `env(safe-area-inset-*)` no `body` para que o conteúdo não fique sob o notch ou barra de gestos

### Alterações em `vite.config.ts`

5. Atualizar `theme_color` no manifest PWA de `#16a34a` (verde) para `#0B1220` (fundo escuro) — essa é a causa da barra verde que aparece

### Resultado

As barras superior e inferior do celular ficarão com a mesma cor escura do app, criando uma experiência visual contínua e imersiva.

