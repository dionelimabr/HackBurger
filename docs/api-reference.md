# Referência da API

A API é servida em `http://localhost:3000/api` no ambiente de desenvolvimento. Todas as respostas usam JSON com o envelope padrão:

```json
{ "status": "success", "message": "...", "data": { } }
```

Em caso de erro:

```json
{ "status": "error", "message": "descrição legível" }
```

Endpoints autenticados exigem o header:

```
Authorization: Bearer <jwt>
```

Também há um Swagger interativo em `http://localhost:3000/api/docs` com payloads e respostas reais.

## Autenticação

### POST /api/auth/register

Cria um novo usuário. Público.

Body:

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "phone": "+55 11 99999-0000"
}
```

Resposta `201`:

```json
{ "status": "success", "data": { "id": 3, "email": "joao@exemplo.com" } }
```

### POST /api/auth/login

Autentica e devolve o token.

Body: `{ "email": "...", "password": "..." }`

Resposta:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "name": "Admin", "role": "admin" }
  }
}
```

### GET /api/auth/me

Retorna o usuário do token atual. Autenticado.

### POST /api/auth/change-password

Troca a senha do usuário logado.

Body: `{ "oldPassword": "...", "newPassword": "..." }`

## Produtos

### GET /api/products

Lista pública de produtos. Query params opcionais:

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `category` | string | slug da categoria |
| `featured` | boolean | apenas destaques |
| `search` | string | busca por nome ou descrição |
| `page` | number | página (default 1) |
| `limit` | number | itens por página (default 20) |

### GET /api/products/featured

Retorna apenas os produtos marcados como destaque.

### GET /api/products/categories

Lista todas as categorias ativas.

### GET /api/products/:id

Busca por ID numérico.

### GET /api/products/slug/:slug

Busca por slug (útil para URLs amigáveis).

## Carrinho

Todos os endpoints exigem autenticação.

### GET /api/cart

Retorna o carrinho do usuário logado com os itens e subtotal.

### POST /api/cart/items

Adiciona um produto ao carrinho.

Body: `{ "productId": 1, "quantity": 2 }`

### PUT /api/cart/items/:itemId

Atualiza a quantidade de um item. `quantity: 0` remove o item.

### DELETE /api/cart/items/:itemId

Remove um item pelo id.

### DELETE /api/cart

Esvazia o carrinho.

## Pedidos

### GET /api/orders

Lista os pedidos do usuário logado, mais recentes primeiro.

### GET /api/orders/:id

Detalhe de um pedido, com itens e status.

### POST /api/orders/checkout

Converte o carrinho atual em um pedido. Limite de taxa aplicado.

Body:

```json
{
  "address_street": "Rua das Flores",
  "address_number": "123",
  "address_city": "São Paulo",
  "address_state": "SP",
  "address_zip": "01000-000",
  "notes": "Sem cebola"
}
```

## Pagamento

### POST /api/payments

Processa o pagamento de um pedido.

Body:

```json
{ "orderId": 42, "method": "pix" }
```

Métodos aceitos: `credit_card`, `debit_card`, `pix`, `cash`.

### GET /api/payments/order/:orderId

Retorna o status e detalhes de pagamento do pedido.

## Usuário

### GET /api/users/profile

Perfil do usuário logado.

### PUT /api/users/profile

Atualiza nome, telefone e avatar.

### POST /api/users/avatar

Upload de avatar. Aceita `multipart/form-data` com campo `avatar`.

## Administração

Todas as rotas abaixo exigem usuário com `role = admin`.

### GET /api/admin/dashboard

Estatísticas agregadas: total de pedidos, receita, produtos mais vendidos.

### GET /api/admin/users

Lista todos os usuários.

### PATCH /api/admin/users/:id/activate

### PATCH /api/admin/users/:id/deactivate

Ativa ou desativa um usuário.

### POST /api/admin/products

### PUT /api/admin/products/:id

### DELETE /api/admin/products/:id

CRUD de produtos.

### GET /api/admin/orders

Lista todos os pedidos da plataforma.

### PATCH /api/admin/orders/:id/status

Atualiza o status de um pedido.

Valores aceitos: `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`.

## Códigos HTTP

| Código | Uso |
|---|---|
| 200 | Sucesso em `GET`, `PUT`, `DELETE` |
| 201 | Recurso criado em `POST` |
| 400 | Body inválido (validação Joi) |
| 401 | Token ausente, inválido ou expirado |
| 403 | Autenticado, mas sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: e-mail já cadastrado) |
| 429 | Rate limit excedido |
| 500 | Erro inesperado no servidor |
