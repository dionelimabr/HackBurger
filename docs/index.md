# Visão Geral

HackBurger é uma plataforma completa de pedidos para uma hamburgueria artesanal. O projeto reúne catálogo de produtos, carrinho, checkout, acompanhamento de pedidos, área administrativa e integração com métricas de observabilidade.

A documentação aqui descreve como rodar o sistema localmente, como ele está organizado internamente, quais endpoints a API expõe e como colaborar com o código.

## Capacidades principais

- Catálogo público de produtos com categorias e busca.
- Autenticação baseada em JWT com e-mail e senha.
- Carrinho persistente por usuário com atualização e remoção de itens.
- Checkout com registro de endereço de entrega e cálculo automático do total.
- Pagamento simulado com múltiplos métodos (pix, cartão, dinheiro).
- Painel administrativo para CRUD de produtos, gestão de pedidos e usuários.
- Métricas Prometheus expostas em `/metrics` e visualizáveis no Grafana.

## Organização do repositório

A plataforma é um monorepo com três diretórios de código e alguns de suporte:

```
HackBurger/
  backend/        API REST em Node.js + Express + TypeScript
  frontend/       SPA em Angular 17
  database/       migrations e seeds (SQLite)
  docs/           documentação técnica em Markdown
  infra/          manifestos Kubernetes e Vagrantfile
  monitoring/     configuração Prometheus + Grafana
  tests/          testes end-to-end (Cypress) e unitários (Jest)
```

## Por onde começar

Escolha pela sua função:

- **Quero rodar o projeto localmente**: veja *Guia de Setup*.
- **Quero entender a arquitetura**: veja *Arquitetura*.
- **Vou consumir a API**: veja *Referência da API*.
- **Vou mexer no schema**: veja *Banco de Dados*.
- **Vou subir em produção**: veja *Deployment*.
- **Vou contribuir com PR**: veja *Como Contribuir*.

## Convenções desta documentação

- Todos os comandos assumem que você está na raiz do repositório, a menos que indicado.
- Trechos em `código monoespaçado` representam comandos, caminhos ou identificadores literais.
- Respostas HTTP mostram apenas campos relevantes; erros seguem o formato `{ "status": "error", "message": "..." }`.
