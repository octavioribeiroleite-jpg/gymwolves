

## Correção: Upload de imagem no CreatePostDialog

### Problema
O caminho de upload `posts/${challengeId}/...` viola a política RLS do storage que exige `auth.uid()` como primeiro diretório.

### Correção em `src/components/challenge/CreatePostDialog.tsx`

1. Importar `useAuth` do AuthContext
2. Obter `user` via `useAuth()`
3. Alterar o caminho de upload de:
   ```ts
   const path = `posts/${challengeId}/${Date.now()}.${ext}`;
   ```
   Para:
   ```ts
   const path = `${user.id}/${challengeId}_${Date.now()}.${ext}`;
   ```

Apenas 3 linhas alteradas em 1 arquivo.

