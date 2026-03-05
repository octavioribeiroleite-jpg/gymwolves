

## Situação Atual

- **Cíntia** (`3d5250ba`): 1 dia de check-in registrado
- **Octávio** (`6c258b87`): 1 dia de check-in registrado
- **Grupo**: "Cintia e Octávio" (`f7f6e216`)

## Plano

Inserir check-ins retroativos para completar os dias desejados:

- **Cíntia**: precisa de +46 check-ins (total = 47 dias), um por dia, retroativos a partir de ontem
- **Octávio**: precisa de +40 check-ins (total = 41 dias), um por dia, retroativos a partir de ontem

Será feito via migração SQL com `generate_series` para criar um check-in por dia em datas consecutivas passadas, evitando duplicar a data que já existe.

### Detalhes técnicos
- Inserção em `checkins` com `workout_type = 'musculacao'`, `title = 'Treino'`, `proof_type = 'manual'`
- Datas geradas com `generate_series(CURRENT_DATE - interval 'N days', CURRENT_DATE - interval '1 day', '1 day')`
- Exclui datas que já possuem check-in para evitar duplicatas

