

## Tornar o banner clicável com upload de imagem

### Problema
O banner "Foto do banner" na tela de criação de grupo é apenas um `div` estático sem interação. Precisa abrir o seletor de arquivo ao clicar e exibir a imagem selecionada.

### Alterações em `src/pages/CreateGroup.tsx`

1. Adicionar estado `bannerFile` e `bannerPreview` (igual ao padrão do CreatePostDialog)
2. Adicionar um `<input type="file" accept="image/*" ref={...} className="hidden" />` 
3. Transformar o `div` do banner em um `button` (ou adicionar `onClick` + `cursor-pointer`) que dispara o click no input hidden
4. Ao selecionar arquivo: gerar preview com `URL.createObjectURL` e exibir no banner
5. No `handleCreate`: fazer upload da imagem para o bucket `checkin-photos` (caminho `${user.id}/banner_${Date.now()}.${ext}`) antes de criar o grupo
6. Passar a URL pública do banner para o `createGroup.mutate` (se o campo `banner_url` existir na tabela `groups`)

### Verificação necessária
Checar se a tabela `groups` possui coluna para banner. Se não tiver, será necessária uma migração para adicionar `banner_url text`.

### Resultado
O usuário toca no banner, abre a galeria/câmera, seleciona a foto, vê o preview, e ao criar o grupo a imagem é salva.

