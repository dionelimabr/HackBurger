# Testes

A estratégia de testes cobre três níveis: unitários no backend (Jest), unitários no frontend (Jasmine + Karma) e end-to-end pela aplicação inteira (Cypress).

## Estrutura

```
tests/
  jest.config.ts            configuração Jest compartilhada
  backend/                  testes unitários de services e models
  frontend/                 testes de components e services Angular
  e2e/                      specs do Cypress
  fixtures/                 dados fixos compartilhados
```

## Rodando localmente

### Unitários (todos)

```bash
npm run test:unit
```

Internamente roda `jest --config tests/jest.config.ts`, que carrega os arquivos `*.spec.ts` em `tests/backend/` e `tests/frontend/`.

### Apenas backend

```bash
npm --prefix backend test
```

### Apenas frontend

```bash
npm --prefix frontend test -- --watch=false --browsers=ChromeHeadless
```

### End-to-end (Cypress)

Em uma aba, suba o stack local:

```bash
npm run start
```

Em outra, abra o Cypress:

```bash
npm run test:e2e
```

Para rodar em modo headless na CI:

```bash
cd tests && npx cypress run
```

## Convenções

- Arquivo de teste nomeado `<alvo>.spec.ts`, no mesmo diretório lógico do alvo.
- Um `describe` por função/método pública.
- Um `it` por caso. Evite testes que validam múltiplos comportamentos ao mesmo tempo.
- Use `beforeEach` para setup comum; não reaproveite estado entre testes.

Exemplo mínimo de um service:

```ts
import { OrderService } from '../../backend/src/services/order.service';

describe('OrderService.checkout', () => {
  it('cria pedido a partir do carrinho atual', async () => {
    const order = await OrderService.checkout(userId, address);
    expect(order.total).toBeGreaterThan(0);
  });

  it('retorna erro quando carrinho está vazio', async () => {
    await expect(OrderService.checkout(emptyUser, address)).rejects.toThrow();
  });
});
```

## Cobertura

Geração de relatório:

```bash
npm --prefix backend test -- --coverage
```

Saída em `backend/coverage/lcov-report/index.html`. Abra no navegador para inspecionar arquivo por arquivo.

Meta atual: **80% de statements** nos services; **60%** no projeto todo. PRs que reduzam a cobertura são rejeitados.

## Cypress

Specs ficam em `tests/e2e/specs/`. Fluxos cobertos:

- Login e logout.
- Adicionar produto ao carrinho e remover.
- Checkout completo, do carrinho ao pagamento.
- Área administrativa: criar produto e atualizar status de pedido.

Seletores usam o atributo `data-cy` para evitar acoplamento ao CSS:

```html
<button data-cy="checkout-submit">Finalizar</button>
```

```ts
cy.get('[data-cy=checkout-submit]').click();
```

## Dados de teste

`tests/fixtures/` contém JSON com usuários, produtos e pedidos. O Cypress carrega esses fixtures via `cy.fixture()` e injeta no banco através da API (rota `/api/admin/*`). Nenhum teste depende do banco de desenvolvimento.

## CI

A pipeline do GitHub Actions roda os três níveis em sequência:

1. Jest no backend.
2. Karma headless no frontend.
3. Cypress em modo headless.

Qualquer falha bloqueia o merge no `main`.
