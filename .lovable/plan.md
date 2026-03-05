

## Problema Identificado

A query de membros está falhando com erro **400** porque não existe uma **foreign key** entre `group_members.user_id` e `profiles.id`. A query no `useGroupMembers` tenta fazer um join automático:

```
.select("*, profiles:user_id(id, display_name, avatar_url)")
```

Mas o PostgREST precisa de uma FK para resolver esse join. Sem ela, retorna erro `PGRST200`.

## Correção

Duas opções (vou usar a combinação):

**1. Adicionar FK** de `group_members.user_id` para `profiles.id` via migration SQL:
```sql
ALTER TABLE public.group_members
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

**2. Também adicionar FK** em `checkins.user_id` para `profiles.id` (mesmo problema potencial):
```sql
ALTER TABLE public.checkins
ADD CONSTRAINT checkins_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

Isso resolve o join e os membros passam a aparecer no ranking.

### Arquivos afetados
- Apenas migration SQL (nenhuma mudança de código necessária)

