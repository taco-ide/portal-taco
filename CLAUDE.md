# CLAUDE.md - TACO-IDE Project Guide

## Project Overview

TACO-IDE is an intelligent educational platform designed to help teachers create and manage Python programming exercises with AI support. It provides a seamless environment for both educators and students, focusing on effective learning through personalized feedback and adaptive content.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jose library), bcrypt for password hashing
- **Email Service**: Resend API
- **Bot Protection**: Cloudflare Turnstile
- **Code Editor**: Monaco Editor
- **Code Execution**: Piston API (external service)

## Quick Start

```bash
# Install dependencies
npm install

# Start services and development server (all-in-one)
npm run dev

# OR step-by-step (recommended for first run):
npm run services:up              # Start Docker services
npm run prisma:migrate:deploy:dev # Run migrations
npm run prisma:seed:dev          # Seed database
npm run dev:next                 # Start Next.js dev server
```

## Project Structure

```
portal-taco/
├── src/
│   ├── app/              # Next.js App Router (pages and API routes)
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions and auth logic
│   ├── contexts/         # React contexts (UserContext)
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   └── data/             # Static data files
├── infra/
│   ├── prisma/           # Database schema and migrations
│   └── compose.yaml      # Docker Compose configuration
└── public/               # Static assets
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services and dev server |
| `npm run dev:next` | Start only Next.js dev server |
| `npm run services:up` | Start Docker containers |
| `npm run services:down` | Stop and remove containers |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:migrate:dev` | Create new migration |
| `npm run lint` | Run ESLint |

## Code Conventions

### File Naming
- React components: PascalCase (`MyComponent.tsx`)
- Utilities/hooks: camelCase (`useAuth.ts`, `utils.ts`)
- API routes: `route.ts` inside route directories

### Component Structure
- Page components in `src/app/` using App Router conventions
- Private route components in `_components/` folders
- Shared UI components in `src/components/ui/`
- Composed components in `src/components/composed/`

### API Routes
- All API routes under `src/app/api/v1/`
- Authentication routes: `/api/v1/auth/*`
- Follow RESTful conventions

### Database
- Schema defined in `infra/prisma/schema.prisma`
- Use snake_case for database column names (mapped via `@map()`)
- Use camelCase for Prisma model fields

## Authentication Flow

1. **Signup**: Create user → (production: send 2FA code) → verify → session
2. **Login**: Validate credentials → create session token → set HTTP-only cookie
3. **Protected Routes**: Middleware validates session token on each request
4. **Logout**: Clear session cookie

## Environment Variables

Key variables needed (see `.env.development` for local setup):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `RESEND_API_KEY` - Email service API key
- `CLOUDFLARE_TURNSTILE_*` - Bot protection keys

## Common Patterns

### Adding a New API Route
1. Create folder under `src/app/api/v1/`
2. Add `route.ts` with HTTP method handlers
3. Use Zod schemas for validation (see `src/lib/auth/schemas.ts`)

### Adding a New Page
1. Create folder under `src/app/`
2. Add `page.tsx` for the page component
3. Use route groups `(folder)` for layout organization

### Database Changes
1. Modify `infra/prisma/schema.prisma`
2. Run `npm run prisma:migrate:dev` to create migration
3. Prisma Client is auto-generated

## Known Issues & TODOs

- Code execution currently uses external Piston API (TODO: implement own API)
- Problem storage not yet implemented (using localStorage)
- Admin middleware commented out (future implementation)

## Testing

*Testing infrastructure not yet implemented*

## Deployment

The project is configured for deployment on Azure (see `.github/workflows/`).
