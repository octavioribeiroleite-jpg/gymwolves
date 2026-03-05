

## Plano: Aviso de Reinstalação para Atualizar Ícone

### Conceito

Criar um componente `PwaReinstallBanner` que aparece **apenas para quem já tem o app instalado em modo standalone** e está com a versão antiga. Usa um número de versão salvo no `localStorage` para detectar se o usuário precisa reinstalar.

### Como funciona

1. Definir uma constante `APP_ICON_VERSION` no código (ex: `"2"`)
2. Quando o app abre em modo standalone, comparar com o valor salvo em `localStorage`
3. Se for diferente (ou não existir), exibir um banner/pop-up:
   - **Título**: "Nova identidade visual!"
   - **Mensagem**: "Reinstale o app para atualizar o ícone na tela inicial"
   - **Passos**: Desinstalar o app → Acessar o site → Instalar novamente
   - **Botão "Lembrar depois"**: salva snooze de 24h
   - **Botão "Já reinstalei"**: salva a versão atual e fecha
4. Futuras mudanças de ícone: basta incrementar `APP_ICON_VERSION`

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/components/PwaReinstallBanner.tsx` | **Novo** — componente com o banner de reinstalação, só visível em standalone + versão desatualizada |
| `src/App.tsx` | Adicionar `<PwaReinstallBanner />` junto aos outros componentes globais |

### Detalhes do banner

- Aparece como bottom sheet (similar ao `PwaInstallPrompt`)
- Instruções específicas por plataforma (Android: segurar ícone → desinstalar; iOS: segurar → remover app)
- Link para copiar URL do app para facilitar o acesso após desinstalar
- Só aparece em modo standalone (quem tem o app instalado)

