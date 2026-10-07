# Plano de Correção Definitiva — Especificações e Remoção de "4x4"

Este plano visa resolver o problema de preenchimento de especificações técnicas via IA, garantindo que os dados sejam buscados, mapeados e salvos corretamente no banco de dados, além de remover completamente a menção a "4x4" da interface do usuário.

## Alterações Técnicas

### 1. Hardening da IA e Mapeamento de Dados
- **Prompt da IA (`src/lib/ai.server.ts`):** Ajustar o `SYSTEM_PROMPT` para ser mais incisivo na busca por modelos exatos e no preenchimento de todos os campos técnicos. Substituir o termo "Não informado" por "Não confirmado" na instrução de fallback da IA.
- **Esquema de Dados (`src/lib/machineAi.schemas.ts`):** Revisar as propriedades para garantir que todos os campos da ficha técnica (como caçamba dianteira/traseira, profundidade, etc.) estejam presentes e com tipos corretos.
- **Salvamento de Dados (`src/lib/ai.functions.ts`):** Corrigir a função `publishMachineFromAi` para garantir que o payload inclua todos os novos campos técnicos. Verificar o mapeamento entre o objeto retornado pela IA e as colunas da tabela `machines`.

### 2. Execução e Auditoria em Massa
- **Ferramenta de Preenchimento (`src/routes/_authenticated/admin.ia.tsx`):**
    - Corrigir a lógica de `MassFillTool` para processar sequencialmente todas as máquinas.
    - Garantir que a IA utilize Marca + Modelo + Categoria para a busca.
    - Implementar a auditoria automática pós-processamento que lista campos que permaneceram como `null` ou "Não confirmado".
- **Garantia de Persistência:** Adicionar logs e verificações para confirmar que a transação no banco de dados foi concluída com sucesso para cada registro.

### 3. Remoção do "4x4"
- **Filtros e UI:** Remover qualquer referência visual a "4x4" em `FilterChips.tsx`, `MachineCard.tsx` e nas páginas de catálogo e comparação.
- **Especificações:** Ocultar o campo de tração/4x4 na ficha técnica se ele existir como metadado, focando nas especificações operacionais solicitadas.

### 4. Normalização e Padrões
- **Condição e Horímetro:** Forçar "NOVA DE FÁBRICA" e "0 horas" via código durante o preenchimento, sem depender da IA para estes campos fixos.
- **Localização:** Orientar a IA a buscar a fábrica industrial da marca (ex: Caterpillar em Piracicaba).

## Verificação
- **Auditoria de Banco:** Realizar uma consulta via SQL (ou interface de auditoria) para validar que não restaram campos "Não informado".
- **Teste de Sessão:** Validar que as especificações persistem após logout/login e em diferentes dispositivos.
- **Relatório Final:** Apresentar a contagem real de máquinas processadas, atualizadas e campos pendentes.

Nenhuma alteração estrutural no layout, preços ou IDs de máquinas será realizada.
