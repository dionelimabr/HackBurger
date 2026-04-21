# Banco de Dados

O HackBurger usa SQLite como banco embarcado via driver `better-sqlite3`. O arquivo físico fica em `database/hackburger.db` e é criado automaticamente na primeira execução.

## Migrations

Migrations são arquivos SQL versionados em `database/migrations/` e aplicados em ordem alfabética na inicialização do backend:

```
database/migrations/
  001_create_users.sql
  002_create_categories.sql
  003_create_products.sql
  004_create_carts.sql
  005_create_orders.sql
  006_create_payments.sql
```

O runner de migrations mantém uma tabela `_migrations` com o nome do arquivo aplicado. Migrations nunca são reexecutadas.

Para adicionar uma nova migration, crie um arquivo com o prefixo numérico seguinte:

```bash
touch database/migrations/007_add_reviews.sql
```

Edite o SQL e reinicie o backend. O log confirma a aplicação:

```
Migrations aplicadas: 7 arquivo(s).
```

## Schema

### users

Armazena clientes e administradores.

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK, autoincrement |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `phone` | TEXT | |
| `role` | TEXT | default `customer`, CHECK (`customer`, `admin`) |
| `avatar_url` | TEXT | |
| `is_active` | INTEGER | default 1 |
| `created_at` | DATETIME | default CURRENT_TIMESTAMP |

### categories

Categorias de produto (ex: Clássicos, Especiais, Combos).

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK |
| `name` | TEXT | NOT NULL |
| `slug` | TEXT | NOT NULL, UNIQUE |
| `is_active` | INTEGER | default 1 |

### products

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK |
| `category_id` | INTEGER | FK → categories |
| `name` | TEXT | NOT NULL |
| `slug` | TEXT | NOT NULL, UNIQUE |
| `description` | TEXT | |
| `price` | REAL | NOT NULL |
| `image_url` | TEXT | |
| `rating` | REAL | default 0 |
| `rating_count` | INTEGER | default 0 |
| `ingredients` | TEXT | JSON serializado |
| `is_available` | INTEGER | default 1 |
| `is_featured` | INTEGER | default 0 |

### carts

Carrinho persistente. Cada usuário tem no máximo um carrinho ativo.

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → users, UNIQUE |
| `created_at` | DATETIME | |

### cart_items

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK |
| `cart_id` | INTEGER | FK → carts |
| `product_id` | INTEGER | FK → products |
| `quantity` | INTEGER | NOT NULL, CHECK (> 0) |

### orders

| Coluna | Tipo | Restrição |
|---|---|---|
| `id` | INTEGER | PK |
| `user_id` | INTEGER | FK → users |
| `total` | REAL | NOT NULL |
| `status` | TEXT | default `pending` |
| `address_street` | TEXT | |
| `address_number` | TEXT | |
| `address_city` | TEXT | |
| `address_state` | TEXT | |
| `address_zip` | TEXT | |
| `notes` | TEXT | |
| `created_at` | DATETIME | |

### order_items

Snapshot dos itens no momento do checkout. Preço é copiado para não ser afetado por alterações futuras no catálogo.

| Coluna | Tipo |
|---|---|
| `id` | INTEGER PK |
| `order_id` | INTEGER FK |
| `product_id` | INTEGER FK |
| `product_name` | TEXT |
| `unit_price` | REAL |
| `quantity` | INTEGER |

### payments

| Coluna | Tipo |
|---|---|
| `id` | INTEGER PK |
| `order_id` | INTEGER FK, UNIQUE |
| `method` | TEXT (`credit_card`, `debit_card`, `pix`, `cash`) |
| `status` | TEXT (`pending`, `approved`, `rejected`) |
| `amount` | REAL |
| `paid_at` | DATETIME |

## Seeds

O script `npm run seed` popula dados de exemplo. Ele é idempotente: usa `INSERT ... ON CONFLICT DO UPDATE` para atualizar produtos existentes sem duplicar.

Arquivos em `database/seeds/`:

- `categories.seed.ts`: as seis categorias usadas na home e catálogo.
- `products.seed.ts`: oito produtos com imagens e preços reais.
- `users.seed.ts`: um admin e um cliente de teste.

## Backup

Como SQLite é um arquivo, backup é trivial:

```bash
cp database/hackburger.db database/hackburger.db.$(date +%Y%m%d).bak
```

Para restaurar, pare o backend, substitua o arquivo e reinicie.

Em produção, recomendamos backup automático para um bucket S3 usando `sqlite3 .backup`:

```bash
sqlite3 database/hackburger.db ".backup /tmp/hackburger.bak"
aws s3 cp /tmp/hackburger.bak s3://backups/hackburger/$(date +%F).bak
```

## Migração para PostgreSQL

Caso a carga passe do que o SQLite suporta confortavelmente, a migração para PostgreSQL está planejada assim:

1. Trocar `better-sqlite3` por `pg` nas camadas `models/`.
2. Adaptar as migrations (tipos `INTEGER AUTOINCREMENT` → `SERIAL`, `DATETIME` → `TIMESTAMP`).
3. Usar uma pool de conexões no lugar do singleton síncrono.
4. Ajustar o `docker-compose.yml` para subir um contêiner Postgres.

Nenhuma mudança é necessária fora da camada de persistência.
