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

### 2.2 Limites do Sistema (Scope Out)

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
| **RF07** | **Monitoramento Visual** | Painel de estoque com indicadores de quantidade: Ok, Baixo, Crítico. |

### 3.2 Requisitos Não Funcionais (RNF)

| ID | Requisito | Especificação Técnica |
| --- | --- | --- |
| **RNF01** | **Usabilidade Mobile** | Interface otimizada para operação com dispositivos móveis. |
| **RNF02** | **Portabilidade** | Web App Responsivo (PWA) compatível com Safari (iOS) e Chrome (Android). |
| **RNF03** | **Persistência** | Garantia de manutenção dos dados de comandas abertas em caso de recarregamento da página. |
| **RNF04** | **Desempenho** | Resposta de interface para adição de itens e buscas em até 200ms. |
