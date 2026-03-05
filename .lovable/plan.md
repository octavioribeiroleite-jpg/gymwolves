

## Problema

O botão "Criar desafio" no `HomeChallengesList.tsx` navega para `/create-group`, mas a rota correta definida no `App.tsx` é `/grupos/criar`. Isso causa o erro 404.

## Correção

Alterar a linha 37 de `src/components/dashboard/HomeChallengesList.tsx`: trocar `navigate("/create-group")` por `navigate("/grupos/criar")`.

Verificar também o botão "Entrar com código" na mesma tela — ele navega para `/join`, mas a rota correta é `/grupos/entrar`.

