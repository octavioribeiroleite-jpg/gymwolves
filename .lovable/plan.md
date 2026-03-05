

## Problema

O dialog de check-in usa o componente `Dialog` (modal centralizado com position fixed) que não se adapta bem ao mobile — fica cortado ou com scroll estranho. A screenshot mostra o modal ocupando quase toda a tela mas sem encaixar direito.

## Solução

Trocar o `Dialog` por um **Drawer** (bottom sheet) no mobile, que é o padrão UX para formulários em apps mobile. O drawer sobe de baixo, se encaixa naturalmente e permite scroll interno.

### Mudança no `CheckinDialog.tsx`

1. Importar o `Drawer` do vaul (já instalado e configurado em `src/components/ui/drawer.tsx`)
2. Usar o hook `useIsMobile` para detectar mobile
3. No mobile: renderizar como `Drawer` (bottom sheet) com `DrawerContent`, `DrawerHeader`, `DrawerTitle`
4. No desktop: manter o `Dialog` atual
5. O formulário interno permanece o mesmo — só muda o container

### Arquivo afetado
- `src/components/CheckinDialog.tsx` — trocar Dialog por Drawer no mobile

