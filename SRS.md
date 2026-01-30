# Especificação de Requisitos de Software (SRS): GESTÃO SOLO

## 1. Introdução

### 1.1 Propósito

Este documento define os requisitos para o sistema **Gestão Solo**, focando na automatização do fluxo de vendas e no controle rigoroso de estoque para micro-operações.

### 1.2 Missão do Produto

Oferecer apoio informatizado ao controle de vendas e de estoque de operações solo, eliminando processos manuais e aumentando a precisão das decisões de compra.

### 1.3 Definições, Acrônimos e Abreviações

* PWA: Progressive Web App (aplicativo que roda no navegador mas pode ser instalado).
* PDV: Ponto de Venda (interface para transações comerciais).
* Insumo: Itens de apoio ao negócio (guardanapos, leite, embalagens) que não são vendidos diretamente.
* Mercadoria: Produtos finalizados destinados à venda (café, bolo, drink).

---

## 2. Descrição Geral

### 2.1 Funções do Produto

* Registro de comandas nominais.
* PDV simplificado para venda de mercadorias.
* Gestão híbrida de estoque (baixa automática e manual).
* Alertas de reposição e relatório financeiro básico.

### 2.2 Características do Usuário

| Característica | Descrição |
| --- | --- |
| **Perfil** | Empreendedor solo ou micro-operação com 1 ajudante |
| **Faixa Etária** | 30-50 anos |
| **Experiência Técnica** | Intermediária - uso diário de aplicativos (WhatsApp, Instagram, etc.) |
| **Tipo de Negócio** | Pequeno café, restaurante, bar |
| **Contexto de Uso** | Ambiente interno, movimentado durante horários de pico |
| **Volume de Operação** | 20-50 comandas por dia |
| **Frequência de Uso** | Diária, múltiplas vezes durante expediente |
| **Dispositivo Principal** | Smartphone pessoal (iOS ou Android) |

### 2.3 Limites do Sistema (Scope Out)

* **Pagamentos:** Apenas registro informativo (não processa transações).
* **Fiscal:** Sem emissão de notas fiscais.
* **CRM:** Sem cadastro fixo de clientes.
* **Tolerância a Falhas:** O sistema não realiza correções automáticas de erros de entrada do usuário.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionais (RF)

| ID | Requisito | Descrição Detalhada |
| --- | --- | --- |
| **RF01** | **Gestão de Comandas** | Abrir, consultar e editar comandas vinculadas ao **Nome do Cliente**. |
| **RF02** | **Lançamento de Itens** | Adição de mercadorias, que possuam estoque, ao pedido com suporte a campo de observação livre. |
| **RF03** | **Fechamento e Pagamento** | Finalizar a venda registrando o valor total e a forma de pagamento (Pix, Crédito, Débito, Dinheiro). |
| **RF04** | **Classificação de Itens** [IMPLEMENTED] | Cadastro de produtos como `Merchandise` (vende e baixa estoque) ou `Supply` (apenas controle de saldo). Sistema implementado na tabela `api.items` com enum type validado via CHECK constraint. |
| **RF05** | **Baixa Automática de Estoque** | O sistema DEVE deduzir automaticamente o estoque quando um item tipo `Merchandise` é ADICIONADO a uma comanda aberta. A dedução ocorre imediatamente no momento da adição, não no fechamento da comanda. O sistema DEVE bloquear a adição se não houver estoque suficiente. O sistema DEVE registrar a movimentação em `api.stock_movements` com tipo `sale`. Se o item for removido da comanda antes do fechamento, o usuário pode optar por devolver ou não o estoque (RF12). |
| **RF06** | **Ajuste Manual de Estoque** [IMPLEMENTED] | Interface para adicionar entradas (compras) e registrar saídas manuais (perdas ou uso de insumos). Implementado via `StockAdjustmentDialog` com registro em `api.stock_movements` (types: entry, manual_exit). |
| **RF07** | **Monitoramento Visual** [IMPLEMENTED] | O sistema DEVE exibir painel de estoque com indicadores de quantidade configuráveis por item: (1) Crítico: quantidade ≤ limite crítico (padrão: 2 unidades), (2) Baixo: quantidade ≤ limite baixo (padrão: 5 unidades), (3) Ok: quantidade > limite baixo. O sistema DEVE permitir configuração individual dos limites por item (Merchandise ou Supply). O sistema DEVE emitir alerta/notificação quando item atingir status Crítico ou Baixo. Implementado via `StockAlertsCard`, `StockBadge`, e view `api.v_low_stock_items` com security invoker. |
| **RF08** | **Geração de Relatórios** | O sistema DEVE gerar relatórios financeiros com períodos configuráveis (presets: Hoje, Esta Semana, Este Mês, Últimos 30 Dias, ou período customizado). Relatórios incluem: (1) Resumo de vendas com total de receita, número de comandas, breakdown por forma de pagamento, e itens vendidos, (2) Itens mais vendidos, (3) Relatório de valor de estoque, (4) Itens com estoque baixo. Todos os relatórios DEVEM ser exportáveis em PDF, CSV e função de impressão. |
| **RF09** | **Alertas de Reposição** | O sistema DEVE exibir alertas quando itens atingirem status Crítico ou Baixo através de: (1) Badge de notificação in-app, (2) Alerta toast/pop-up dismissível, (3) Indicador visual na tela de estoque. O sistema DEVE fornecer visualização de resumo de todos os itens necessitando reposição. |
| **RF10** | **Busca e Filtro de Itens** [IMPLEMENTED] | O sistema DEVE permitir busca de itens por nome com suporte a busca parcial/fuzzy. Itens DEVEM ser organizados por categorias (ex: Bebidas, Comidas, Sobremesas). O sistema DEVE permitir ao usuário escolher ordenação: (1) Alfabética, (2) Favoritos, (3) Mais usados. O sistema DEVE suportar visualização em grade e lista. Interface otimizada para catálogo de até 100 itens. Implementado em `src/routes/_authenticated/stock.tsx` com busca client-side, filtro por categoria via `api.categories`, ordenação (alphabetical, favorites, most-used), e toggle grid/list view via `ToggleGroup`. Índice GIN em `api.items.name` para busca textual. |
| **RF11** | **Gestão de Preços** | O sistema DEVE permitir alteração de preços de itens após criação. Comandas abertas que já possuem o item DEVEM manter o preço original no momento da adição. O sistema DEVE manter histórico de alterações de preço. |
| **RF12** | **Cancelamento de Comandas** | O sistema DEVE permitir cancelamento/anulação de comandas abertas e fechadas (estorno). Ao cancelar comanda, o usuário DEVE escolher: (1) Devolver itens ao estoque (itens não foram consumidos), ou (2) Não impactar estoque (itens já foram consumidos). Comandas canceladas DEVEM ser mantidas no histórico com status "Cancelada" para auditoria. |
| **RF13** | **Pagamentos Múltiplos** | O sistema DEVE permitir fechamento de comanda com múltiplos métodos de pagamento (ex: R$50 Pix + R$30 Dinheiro). O sistema NÃO DEVE permitir pagamento parcial com comanda permanecendo aberta - pagamento deve quitar o valor total. O sistema DEVE registrar histórico de todos os pagamentos realizados por comanda. |

### 3.2 Requisitos Não Funcionais (RNF)

| ID | Requisito | Especificação Técnica |
| --- | --- | --- |
| **RNF01** | **Usabilidade Mobile** | O sistema DEVE: (1) Suportar telas com largura mínima de 320px (iPhone SE), (2) Utilizar alvos de toque mínimos de 48x48 pixels, (3) Utilizar tamanho de fonte mínimo de 16px para legibilidade, (4) Permitir abrir nova comanda em máximo 2 toques, (5) Permitir adicionar item à comanda em máximo 3 toques, (6) Permitir fechar/efetuar pagamento em máximo 2 toques. Interface otimizada para operação com uma mão durante horários de pico. |
| **RNF02** | **Portabilidade** | O sistema DEVE funcionar como PWA responsivo compatível com: (1) Safari no iOS 14 ou superior, (2) Chrome no Android 9 ou superior, (3) Navegadores desktop (Chrome, Safari, Firefox, Edge). A instalação como PWA é opcional - o sistema DEVE funcionar diretamente no navegador sem instalação obrigatória. |
| **RNF03** | **Persistência e Offline** | O sistema DEVE: (1) Manter comandas abertas persistidas indefinidamente até fechamento, (2) Manter comandas fechadas armazenadas indefinidamente para registro histórico, (3) Funcionar completamente offline (sem conexão à internet), (4) Salvar dados localmente quando offline e sincronizar automaticamente quando conexão for restabelecida, (5) Sobreviver recarregamentos de página sem perda de dados. Dados persistidos usando localStorage/IndexedDB. |
| **RNF04** | **Desempenho** | O sistema DEVE garantir os seguintes tempos de resposta: (1) Adição de itens e buscas: ≤ 200ms, (2) Carregamento inicial da lista de itens: ≤ 500ms, (3) Fechamento de comanda com atualização de estoque: ≤ 300ms, (4) Geração de relatórios: ≤ 1 segundo. Tempos garantidos para operação com até 30 itens cadastrados e até 100 comandas abertas simultaneamente. O sistema NÃO possui limite máximo de itens ou comandas, mas os tempos de resposta são garantidos apenas dentro desses parâmetros. |
| **RNF05** | **Segurança e Autenticação** | O sistema DEVE implementar autenticação via login/senha para usuário único (proprietário). Sessão DEVE expirar após 24 horas, exigindo novo login. |
| **RNF06** | **Escalabilidade** | O sistema DEVE manter performance aceitável com catálogos de até 100 itens e até 100 comandas abertas simultaneamente. Para volumes superiores, degradação gradual de performance é aceitável, mas funcionalidade DEVE permanecer íntegra. |
| **RNF07** | **Integridade de Dados e Backup** [PARTIALLY IMPLEMENTED] | O sistema DEVE permitir exportação completa de todos os dados (comandas, itens, estoque, histórico) em formato estruturado para backup manual. O sistema DEVE permitir importação de arquivo de backup para restauração de dados. Todos os dados DEVEM ser mantidos indefinidamente até que o usuário escolha deletá-los explicitamente. O sistema NÃO implementa backup automático - usuário é responsável por backups manuais periódicos. STATUS: Database schema e RLS policies implementados com soft-delete (is_active flag). Export/import functionality ainda não implementada. |
| **RNF08** | **Configurações do Sistema** [IMPLEMENTED] | O sistema DEVE permitir ao usuário configurar: (1) Tema da interface (light/dark mode), (2) Idioma da interface (português/inglês), (3) Informações do perfil do usuário (display_name, phone). Implementado em `src/routes/_authenticated/settings.tsx` e `src/components/account-dialog.tsx`. |

---

## 4. Status de Implementação

### 4.1 Resumo por Requisito (Atualizado: Janeiro 2026)

| Status | Requisitos |
| -------- | ------------ |
| ✅ **Implementado** | RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08, RF10, RF12, RF13, RNF08 |
| 🔄 **Parcialmente Implementado** | RNF07 (schema pronto, export/import pendente) |
| 🔲 **Pendente** | RF09, RF11, RNF01-RNF06 |

### 4.2 Versão 1.1 - Sistema de Gestão de Estoque (Janeiro 2026)

**Funcionalidades Entregues:**

1. **Cadastro de Itens (RF04):**
   * Classificação como Mercadoria ou Insumo
   * Categorização personalizável
   * Preços configuráveis
   * Favoritos e contagem de uso

2. **Controle de Estoque (RF06, RF07):**
   * Ajustes manuais (entrada e saída)
   * Limites configuráveis (crítico e baixo)
   * Indicadores visuais de status
   * Histórico de movimentações (auditoria)

3. **Busca e Organização (RF10):**
   * Busca por nome
   * Filtro por categoria
   * Ordenação (alfabética, favoritos, mais usados)
   * Visualização em grade ou lista

4. **Alertas de Estoque (RF07):**
   * Cartão de alertas com contadores
   * Status por item (crítico/baixo/ok)
   * Identificação visual com cores

5. **Configurações de Sistema (RNF08):**
   * Tema claro/escuro
   * Idioma português/inglês
   * Edição de perfil (nome, telefone)

**Arquitetura Técnica:**

* Schema PostgreSQL `api` com RLS
* Supabase como Backend-as-a-Service
* React + TypeScript + TanStack Router
* shadcn/ui components (Radix Nova)
* i18n bilíngue (pt/en)
* CI/CD com GitHub Actions

### 4.3 Versão 1.2 - Sistema de Gestão de Comandas (Janeiro 2026)

**Funcionalidades Entregues:**

1. **Gestão de Comandas (RF01):**
   * Abertura de comandas nominais
   * Display ID único de 6 caracteres (ex: ABC123)
   * Listagem com filtros por status (abertas/fechadas/canceladas)
   * Busca por nome de cliente
   * Edição de nome do cliente (apenas comandas abertas)

2. **Lançamento de Itens (RF02, RF05):**
   * Adição de itens às comandas abertas
   * Baixa automática de estoque no momento da adição (não no fechamento)
   * Validação de estoque disponível antes de adicionar
   * Suporte a customizações por item (observações)
   * Remoção de itens de comandas abertas
   * Registro de movimentações em histórico de estoque

3. **Fechamento e Pagamento (RF03, RF13):**
   * Fechamento de comandas com validação de pagamento total
   * Múltiplos métodos de pagamento por comanda (Pix, Crédito, Débito, Dinheiro, Voucher, Online)
   * Registro imutável de pagamentos
   * Atualização de contadores de uso dos itens

4. **Cancelamento de Comandas (RF12):**
   * Cancelamento de comandas abertas ou fechadas (estorno)
   * Opção de devolução de estoque ao cancelar
   * Registro de motivo do cancelamento
   * Manutenção de histórico de comandas canceladas para auditoria

**Banco de Dados:**

* Tabela `api.orders` com status (open/closed/cancelled)
* Tabela `api.order_items` com suporte a customizações JSONB
* Tabela `api.payments` com registro de múltiplos pagamentos
* Funções PostgreSQL: `add_item_to_order`, `remove_item_from_order`, `close_order`, `cancel_order`
* Políticas RLS para isolamento de dados por usuário
* Índices otimizados para busca e ordenação

**Interface:**

* Página de comandas com visualização por status
* Dialog de criação de comanda
* Dialog de detalhes com gestão completa de itens
* Dialog de fechamento com múltiplos pagamentos
* Dialog de cancelamento com opção de devolução de estoque
* Indicadores de idade da comanda (tempo desde criação)
* Badges de status com cores semânticas

### 4.4 Próximas Entregas Planejadas

**Versão 1.3 - Relatórios e Análises:**

* Relatórios de vendas com períodos configuráveis (RF08)
* Exportação de dados (PDF, CSV) (RNF07)
* Itens mais vendidos
* Valor de estoque atual
* Breakdown por forma de pagamento

**Versão 1.4 - Funcionalidades Avançadas:**

* Alertas push de reposição (RF09)
* Histórico de alterações de preços (RF11)
* PWA offline-first completo (RNF03)
* Otimizações de performance mobile (RNF01, RNF04)
