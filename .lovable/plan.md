## Mostrar a foto do treino bem encaixada na célula do calendário

### Problema atual
A foto do dia 8 aparece com um "1" laranja gigante invadindo. Isso acontece porque:
- A foto é um screenshot grande (~1170px) do iPhone, com status bar no topo.
- O `getThumbnailUrl` aponta para `/render/image/public/?width=80&resize=cover` — mas a transformação de imagem do Supabase só funciona em planos pagos. No nosso caso, devolve a imagem original e a query é ignorada.
- O `<img>` com `object-cover` numa célula de ~40px corta a imagem em um ponto qualquer, expondo elementos como horário/Spotify do screenshot original.

### Solução: aumentar a célula e renderizar a foto como miniatura real

**1. Aumentar o tamanho do calendário** (`src/components/dashboard/MonthlyHeatmap.tsx`)

Trocar `gap-1` por `gap-1.5` no grid e remover `text-[10px]` exagerado das células — usar `text-xs` para o número ficar proporcional. As células continuam `aspect-square`, mas em telas mobile ficam ~50px (suficiente para reconhecer a foto).

**2. Reescrever `PhotoThumbnail`** (linhas 36–51)

```tsx
const PhotoThumbnail = ({ proofUrl }: { proofUrl: string }) => {
  const url = getThumbnailUrl(proofUrl, 160); // 2x para retina
  if (!url) return null;
  return (
    <>
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center rounded-md z-0 opacity-0 transition-opacity duration-300"
        onLoad={(e) => (e.target as HTMLImageElement).classList.replace("opacity-0", "opacity-100")}
        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
      />
      {/* Gradient mais leve só na parte inferior, para o número ficar legível sem esconder a foto */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-[1] rounded-b-md bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </>
  );
};
```

**3. Mover o número do dia para o canto inferior** (linhas 285–287)

Em vez de centralizado por cima da foto, posicionar no canto inferior-esquerdo, sobre o gradiente — assim a foto aparece inteira no topo e o número fica legível embaixo.

```tsx
<span className="absolute bottom-0.5 left-1 z-10 text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none">
  {format(cell.date, "d")}
</span>
```

E para células **sem foto**, manter o número centralizado como antes (renderizar condicionalmente).

**4. Substituir `getThumbnailUrl` por `getPublicImageUrl`** quando o transform não estiver disponível

Como o `render/image` provavelmente devolve a original mesmo, vale só usar `getPublicImageUrl` direto — fica igual em qualidade e mais previsível.

### Resultado
- A foto do treino aparece visível na célula (como historinho de fotos).
- Um gradiente sutil só na metade inferior garante leitura do número.
- Número do dia no canto inferior-esquerdo, com sombra forte.
- Células sem foto mantêm o visual atual (verde com número centralizado).

### Não vou mexer em
- Backend / RLS / storage (foto já é pública).
- DayDetailSheet (modal expandido continua igual).