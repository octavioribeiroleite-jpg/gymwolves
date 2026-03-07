

## Plano: Corrigir vulnerabilidades de segurança

O scan de segurança detectou 3 problemas. Vou resolver todos:

### 1. Habilitar proteção contra senhas vazadas
- Nas configurações de autenticação, habilitar o **Password HIBP Check** (leaked password protection)
- Isso é feito via configurações de auth no painel do Lovable Cloud

### 2. Proteger edge function `analyze-workout` (erro crítico)
- **Arquivo:** `supabase/config.toml` — mudar `verify_jwt = false` para `verify_jwt = true`
- O app já envia o token Bearer automaticamente, então não quebra nada

### 3. Tornar bucket `checkin-photos` privado (warning)
- **Migração SQL:** alterar o bucket para `public = false`, trocar a policy de SELECT para `authenticated` only
- **Código:** nos componentes que exibem fotos (`RecentHistory`, `PostCard`, etc.), usar `createSignedUrl` ao invés de `getPublicUrl`

### Resumo de alterações

| Local | Mudança |
|---|---|
| `supabase/config.toml` | `verify_jwt = true` |
| Migração SQL | Bucket privado + policy atualizada |
| Auth settings | Habilitar leaked password protection |
| Componentes com fotos | Usar signed URLs |

