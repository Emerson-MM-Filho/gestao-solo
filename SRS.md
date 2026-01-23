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
| **RF04** | **Classificação de Itens** | Cadastro de produtos como `Mercadoria` (vende e baixa estoque) ou `Insumo` (apenas controle de saldo). |
| **RF05** | **Baixa Automática** | Ao fechar uma comanda, o sistema deve subtrair as quantidades vendidas do estoque de itens tipo `Mercadoria`. |
| **RF06** | **Ajuste Manual de Estoque** | Interface para adicionar entradas (compras) e registrar saídas manuais (perdas ou uso de insumos). |
| **RF07** | **Monitoramento Visual** | O sistema DEVE exibir painel de estoque com indicadores de quantidade configuráveis por item: (1) Crítico: quantidade ≤ limite crítico (padrão: 2 unidades), (2) Baixo: quantidade ≤ limite baixo (padrão: 5 unidades), (3) Ok: quantidade > limite baixo. O sistema DEVE permitir configuração individual dos limites por item (Mercadoria ou Insumo). O sistema DEVE emitir alerta/notificação quando item atingir status Crítico ou Baixo. |
| **RF08** | **Geração de Relatórios** | O sistema DEVE gerar relatórios financeiros com períodos configuráveis (presets: Hoje, Esta Semana, Este Mês, Últimos 30 Dias, ou período customizado). Relatórios incluem: (1) Resumo de vendas com total de receita, número de comandas, breakdown por forma de pagamento, e itens vendidos, (2) Itens mais vendidos, (3) Relatório de valor de estoque, (4) Itens com estoque baixo. Todos os relatórios DEVEM ser exportáveis em PDF, CSV e função de impressão. |
| **RF09** | **Alertas de Reposição** | O sistema DEVE exibir alertas quando itens atingirem status Crítico ou Baixo através de: (1) Badge de notificação in-app, (2) Alerta toast/pop-up dismissível, (3) Indicador visual na tela de estoque. O sistema DEVE fornecer visualização de resumo de todos os itens necessitando reposição. |
| **RF10** | **Busca e Filtro de Itens** | O sistema DEVE permitir busca de itens por nome com suporte a busca parcial/fuzzy. Itens DEVEM ser organizados por categorias (ex: Bebidas, Comidas, Sobremesas). O sistema DEVE permitir ao usuário escolher ordenação: (1) Alfabética, (2) Favoritos, (3) Mais usados. O sistema DEVE suportar visualização em grade e lista. Interface otimizada para catálogo de até 100 itens. |
| **RF11** | **Gestão de Preços** | O sistema DEVE permitir alteração de preços de itens após criação. Comandas abertas que já possuem o item DEVEM manter o preço original no momento da adição. O sistema DEVE manter histórico de alterações de preço. O sistema DEVE suportar preços promocionais/com desconto configuráveis por item. |
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
| **RNF07** | **Integridade de Dados e Backup** | O sistema DEVE permitir exportação completa de todos os dados (comandas, itens, estoque, histórico) em formato estruturado para backup manual. O sistema DEVE permitir importação de arquivo de backup para restauração de dados. Todos os dados DEVEM ser mantidos indefinidamente até que o usuário escolha deletá-los explicitamente. O sistema NÃO implementa backup automático - usuário é responsável por backups manuais periódicos. |
