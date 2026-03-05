

## Tema Claro — Migração Visual Completa

Migrar todo o app de tema escuro para tema claro, atualizando apenas tokens CSS e ajustes visuais pontuais. Nenhuma mudança de estrutura, lógica ou navegação.

### 1. Variáveis CSS (`src/index.css`)

Atualizar todos os tokens:

| Token | Atual (dark) | Novo (light) | Hex |
|-------|-------------|--------------|-----|
| `--background` | `240 6% 12%` | `220 14% 96%` | #F3F4F6 |
| `--foreground` | `0 0% 100%` | `220 39% 11%` | #111827 |
| `--surface-1` / `--card` | `240 4% 18%` | `0 0% 100%` | #FFFFFF |
| `--surface-2` | `240 3% 15%` | `210 20% 98%` | #F9FAFB |
| `--card-foreground` | `0 0% 100%` | `220 39% 11%` | #111827 |
| `--popover` | `240 4% 18%` | `0 0% 100%` | #FFFFFF |
| `--popover-foreground` | `0 0% 100%` | `220 39% 11%` | #111827 |
| `--secondary` | `240 4% 18%` | `210 20% 98%` | #F9FAFB |
| `--secondary-foreground` | `0 0% 100%` | `220 39% 11%` | #111827 |
| `--muted` | `240 4% 18%` | `210 20% 98%` | #F9FAFB |
| `--muted-foreground` | `240 5% 63%` | `220 9% 46%` | #6B7280 |
| `--accent` | `142 71% 45%` | `142 71% 45%` | (mantido) |
| `--accent-foreground` | `0 0% 100%` | `0 0% 100%` | (mantido) |
| `--border` | `240 3% 24%` | `220 13% 91%` | #E5E7EB |
| `--input` | `240 3% 15%` | `213 27% 95%` | #F1F5F9 |
| `--ring` | mantido | mantido | |
| `--sidebar-background` | dark | `220 14% 96%` | #F3F4F6 |
| `--sidebar-foreground` | white | `220 39% 11%` | #111827 |
| `--sidebar-accent` | dark | `210 20% 98%` | #F9FAFB |
| `--sidebar-accent-foreground` | white | `220 39% 11%` | #111827 |
| `--sidebar-border` | dark | `220 13% 91%` | #E5E7EB |
| `--text-tertiary` | `220 10% 42%` | `220 9% 64%` | #9CA3AF |
| `--destructive-foreground` | white | white | (mantido) |
| `--primary-foreground` | white | white | (mantido) |

Atualizar utilitários:
- `.border-subtle` → `border-color: #E5E7EB`
- `.gradient-card` → usar tons claros (#FFFFFF → #F9FAFB)
- `.card-shadow` → `0 2px 8px rgba(0,0,0,0.06)` (mais leve)
- `.glow-primary` → `0 10px 20px rgba(34,197,94,0.25)`
- `.text-secondary-alpha` → `color: #6B7280`
- `.text-tertiary-alpha` → `color: #9CA3AF`

### 2. Splash Screen (`src/components/SplashScreen.tsx`)

- Manter fundo escuro `#1C1C1E` (splash é uma tela de impacto, funciona melhor escura)
- Texto do título na splash já é branco, fica correto

### 3. Tela de Auth (`src/pages/Auth.tsx`)

- O form container usa `surface-1` e `border-subtle` — vai herdar as novas cores automaticamente
- O título grande "GYM WOLVES" usa `text-foreground` implícito → ficará `#111827` (escuro)
- O fundo `bg-background` → ficará `#F3F4F6`

### 4. Bottom Nav (`src/components/BottomNav.tsx`)

- Usa `bg-background/95` e `border-subtle` → herda automaticamente
- Badge `ring-background` → atualizará para o fundo claro

### 5. Componentes que herdam automaticamente (sem edição)

A maioria dos componentes usa tokens CSS (`bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-subtle`, `surface-1`, `surface-2`), então herdarão as novas cores sem alteração:
- StatCard, AppScaffold, DashboardHeader, WorkoutStatusCard
- Cards de ranking, feed, convite
- Inputs (usam `bg-secondary` / `border-subtle`)
- Botões (primário mantém verde com texto branco)
- FAB (mantém verde)

### Arquivos alterados
1. **`src/index.css`** — paleta completa + utilitários

Apenas 1 arquivo precisa ser editado. Toda a migração é via tokens CSS.

