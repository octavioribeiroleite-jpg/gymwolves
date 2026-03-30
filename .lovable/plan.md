

## Plano: Tornar imagens estáveis e rápidas

### Problema raiz

Cada componente que exibe uma imagem chama `createSignedUrl` individualmente via `useSignedUrl`. Isso causa:
- **Sem cache**: a mesma imagem gera uma chamada de rede toda vez que o componente monta/remonta
- **Cascata de requests**: o Dashboard renderiza ~10+ componentes, cada um disparando signed URL requests em paralelo
- **Flash de conteúdo vazio**: `useState(null)` → render sem imagem → resolve → re-render com imagem

### Solução: Bucket público + URL direta (sem signed URLs)

A abordagem mais simples e performática: tornar o bucket `checkin-photos` **público** e usar URLs diretas, eliminando 100% das chamadas de signed URL.

Fotos de treino não são dados sensíveis — são compartilhadas no feed do grupo. Torná-las públicas é seguro e resolve o problema na raiz.

### Alterações

**1. Migração SQL** — Tornar o bucket público
```sql
UPDATE storage.buckets SET public = true WHERE id = 'checkin-photos';
```
E adicionar policy de leitura pública nos objetos.

**2. `src/lib/storage.ts`** — Nova função `getPublicImageUrl`
- Usar `supabase.storage.from(BUCKET).getPublicUrl(path)` que retorna URL síncrona, sem chamada de rede
- Manter `getSignedImageUrl` como fallback mas não usar mais

**3. `src/hooks/useSignedUrl.ts`** — Simplificar para URL síncrona
- `useSignedUrl` passa a retornar a URL pública diretamente (síncrono, sem useState/useEffect)
- `useSignedUrls` retorna array de URLs públicas diretamente
- Zero chamadas de rede, zero delay, zero flash

**4. Todos os consumidores** — Nenhuma mudança necessária
- Como `useSignedUrl` mantém a mesma interface (recebe path, retorna string|null), todos os componentes (`WorkoutStatusCard`, `ActivityFeed`, `PostCard`, `RecentHistory`, `MonthlyHeatmap`) continuam funcionando sem alteração

### Resultado

- Imagens aparecem instantaneamente (URL síncrona)
- Zero chamadas extras de rede para resolver URLs
- Zero flashes ou delays
- Sem re-renders desnecessários
- Performance drasticamente melhor no Dashboard

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| Migração SQL | Bucket público + policy de leitura |
| `src/lib/storage.ts` | Adicionar `getPublicImageUrl`, síncrona |
| `src/hooks/useSignedUrl.ts` | Retornar URL pública síncrona em vez de signed URL assíncrona |
| `MonthlyHeatmap.tsx` | Remover `PhotoThumbnail` e `DayDetailSheet` com signed URL manual, usar a nova função |

