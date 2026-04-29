## Corrigir sobreposição do "1" laranja sobre o calendário

O número grande laranja vem de outro elemento absoluto da página invadindo o grid do calendário. A solução é criar um stacking context próprio em cada célula com `isolate`, fixar `z-0` na foto e `pointer-events-none` no número.

### Alterações em `src/components/dashboard/MonthlyHeatmap.tsx`

**1. PhotoThumbnail (linha 46)** — adicionar `z-0` à classe da `<img>`:
```
absolute inset-0 w-full h-full object-cover rounded-md z-0 opacity-0 transition-opacity duration-300
```

**2. Botão da célula (linha 272)** — adicionar `isolate` ao container para criar stacking context:
```
relative aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 overflow-hidden isolate
```

**3. Span do número do dia (linha 285)** — adicionar `pointer-events-none`:
```
relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none
```

### Por que funciona
- `isolate` cria um novo stacking context na célula, impedindo que elementos `absolute` de fora (como o "1" laranja) atravessem o grid.
- `z-0` na foto + `z-10` no número garante a ordem correta dentro da célula.
- `pointer-events-none` no número evita interferência no clique do botão.