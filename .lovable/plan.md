

## Corrigir cor da barra de status para tema claro

O problema: a `theme-color` no `index.html` e no manifest PWA está definida como `#0B1220` (azul escuro/preto), que era do tema antigo. E o `apple-mobile-web-app-status-bar-style` está como `black-translucent`. Isso faz a barra de status do celular ficar escura, destoando do app que agora é claro.

### Alterações

1. **`index.html`** (linha 6-8):
   - `theme-color`: de `#0B1220` para `#F3F4F6` (cinza claro do fundo do app)
   - `apple-mobile-web-app-status-bar-style`: de `black-translucent` para `default` (barra clara com texto escuro)

2. **`vite.config.ts`** — manifest PWA (linhas 33-34):
   - `theme_color`: de `#0B1220` para `#F3F4F6`
   - `background_color`: de `#0B1220` para `#F3F4F6`

Isso sincroniza a barra de status com o tema claro do app, criando a experiência imersiva desejada.

