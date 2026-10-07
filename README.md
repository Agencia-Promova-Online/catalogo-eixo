# Invest Machine Catalog

PROMPT 2 — SISTEMA INTERNO DE CATÁLOGO DE MÁQUINAS | INVEST INTERMEDIAÇÃO

Continue o desenvolvimento do sistema “Catálogo de Máquinas – Invest Intermediação”.

O objetivo é criar uma plataforma interna para que toda a equipe comercial consiga consultar rapidamente máquinas, fotos, valores, entradas e parcelas durante o atendimento aos clientes.

O sistema deve ser profissional, rápido, responsivo e principalmente muito fácil de utilizar pelo celular.

1. AUTENTICAÇÃO E ACESSO

Criar sistema de login seguro.

Cada funcionário deverá possuir seu próprio usuário.

Criar dois níveis de acesso:

ADMINISTRADOR

Pode:

Criar máquinas

Editar máquinas

Excluir máquinas

Alterar valores

Alterar entrada

Alterar parcelas

Adicionar fotos

Excluir fotos

Definir foto principal

Alterar disponibilidade

Criar usuários

Editar usuários

Ativar/desativar usuários

Visualizar todos os dados

VENDEDOR

Pode:

Fazer login

Visualizar máquinas

Pesquisar máquinas

Filtrar por categoria

Abrir detalhes

Visualizar todas as fotos

Copiar informações

Compartilhar máquina

Enviar informações pelo WhatsApp

O vendedor NÃO pode alterar preços ou excluir máquinas.

2. DASHBOARD PRINCIPAL

Depois do login, o usuário deverá visualizar:

Cabeçalho

Logo/nome:

INVEST INTERMEDIAÇÃO

Título:

CATÁLOGO DE MÁQUINAS

Mostrar:

Nome do usuário logado

Tipo de usuário

Botão sair

3. PESQUISA RÁPIDA

Criar uma barra de pesquisa em destaque:

“🔎 Pesquisar máquina ou modelo...”

A pesquisa deve encontrar rapidamente por:

Marca

Modelo

Categoria

Código da máquina

Exemplo:

Se o vendedor digitar:

“416”

mostrar:

RETROESCAVADEIRA CAT 416

Se digitar:

“Volvo”

mostrar todas as máquinas Volvo.

Se digitar:

“JCB”

mostrar todas as máquinas JCB.

4. FILTROS

Criar filtros rápidos:

TODAS

ESCAVADEIRAS

RETROESCAVADEIRAS

MINI ESCAVADEIRAS

MINI CARREGADEIRAS

PÁ CARREGADEIRAS

MÁQUINAS AGRÍCOLAS

CAMINHÕES

Outras categorias poderão ser adicionadas posteriormente pelo administrador.

5. CARDS DAS MÁQUINAS

Cada máquina deve aparecer em um card moderno.

O card deve conter:

[ FOTO DA MÁQUINA ]

🚜 MARCA + MODELO

Categoria

💰 Valor

💳 Entrada

📆 Parcela a partir de

Status:

🟢 DISPONÍVEL

Botões:

“VER DETALHES”

“WHATSAPP”

A imagem deve ocupar uma área grande do card.

No celular, os cards devem se adaptar perfeitamente à tela.

6. CADASTRAR AS 12 MÁQUINAS INICIAIS

Cadastrar exatamente os seguintes equipamentos:

01 — ESCAVADEIRA VOLVO 220D/DL

Categoria:
Escavadeira

Valor:
R$ 650.900,00

Entrada:
R$ 56.300,00

Parcela:
R$ 5.900,00

Status:
Disponível

02 — ESCAVADEIRA CATERPILLAR 320

Categoria:
Escavadeira

Valor:
R$ 647.000,00

Entrada:
R$ 50.300,00

Parcela:
R$ 6.000,00

Status:
Disponível

03 — ESCAVADEIRA VOLVO EC140

Categoria:
Escavadeira

Valor:
R$ 546.000,00

Entrada:
R$ 49.293,80

Parcela:
R$ 4.942,12

Status:
Disponível

04 — RETROESCAVADEIRA JCB 3CX

Categoria:
Retroescavadeira

Valor:
R$ 400.000,00

Entrada:
R$ 36.477,41

Parcela:
R$ 3.657,17

Status:
Disponível

05 — RETROESCAVADEIRA JCB 4CX

Categoria:
Retroescavadeira

Valor:
R$ 450.000,00

Entrada:
R$ 42.000,00

Parcela:
R$ 4.200,00

Status:
Disponível

06 — RETROESCAVADEIRA CASE 580N

Categoria:
Retroescavadeira

Valor:
R$ 416.300,00

Entrada:
R$ 37.600,00

Parcela:
R$ 3.800,00

Status:
Disponível

07 — RETROESCAVADEIRA CAT 416

Categoria:
Retroescavadeira

Valor:
R$ 437.183,03

Entrada:
R$ 39.435,06

Parcela:
R$ 3.953,72

Status:
Disponível

08 — MINI CARREGADEIRA CASE SV185B

Categoria:
Mini Carregadeira

Valor:
R$ 285.000,00

Entrada:
R$ 24.000,00

Parcela:
R$ 2.200,00

Status:
Disponível

09 — MINI ESCAVADEIRA JCB 35Z-1

Categoria:
Mini Escavadeira

Observação:
3,5 toneladas

Valor:
R$ 295.098,55

Entrada:
R$ 26.618,66

Parcela:
R$ 2.668,75

Status:
Disponível

10 — MINI CARREGADEIRA CATERPILLAR 250

Categoria:
Mini Carregadeira

Valor:
R$ 284.168,97

Entrada:
R$ 25.632,78

Parcela:
R$ 2.569,91

Status:
Disponível

11 — MINI ESCAVADEIRA SANY SY16C

Categoria:
Mini Escavadeira

Valor:
R$ 273.239,40

Entrada:
R$ 21.206,27

Parcela:
R$ 2.494,01

Status:
Disponível

12 — BOBCAT S450

Categoria:
Mini Carregadeira

Valor:
R$ 250.000,00

Entrada:
R$ 20.000,00

Parcela:
R$ 1.900,00

Status:
Disponível

7. SISTEMA DE FOTOS

Cada máquina precisa possuir uma galeria própria.

Criar suporte para:

Foto principal

Foto lateral

Foto traseira

Foto cabine

Foto motor

Foto implementos

Outras fotos

O administrador deverá conseguir fazer upload de várias imagens.

Permitir:

Adicionar foto

Excluir foto

Definir foto principal

Reordenar fotos

As imagens devem ser armazenadas no Storage do sistema e continuar disponíveis após logout, atualização da página ou novo acesso.

IMPORTANTE:

Não utilizar imagens aleatórias ou imagens temporárias externas como foto definitiva das máquinas.

Caso ainda não exista foto cadastrada, mostrar um placeholder profissional:

“FOTO DA MÁQUINA”

8. PÁGINA DE DETALHES

Ao clicar em “VER DETALHES”, abrir uma página completa.

Mostrar:

Galeria de fotos

Marca

Modelo

Categoria

Ano

Valor

Entrada

Parcela

Potência

Peso operacional

Horímetro

Localização

Descrição

Disponibilidade

Observações

Os campos técnicos devem ser editáveis pelo administrador.

Não inventar especificações técnicas.

Se uma informação ainda não tiver sido cadastrada, mostrar:

“Não informado”

9. BOTÃO WHATSAPP

Criar botão:

🟢 ENVIAR PELO WHATSAPP

Ao clicar, abrir o WhatsApp com uma mensagem automaticamente preenchida.

Mensagem:

🚜 [MODELO]

💰 Valor: [VALOR]

💳 Entrada: [ENTRADA]

📆 Parcelas a partir de: [PARCELA]

Tenho fotos e informações completas dessa máquina.

Posso te enviar?

O sistema deve permitir compartilhar o link direto da máquina.

10. BOTÃO COPIAR INFORMAÇÕES

Criar botão:

📋 COPIAR INFORMAÇÕES

Ao clicar, copiar para a área de transferência:

🚜 [MODELO]

💰 Valor: R$ XXXXX

💳 Entrada: R$ XXXXX

📆 Parcelas a partir de: R$ XXXXX

Status: Disponível

Após copiar, mostrar:

“Informações copiadas!”

11. STATUS DA MÁQUINA

Cada máquina deverá possuir um status:

🟢 Disponível

🟡 Em negociação

🔴 Vendida

⚪ Indisponível

O status deve aparecer claramente no card.

Somente o administrador poderá alterar o status.

12. PAINEL ADMINISTRATIVO

Criar menu:

“ADMINISTRAÇÃO”

Dentro dele:

Máquinas

Listar máquinas

Adicionar máquina

Editar máquina

Excluir máquina

Gerenciar fotos

Usuários

Listar usuários

Criar usuário

Editar usuário

Ativar usuário

Desativar usuário

Categorias

Permitir criar novas categorias.

Configurações

Permitir editar:

Nome da empresa

Logo

Telefone

WhatsApp

Texto padrão do WhatsApp

13. BANCO DE DADOS

Criar estrutura adequada para produção.

Tabela:

machines

Campos:

id
brand
model
category
description
year
price
down_payment
installment
power
operating_weight
hours
location
status
created_at
updated_at

Tabela:

machine_images

Campos:

id
machine_id
image_url
is_main
sort_order
created_at

Tabela:

users

Campos:

id
name
email
role
active
created_at
updated_at

Tabela:

categories

Campos:

id
name
active
created_at

14. SEGURANÇA

Implementar permissões corretamente.

VENDEDOR:

Pode somente visualizar e compartilhar.

ADMINISTRADOR:

Pode alterar os dados.

Nenhum vendedor deve conseguir alterar preços diretamente pelo navegador ou pelas requisições da aplicação.

As permissões precisam ser protegidas no backend/banco de dados, não somente escondendo botões na interface.

15. RESPONSIVIDADE

Prioridade máxima para celular.

O sistema deve funcionar perfeitamente em:

Smartphone

Tablet

Notebook

Desktop

No celular:

Cards em uma coluna

Botões grandes

Fotos grandes

Busca fácil

WhatsApp facilmente acessível

16. DESIGN

Criar identidade visual premium para o segmento de máquinas pesadas.

Estilo:

Profissional
Industrial
Moderno
Confiável
Limpo

Utilizar como referência visual:

Preto

Branco

Cinza

Amarelo como destaque

Não exagerar nas cores.

As fotos das máquinas devem ser o principal destaque visual.

17. DASHBOARD COM RESUMO

No topo do painel administrativo mostrar:

TOTAL DE MÁQUINAS

MÁQUINAS DISPONÍVEIS

EM NEGOCIAÇÃO

VENDIDAS

Também mostrar quantidade por categoria.

Exemplo:

🚜 Retroescavadeiras: 4

🏗️ Escavadeiras: 3

🔧 Mini Escavadeiras: 2

🚜 Mini Carregadeiras: 3

18. ATUALIZAÇÃO CENTRALIZADA

IMPORTANTE:

O catálogo deve trabalhar com uma única fonte de dados.

Se o administrador alterar:

CAT 416

Valor:
R$ 437.183,03

para:

R$ 450.000,00

todos os vendedores devem visualizar automaticamente:

R$ 450.000,00

Não criar cópias diferentes dos dados para cada usuário.

19. DATA DA ÚLTIMA ATUALIZAÇÃO

Em cada máquina mostrar discretamente:

“Atualizado em: DD/MM/AAAA”

Isso ajuda os vendedores a saberem se estão consultando uma condição recente.

20. EXPERIÊNCIA PRINCIPAL

O sistema deve ser otimizado para este cenário:

O vendedor está no telefone com um cliente.

Cliente pergunta:

“Quanto está uma Caterpillar 416?”

O vendedor:

Abre o catálogo.

Digita “416”.

Aparece CAT 416.

Visualiza a foto.

Visualiza o valor.

Visualiza a entrada.

Visualiza a parcela.

Clica em “WhatsApp”.

Envia para o cliente.

Todo esse processo deve ser extremamente rápido.

21. IMPORTANTE SOBRE OS VALORES

Os valores cadastrados são informações comerciais fornecidas pela empresa.

Não modificar, arredondar ou recalcular os valores fornecidos.

Manter exatamente:

R$ 437.183,03

R$ 39.435,06

R$ 3.953,72

por exemplo.

Os campos monetários devem utilizar formato brasileiro:

R$ 0.000,00

22. PREPARAR PARA EXPANSÃO

A estrutura deve permitir adicionar futuramente:

Novas máquinas

Caminhões

Tratores

Colheitadeiras

Implementos

Fotos

Vídeos

Fichas técnicas

Localização

Ano

Horímetro

Observações

Documentação

Condições especiais de financiamento

Não deixar a estrutura limitada somente às 12 máquinas iniciais.

23. PRIORIDADE DO PROJETO

Priorizar nesta ordem:

Login

Segurança e permissões

Banco de dados

Cadastro das máquinas

Upload e armazenamento das fotos

Busca rápida

Filtros

Cards

Página de detalhes

WhatsApp

Painel administrativo

Responsividade

Antes de finalizar, testar todo o fluxo:

LOGIN → CATÁLOGO → PESQUISA → MÁQUINA → FOTOS → DETALHES → WHATSAPP

Garantir que não existam erros de navegação, permissões ou carregamento.

Não criar funcionalidades fictícias. Se uma função depender de configuração externa, deixar a estrutura preparada e informar claramente o que precisa ser configurado.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://invest-catalog.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/021739e1-67d7-4cdf-bf74-94af41263a73).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
#   c a t a l o g o - e i x o  
 