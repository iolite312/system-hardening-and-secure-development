# Comic Library

A private comic book library with role-based access control, built with Nuxt 4, Nuxt UI, Drizzle ORM, and PostgreSQL.

## Features

- JWT authentication (access + refresh tokens, both in httpOnly cookies)
- Refresh-token rotation with reuse detection
- Passwords hashed with Argon2id (OWASP-recommended params)
- Role-based access control enforced server-side on every route
- Comic management: add, edit, delete, and bulk import via CSV
- Paginated comic browser

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) (for the PostgreSQL database)

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

For production, generate strong JWT secrets:

```bash
openssl rand -base64 48   # run twice — one value for JWT_ACCESS_SECRET, one for JWT_REFRESH_SECRET
```

### 3. Start the database

```bash
pnpm db:up
```

Starts a PostgreSQL 17 container via Docker Compose. Data is persisted in a named Docker volume.

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Seed the initial super admin

```bash
pnpm db:seed
```

Creates the super admin account defined by `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_PASSWORD` in `.env`. Safe to re-run — skips if the account already exists.

### 6. Start the development server

```bash
pnpm dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

---

## Default credentials

These match the defaults in `.env.example`. **Change them before deploying.**

| Role        | Email             | Password               |
| ----------- | ----------------- | ---------------------- |
| Super Admin | admin@example.com | ChangeMe!SuperAdmin123 |

Additional accounts can be created through the **Users** admin panel once logged in.

---

## Terraform commands

terraform plan

```bash
terraform plan -var-file="envs/dev.tfvars"
```

terraform apply

```bash
terraform apply -var-file="envs/dev.tfvars"
```

---

## Roles & permissions

| Permission      | Super Admin | Admin | Friend |
| --------------- | :---------: | :---: | :----: |
| View comics     |             |   ✓   |   ✓    |
| Add comics      |             |   ✓   |        |
| Edit comics     |             |   ✓   |        |
| Delete comics   |             |   ✓   |        |
| Bulk import CSV |             |   ✓   |        |
| List users      |      ✓      |   ✓   |        |
| Create admin    |      ✓      |   ✓   |        |
| Create friend   |             |   ✓   |        |
| Delete users    |      ✓      |   ✓   |        |

> Super admin manages users only — comic management is the admin's responsibility.  
> Unauthenticated visitors are redirected to the login page and cannot see anything.

---

## CSV bulk import

Admins can import comics in bulk via **Manage → Import CSV**. The file must have a header row with these columns (extra columns are ignored):

```csv
title,serie,number
Watchmen #1,Watchmen,1
Watchmen #2,Watchmen,2
```

- Max file size: 50 MB
- Rows are inserted in batches of 500
- Per-row validation errors are reported without aborting the rest of the import

---

## Available scripts

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Start development server                      |
| `pnpm build`       | Build for production                          |
| `pnpm preview`     | Preview production build locally              |
| `pnpm db:up`       | Start PostgreSQL container                    |
| `pnpm db:down`     | Stop PostgreSQL container                     |
| `pnpm db:migrate`  | Apply pending migrations                      |
| `pnpm db:generate` | Generate a new migration from schema changes  |
| `pnpm db:push`     | Push schema directly (dev only, no migration) |
| `pnpm db:studio`   | Open Drizzle Studio (DB browser)              |
| `pnpm db:seed`     | Create the initial super admin                |

---

## Project structure

```
├── app/                         # Nuxt frontend
│   ├── composables/useAuth.ts   # Auth state, login, logout, can()
│   ├── middleware/
│   │   ├── auth.global.ts       # Redirects unauthenticated visitors to /login
│   │   └── admin.ts             # Guards /admin/* routes
│   ├── pages/
│   │   ├── login.vue
│   │   ├── comics/              # Browse + detail
│   │   └── admin/               # User management, comic management + CSV import
│   └── utils/rbac.ts            # Client-side permission helpers (UI gating only)
├── server/
│   ├── api/
│   │   ├── auth/                # login, logout, refresh, me
│   │   ├── comics/              # CRUD + CSV import
│   │   └── users/               # list, create, delete
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema (users, refresh_tokens, comics)
│   │   ├── migrations/          # Generated SQL migrations
│   │   └── index.ts             # pg Pool + Drizzle client singleton
│   ├── scripts/seed.ts          # Initial super admin seed script
│   └── utils/
│       ├── auth.ts              # requireUser, requirePermission, cookie helpers
│       ├── jwt.ts               # Access token sign/verify, refresh token generation
│       ├── password.ts          # Argon2id hash/verify
│       └── rbac.ts              # Server-side permission matrix
├── shared/
│   └── types/
│       ├── auth.ts              # AuthUser type
│       └── rbac.ts              # UserRole, Permission types, USER_ROLES constant
├── docker-compose.yml
├── drizzle.config.ts
└── .env.example
```
