

## Adicionar opção de Galeria no upload de foto

### Problema
O input de foto tem `capture="environment"`, que em mobile abre diretamente a câmera. O usuário quer poder escolher entre câmera e galeria.

### Solução
Separar em dois botões (Câmera e Galeria) e usar dois `<input type="file">` diferentes:
- Um com `capture="environment"` para câmera
- Um sem `capture` para galeria (abre o seletor de arquivos/galeria)

### Alterações em `src/components/CheckinDialog.tsx`

1. Adicionar segundo `useRef` para o input de galeria
2. Substituir o botão único por dois botões lado a lado:
   - **📷 Câmera** — dispara o input com `capture="environment"`  
   - **🖼️ Galeria** — dispara o input sem `capture`
3. Adicionar segundo `<input type="file" accept="image/*" />` (sem capture)
4. Ambos usam o mesmo `handlePhotoSelect`
5. Importar `ImagePlus` do lucide-react para o ícone da galeria

