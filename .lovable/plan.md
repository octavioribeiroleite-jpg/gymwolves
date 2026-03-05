

## Atualizar imagem de compartilhamento (OG Image)

### Problema
As meta tags `og:image` e `twitter:image` apontam para um screenshot antigo hospedado no R2. Quando o link é compartilhado no WhatsApp, aparece essa imagem antiga em vez da logo do app.

### Solução

Criar uma imagem OG personalizada (1200x630px) com fundo escuro `#0B1220` e a logo do GYM WOLVES centralizada, para ser usada como preview de compartilhamento. Alternativamente, usar a logo existente (`/logo.png`) diretamente.

**Melhor abordagem**: Usar `/logo.png` já existente no projeto como OG image, referenciando com URL absoluta (`https://gymwolves.lovable.app/logo.png`).

### Alterações em `index.html`
- Atualizar `og:image` de URL do R2 para `https://gymwolves.lovable.app/logo.png`
- Atualizar `twitter:image` igualmente
- Mudar `twitter:card` de `summary_large_image` para `summary` (melhor para logos quadradas)

> **Nota**: O WhatsApp pode cachear a imagem antiga por algum tempo. Para forçar atualização, pode-se usar ferramentas como o [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

