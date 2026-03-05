

## Design System Completo — Padronização Visual

Aplicar a nova paleta de cores e padrões visuais em todo o app sem alterar estrutura, layout, funcionalidades ou navegação.

### 1. Variáveis CSS (`src/index.css`)

Atualizar todos os tokens de cor:

| Token | Atual | Novo (HSL) | Hex |
|-------|-------|------------|-----|
| `--background` | `218 50% 7%` | `240 6% 12%` | #1C1C1E |
| `--foreground` | `224 60% 95%` | `0 0% 100%` | #FFFFFF |
| `--surface-1` / `--card` | `220 45% 12%` | `240 4% 18%` | #2C2C2E |
| `--surface-2` | `218 42% 15%` | `240 3% 15%` | #252528 |
| `--border` | `0 0% 100% / 0.06` | `240 3% 24%` | #3A3A3C |
| `--input` | `220 30% 14%` | `240 3% 15%` | #252528 |
| `--secondary` | `220 30% 14%` | `240 4% 18%` | #2C2C2E |
| `--muted` | `220 30% 14%` | `240 4% 18%` | #2C2C2E |
| `--muted-foreground` | `224 20% 68%` | `240 5% 63%` | #A1A1AA |
| `--text-tertiary` | `224 20% 45%` | `220 10% 42%` | #6B7280 |
| `--popover` | `218 42% 15%` | `240 4% 18%` | #2C2C2E |
| `--sidebar-background` | `218 50% 7%` | `240 6% 12%` | #1C1C1E |
| `--sidebar-accent` | `220 30% 14%` | `240 4% 18%` | #2C2C2E |
| `--sidebar-border` | atual | `240 3% 24%` | #3A3A3C |

Manter `--primary` (#22C55E), `--primary-dark` (#16A34A), `--warning`, `--destructive` inalterados.

Atualizar utilitários:
- `.border-subtle` → `border-color: #3A3A3C`
- `.gradient-card` → usar novos tons de surface
- `.glow-primary` → sombra mais sutil: `0 4px 12px rgba(0,0,0,0.15)`
- Adicionar medalha tokens no CSS: `--medal-gold`, `--medal-silver`, `--medal-bronze`

Tipografia: Ajustar font-sizes no `tailwind.config.ts`:
- `h1`: `22px` / `600` (era 28px/700)
- `h2`: `18px` / `600`
- `body`: `14px` / `400` (era 15px/500)
- `small`/`subtitle`: `13px`

Raio padrão: `--radius: 1rem` (16px, era 20px)

Body font-size: `14px` (era 15px)

Transições: adicionar `transition: all 200ms ease` como padrão nos utilitários.

### 2. Splash Screen (`src/components/SplashScreen.tsx`)

Atualizar cor hardcoded `hsl(218 50% 7%)` → `#1C1C1E`

### 3. Tailwind Config (`tailwind.config.ts`)

- Atualizar `fontSize` para a nova hierarquia
- Adicionar cores de medalha: `medal-gold`, `medal-silver`, `medal-bronze`
- Atualizar `--radius` para `1rem`

### 4. Componentes — apenas ajustes visuais de classe

Nenhuma mudança de estrutura. Os componentes já usam tokens CSS (`surface-1`, `border-subtle`, `bg-card`, etc.), então a maioria das mudanças será automática via CSS. Ajustes pontuais:

- **`StatCard.tsx`**: padding `p-4` (era `p-2.5`), `rounded-2xl` (16px)
- **`AppScaffold.tsx`**: header height `h-16` (64px), `px-4` (16px)
- **`DashboardHeader.tsx`**: `h-16` no header
- **`WorkoutStatusCard.tsx`**: `rounded-2xl` (16px)
- **Cards em geral**: box-shadow `0 4px 12px rgba(0,0,0,0.15)` via utilitário `.card-shadow`
- **Ranking.tsx**: medalhas com cores explícitas do token, borda verde no usuário atual mantida

### Arquivos alterados
1. `src/index.css` — paleta completa
2. `tailwind.config.ts` — tipografia, raio, cores de medalha
3. `src/components/SplashScreen.tsx` — cor de fundo
4. `src/components/ds/StatCard.tsx` — padding/radius
5. `src/components/ds/AppScaffold.tsx` — header height
6. `src/components/dashboard/DashboardHeader.tsx` — header height
7. `src/components/dashboard/WorkoutStatusCard.tsx` — radius

### Resultado
App visualmente mais leve, moderno e consistente — inspirado em Strava/Apple Fitness — sem alterar nenhuma funcionalidade ou estrutura.

