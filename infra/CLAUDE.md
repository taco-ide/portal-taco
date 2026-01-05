# infra/ Directory Guide

This directory contains infrastructure configuration for the project.

## Directory Structure

```
infra/
├── compose.yaml      # Docker Compose configuration
└── prisma/
    ├── schema.prisma # Database schema definition
    ├── migrations/   # Database migration files
    ├── seed.ts       # Database seeding script
    └── seedTest.ts   # Test data seeding script
```

## Docker Compose (`compose.yaml`)

Defines the local development database service:

```yaml
services:
  database_intranet:
    image: "postgres:16.0-alpine3.18"
    env_file:
      - ../.env.development
    ports:
      - "5490:5432"
```

### Commands
```bash
npm run services:up    # Start containers
npm run services:stop  # Stop containers (preserves data)
npm run services:down  # Stop and remove containers (deletes data)
```

## Prisma

### Schema (`schema.prisma`)

Database models:

#### User
```prisma
model User {
  userId              Int               @id @default(autoincrement())
  email               String            @unique
  passwordHash        String
  name                String?
  isActive            Boolean           @default(true)
  roleId              Int               @default(1)
  role                Role              @relation(...)
  verificationCodes   VerificationCode[]
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}
```

#### VerificationCode
```prisma
model VerificationCode {
  id        Int      @id @default(autoincrement())
  code      String
  type      String   // "2FA" or "PASSWORD_RESET"
  userId    Int
  user      User     @relation(...)
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

#### Role
```prisma
model Role {
  id    Int     @id @default(autoincrement())
  name  String  @unique  // "student", "professor"
  users User[]
}
```

### Migrations

Located in `prisma/migrations/`:
- `20250205002207_create_user_model` - Initial user model
- `20250301152910_ref_user_model_and_add_verification_code_model` - Verification codes
- `20250501003340_add_roles_table` - Role-based access

### Prisma Commands

```bash
# Development
npm run prisma:migrate:dev          # Create new migration
npm run prisma:migrate:deploy:dev   # Apply migrations
npm run prisma:generate:dev         # Generate Prisma Client
npm run prisma:seed:dev             # Seed database
npm run prisma:studio               # Open Prisma Studio GUI

# Production/CI
npm run prisma:migrate:deploy       # Apply migrations
npm run prisma:generate             # Generate Prisma Client
npm run prisma:seed                 # Seed database
```

### Seeding (`seed.ts`)

Creates default roles:
- `student` (default role, id: 1)
- `professor`

## Database Conventions

### Naming
- Database tables: snake_case plural (`users`, `verification_codes`)
- Database columns: snake_case (`user_id`, `password_hash`)
- Prisma models: PascalCase singular (`User`, `VerificationCode`)
- Prisma fields: camelCase (`userId`, `passwordHash`)

### Mapping
Use `@map()` and `@@map()` decorators to map between conventions:
```prisma
model User {
  userId Int @id @map("user_id")
  @@map("users")
}
```

## Adding New Models

1. Define model in `schema.prisma`
2. Create migration: `npm run prisma:migrate:dev`
3. Regenerate client: `npm run prisma:generate:dev`
4. Update seed if needed

## Connection

Database URL format:
```
postgres://USER:PASSWORD@HOST:PORT/DATABASE
```

Default local: `postgres://local_user:local_password@localhost:5490/local_db`
