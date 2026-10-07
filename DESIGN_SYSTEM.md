# Design System — Consórcio Pro

## 1. Paleta de Cores

### Dourado (cor primária de destaque)

| Tom   | Hex       | Uso                                                         |
|-------|-----------|-------------------------------------------------------------|
| 50    | `#FBF8F0` | Fundo de campos travados, badges claros                     |
| 100   | `#F5EDD8` | Bordas suaves dourado                                      |
| 200   | `#EBDBB1` | Bordas de campos travados, badges                           |
| 300   | `#DCC588` | Estados intermediários                                      |
| 400   | `#CDB05F` | Hover de botões                                            |
| **500** | **`#B8963F`** | **Cor principal — botões, logo, itens ativos da sidebar** |
| 600   | `#A07F33` | Hover escuro de botões                                     |
| 700   | `#83682B` | Active press                                               |
| 800   | `#665024` | Textos dourado escuro                                       |
| 900   | `#4D3C1B` | Detalhes finos                                             |

### Ink (preto / neutro)

| Tom   | Hex       | Uso                                                         |
|-------|-----------|-------------------------------------------------------------|
| 50    | `#F6F6F6` | Fundo do app (body)                                        |
| 100   | `#E2E2E2` | Bordas de cards, fundos de hover                            |
| 200   | `#C5C5C5` | Bordas de inputs, scrollbar                                |
| 300   | `#9E9E9E` | Texto placeholder, ícones secundários                      |
| 400   | `#6E6E6E` | Subtítulos, texto de apoio                                  |
| 500   | `#4A4A4A` | Texto de botões ghost                                       |
| 600   | `#333333` | Labels, texto de inputs                                     |
| 700   | `#222222` | Texto de botões secundários                                 |
| 800   | `#171717` | Fundo de sidebar (áreas de hover)                           |
| **900** | **`#111111`** | **Fundo da sidebar, tela de login, textos principais**   |

### Cores semânticas

| Cor     | Uso                                                        |
|---------|------------------------------------------------------------|
| Verde   | Status "ativa", "visualizada", sucesso                     |
| Azul    | Status "enviada", papel "vendedor"                         |
| Vermelho| Ações destrutivas, erro, excluir                          |
| Âmbar   | Alerta de taxa não encontrada                              |

---

## 2. Tipografia

| Função                         | Fonte       | Pesos                    | Tamanho                    |
|--------------------------------|-------------|--------------------------|----------------------------|
| Display (títulos, números)     | **Poppins** | 400, 500, 600, 700       | 2xl (24px) em headers       |
| Body (texto geral)             | **Inter**   | 300, 400, 500, 600, 700  | sm (14px) padrão           |
| Label de campo                 | Inter       | 500 (medium)             | sm (14px)                  |
| Texto de apoio                 | Inter       | 400                      | xs (12px)                  |
| Badges                         | Inter       | 500                      | xs (12px)                  |

**Line-height:** 150% para body, ~120% para headings (`tracking-tight` em títulos principais).

Fontes carregadas via Google Fonts no `index.css`.

---

## 3. Espaçamento

Sistema baseado em **8px** (multiplicadores de Tailwind):

| Token  | px   | Uso                                                    |
|--------|------|--------------------------------------------------------|
| gap-1  | 4px  | Entre ícone e texto dentro de badges/tags             |
| gap-2  | 8px  | Entre botões de ação rápida                            |
| gap-3  | 12px | Entre ícone e texto em itens de navegação              |
| gap-4  | 16px | Entre campos de formulário, entre cards em grid        |
| p-4    | 16px | Padding interno de filtros mobile                     |
| p-5    | 20px | Padding interno de cards de stat e marcas             |
| p-6    | 24px | Padding interno de modais e containers grandes         |
| p-8    | 32px | Padding interno do card de login                       |
| mb-6   | 24px | Separação entre header de página e conteúdo            |
| mb-8   | 32px | Separação entre seções grandes                         |

---

## 4. Cantos Arredondados

| Token        | Valor | Aplicação                                              |
|--------------|-------|--------------------------------------------------------|
| `rounded-lg` | 8px   | Botões pequenos, toggle de login, scrollbar           |
| `rounded-xl`| 14px  | Inputs, botões, ícones de stat, itens de navegação    |
| `rounded-2xl`| 20px | Cards, modais, container de login, empty states        |

---

## 5. Componentes Reutilizáveis

### 5.1 Botões

| Classe         | Aparência                                         | Uso                                    |
|----------------|---------------------------------------------------|----------------------------------------|
| `.btn-primary` | Fundo `gold-500`, texto branco, sombra suave      | Ação principal (salvar, nova marca)     |
| `.btn-secondary`| Fundo branco, borda `ink-200`, texto `ink-700`   | Ação secundária (cancelar, voltar)      |
| `.btn-danger`  | Fundo `red-50`, borda `red-200`, texto `red-600`  | Excluir, deletar                        |
| `.btn-ghost`   | Sem fundo/borda, texto `ink-500`                  | Ações discretas (voltar sem salvar)    |

Todos têm `transition-all duration-200` (200ms), estado `hover` e `disabled:opacity-50`.

### 5.2 Inputs

| Classe         | Aparência                                                                |
|----------------|--------------------------------------------------------------------------|
| `.input-field` | Borda `ink-200`, fundo branco, focus ring `gold-400` 2px, texto 14px     |
| `.input-locked`| Borda `gold-200`, fundo `gold-50`, cursor bloqueado — taxas travadas      |
| `.label-field` | Texto 14px, peso 500, cor `ink-600`, margem inferior 6px                  |

Ícones dentro de inputs: posicionados `absolute left-3`, tamanho `w-4 h-4`, cor `ink-300`.

### 5.3 Card

`.card` — Fundo branco, borda `ink-100`, `rounded-2xl`, `shadow-sm`.
Hover em cards interativos: `hover:shadow-md transition-shadow`.

### 5.4 Badges

Formato: pílula (`rounded-full`), texto 12px, peso 500, borda 1px.

| Status     | Fundo       | Texto       | Borda         |
|------------|-------------|-------------|---------------|
| ativa      | `green-50`  | `green-600` | `green-200`   |
| inativa    | `ink-100`   | `ink-400`   | `ink-200`     |
| gerada     | `gold-50`   | `gold-600`  | `gold-200`    |
| enviada    | `blue-50`   | `blue-600`  | `blue-200`    |
| visualizada| `green-50`  | `green-600` | `green-200`   |
| admin      | `gold-50`   | `gold-600`  | `gold-200`    |
| vendedor   | `blue-50`   | `blue-600`  | `blue-200`    |

### 5.5 Modal

- Overlay: `bg-ink-900/50 backdrop-blur-sm` com animação `fade-in`
- Container: branco, `rounded-2xl`, `shadow-2xl`, animação `slide-up`
- Header: sticky, borda inferior `ink-100`, botão X no canto direito
- Max-width padrão: `max-w-lg` (configurável)

### 5.6 ConfirmDialog

Similar ao modal mas menor (`max-w-sm`), sem header sticky.
Botão confirmar em vermelho (`bg-red-500`).

### 5.7 EmptyState

Ícone em container `w-14 h-14 rounded-2xl bg-ink-100`, ícone `w-7 h-7 text-ink-300`.
Título em `font-display medium ink-700`, mensagem em `sm ink-400 max-w-sm`.

### 5.8 LoadingSpinner

Ícone `Loader2` animado (`animate-spin`), `w-6 h-6 text-gold-500`.
Texto de apoio abaixo em `sm ink-400`.

### 5.9 StatCard

Card com ícone em container `w-11 h-11 rounded-xl` com borda colorida.
Valor em `2xl font-display font-semibold`. Label em `sm ink-400`.

### 5.10 PageHeader

Título em `2xl font-display font-semibold ink-900 tracking-tight`.
Subtítulo em `sm ink-400`. Ação alinhada à direita (flex responsivo).

---

## 6. Layout e Navegação

### Sidebar (desktop)

- Largura fixa: `w-64` (256px)
- Cor de fundo: `ink-900` (preto)
- Posição: `sticky top-0 h-screen`
- Logo: quadrado `w-10 h-10 rounded-xl bg-gold-500` com ícone `Building2`
- Itens de navegação: `px-3 py-2.5 rounded-xl text-sm font-medium`
  - Ativo: `bg-gold-500 text-white shadow-sm` + seta `ChevronRight`
  - Inativo: `text-ink-300 hover:bg-ink-800 hover:text-white`
- Rodapé: nome do usuário + papel + botão sair (hover vermelho)

### Sidebar (mobile)

- Drawer lateral com overlay `bg-ink-900/40`
- Animação: `transition-transform duration-300` (desliza da esquerda)
- Header mobile: `bg-ink-900` sticky com ícone de menu

### Área de conteúdo

- Fundo: `ink-50` (cinza muito claro)
- Padding: `p-4` mobile, `p-8` desktop
- Largura máxima: `max-w-7xl` centrado

---

## 7. Animações e Micro-interações

| Animação        | Duração | Curva     | Uso                                              |
|-----------------|---------|-----------|--------------------------------------------------|
| `fade-in`       | 300ms   | ease-out  | Overlays de modal, mensagens de erro/sucesso     |
| `slide-up`      | 400ms   | ease-out  | Cards aparecendo, modais, tela de login           |
| `slide-right`   | 300ms   | ease-out  | Items de navegação                               |
| `transition-all`| 200ms   | padrão    | Hover de botões, inputs, cards                   |
| `spin`          | infinito| linear    | Loading states                                   |

**Micro-interações específicas:**

- Cards de marca/segmento na seleção de proposta: `hover:shadow-md hover:border-gold-300` + seta desliza à direita (`group-hover:translate-x-1`)
- Stepper da nova proposta: círculos `w-9 h-9` que mudam de cor (cinza → preto → dourado com check)
- Botão de mostrar senha: ícone alterna Eye/EyeOff com hover `ink-300 → ink-500`
- Tela de login: blobs dourado `blur-3xl` em `opacity-5` ao fundo para profundidade

---

## 8. Telas — Especificação por Página

### 8.1 Login

- **Fundo:** `ink-900` (preto) com blobs dourado `blur-3xl opacity-5`
- **Container:** `max-w-md` branco, `rounded-2xl shadow-2xl p-8`
- **Logo:** `w-16 h-16 rounded-2xl bg-gold-500` + sombra `gold-500/20`
- **Toggle login/cadastro:** pílula `bg-ink-50`, botões `rounded-lg`
- **Inputs:** com ícone à esquerda (Mail, Lock)
- **Erro:** caixa `red-50/red-200/red-600`
- **Sucesso:** caixa `green-50/green-200/green-600`

### 8.2 Dashboard Admin

- 4 StatCards em grid responsivo (1/2/4 colunas)
- Card de propostas recentes (2/3 largura) com lista de itens
- Card de acesso rápido (1/3 largura) com links iconizados
- Cores de stat: gold, blue, green, ink

### 8.3 Marcas (Admin)

- Barra de busca com ícone
- Grid de cards (1/2/3 colunas) com logo/cor, nome, CNPJ, status badge
- Botões editar/excluir no rodapé do card
- Modal de formulário `max-w-xl` com grid 2 colunas + color picker

### 8.4 Segmentos (Admin)

- Grid de cards (1/2/3 colunas)
- Ícone `Layers` em `gold-50/gold-600`
- Exibição de prazo com ícone `Clock`
- Modal simples com 2 campos numéricos

### 8.5 Tabela de Taxas (Admin)

- Barra de busca + tabela em card
- Tabela: header `bg-ink-50/50`, colunas alinhadas (esquerda/direita/centro)
- Taxas em `gold-600` font-medium
- Modal com selects de marca/segmento + 3 campos numéricos + datas

### 8.6 Vendedores (Admin)

- Barra de busca
- Grid de cards (1/2 colunas) com ícone `Users` azul
- Tags de marcas vinculadas (`gold-50/gold-700/gold-100`)
- Modal de vinculação com checkboxes visuais (quadrado `w-5 h-5` com check)

### 8.7 Propostas (Admin)

- Card de filtros com 3 campos (busca, marca, segmento)
- Tabela em card com 9 colunas
- Valores em `font-medium ink-900`, status como Badge

### 8.8 Dashboard Vendedor

- 3 StatCards (total, mês, volume)
- Lista de propostas em cards horizontais
- Cada card: inicial da marca em quadrado colorido, número + badge, cliente, dados, valor à direita

### 8.9 Nova Proposta (Vendedor)

- **Stepper:** 4 etapas com círculos conectados por linha `h-0.5`
- **Seleção de marca/segmento:** grid de cards clicáveis com hover e seta
- **Taxas travadas:** card `gold-50/50 border-gold-200` com ícone `Lock`, 3 campos em grid
- **Formulário:** inputs com ícones (User, DollarSign, Calendar), validação de prazo em vermelho
- **Revisão:** card com header colorido pela `cor_destaque` da marca, seções com labels uppercase `ink-400`, valores destacados em `gold-600`
- **Sucesso:** círculo `green-50` com `CheckCircle2` verde, 2 botões de ação

---

## 9. Responsividade

| Breakpoint    | Comportamento                                                                 |
|---------------|-------------------------------------------------------------------------------|
| Mobile (<640) | Sidebar vira drawer, grids 1 coluna, header mobile, tabelas com scroll horizontal |
| sm (640px)    | Grids 2 colunas, form inline                                                   |
| md (768px)    | Grids 2-3 colunas                                                             |
| lg (1024px)   | Sidebar fixa visível, grids 3-4 colunas, padding do conteúdo 32px             |

---

## 10. Ícones (Lucide React)

Ícones usados: `Building2`, `LayoutDashboard`, `Layers`, `Percent`, `Users`, `FileText`, `PlusCircle`, `Plus`, `Pencil`, `Trash2`, `Search`, `Lock`, `Mail`, `Eye`, `EyeOff`, `Loader2`, `ArrowRight`, `ArrowLeft`, `Check`, `CheckCircle2`, `AlertCircle`, `X`, `Menu`, `ChevronRight`, `Clock`, `TrendingUp`, `DollarSign`, `Calendar`, `User`, `FileCheck`, `LogOut`, `Filter`.

Tamanho padrão: `w-4 h-4` (16px) ou `w-5 h-5` (20px) em contextos maiores.
