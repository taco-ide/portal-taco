# TACO-IDE Deep Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [Authentication System](#authentication-system)
7. [API Routes](#api-routes)
8. [Frontend Components](#frontend-components)
9. [State Management](#state-management)
10. [Code Editor](#code-editor)
11. [Development Workflow](#development-workflow)
12. [Known Issues & TODOs](#known-issues--todos)
13. [Security Considerations](#security-considerations)
14. [Deployment](#deployment)

---

## Project Overview

### What is TACO-IDE?

TACO-IDE (Teaching Assistant for Code Optimization - Integrated Development Environment) is an intelligent educational platform designed to help teachers create and manage Python programming exercises with AI support. It provides a seamless environment for both educators and students, focusing on effective learning through personalized feedback and adaptive content.

### Target Users

1. **Teachers/Professors**
   - Create and manage custom programming exercises
   - Define allowed libraries and constraints
   - Share exercises publicly or privately
   - Use automated grading with AI support
   - Track student progress and analytics

2. **Students**
   - Access intelligent IDE with real-time feedback
   - Receive personalized AI support
   - Get contextual hints and guidance
   - Learn in a safe environment
   - Access community-driven exercise repository

### Core Features

- Multi-language code editor (Monaco Editor)
- Code execution via Piston API
- User authentication with email verification
- Role-based access control (student/professor)
- Exercise creation and management
- AI-powered chat assistance

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  React/Next  │  │ Monaco Editor│  │  Zustand Store       │  │
│  │  Components  │  │  (Code IDE)  │  │  (State Management)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Server (App Router)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Middleware  │  │ API Routes   │  │  Server Components   │  │
│  │  (Auth)      │  │ (/api/v1/*)  │  │  (SSR Pages)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────────┐
│   PostgreSQL     │  │ Piston API   │  │   Resend API         │
│   (Database)     │  │ (Code Exec)  │  │   (Email Service)    │
│   via Prisma     │  │ (External)   │  │   (External)         │
└──────────────────┘  └──────────────┘  └──────────────────────┘
```

### Request Flow

1. **Page Request**
   - Browser requests page
   - Next.js middleware checks authentication
   - If authenticated, renders page with SSR
   - If not, redirects to login

2. **API Request**
   - Browser sends API request with session cookie
   - Middleware validates JWT token
   - API route handles request
   - Response sent to browser

3. **Code Execution**
   - User writes code in Monaco Editor
   - Clicks "Run" button
   - Code sent to Piston API
   - Results displayed in output panel

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.23 | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| Radix UI | Various | Accessible UI primitives |
| Framer Motion | 11.18.0 | Animations |
| Monaco Editor | 4.6.0 | Code editor (VS Code) |
| Zustand | 5.0.3 | State management |
| React Hook Form | 7.54.2 | Form handling |
| Zod | 3.24.2 | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.2.23 | REST API endpoints |
| Prisma | 6.3.1 | Database ORM |
| PostgreSQL | 16.0 | Relational database |
| Jose | 6.0.8 | JWT handling |
| bcrypt | 5.1.1 | Password hashing |
| Resend | 4.1.2 | Email service |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | - | Containerization |
| Docker Compose | - | Container orchestration |
| Azure | - | Cloud deployment |

---

## Directory Structure

```
portal-taco/
├── .github/
│   └── workflows/           # CI/CD GitHub Actions
├── infra/
│   ├── compose.yaml         # Docker Compose for local dev
│   └── prisma/
│       ├── schema.prisma    # Database schema
│       ├── migrations/      # Database migrations
│       ├── seed.ts          # Production seeding
│       └── seedTest.ts      # Test data seeding
├── public/                  # Static assets (images, fonts)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (home)/          # Landing page route group
│   │   ├── (inside)/        # Authenticated area
│   │   ├── api/v1/          # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── problem/         # Problem solving interface
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable React components
│   │   ├── ui/              # Base UI components
│   │   └── composed/        # Complex composed components
│   ├── contexts/            # React Context providers
│   ├── data/                # Static data files
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   │   └── auth/            # Authentication logic
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   └── middleware.ts        # Next.js middleware
├── .env.development         # Development environment vars
├── .gitignore
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│        Role         │       │  VerificationCode   │
├─────────────────────┤       ├─────────────────────┤
│ id: Int (PK)        │       │ id: Int (PK)        │
│ name: String        │◄──┐   │ code: String        │
└─────────────────────┘   │   │ type: String        │
                          │   │ userId: Int (FK)    │──┐
                          │   │ expiresAt: DateTime │  │
                          │   │ createdAt: DateTime │  │
                          │   └─────────────────────┘  │
                          │                            │
                    ┌─────┴────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│               User                   │
├─────────────────────────────────────┤
│ userId: Int (PK)                    │
│ email: String (unique)              │
│ passwordHash: String                │
│ name: String?                       │
│ isActive: Boolean (default: true)   │
│ roleId: Int (FK, default: 1)        │
│ createdAt: DateTime                 │
│ updatedAt: DateTime                 │
└─────────────────────────────────────┘
```

### Models

#### User
- Primary entity for authentication
- Links to Role for authorization
- Has many VerificationCodes for 2FA/password reset
- Default role is "student" (roleId: 1)

#### Role
- Defines user permissions
- Current roles: "student", "professor"
- Seeded during database initialization

#### VerificationCode
- Temporary codes for email verification
- Types: "2FA" (signup), "PASSWORD_RESET"
- Expires after 15 minutes
- Cascades delete with User

### Database Conventions

- Tables use snake_case plural names (`users`, `verification_codes`)
- Columns use snake_case (`user_id`, `password_hash`)
- Prisma models use PascalCase singular (`User`, `VerificationCode`)
- Prisma fields use camelCase (`userId`, `passwordHash`)

---

## Authentication System

### Authentication Flow

```
┌────────────┐
│   Signup   │
└─────┬──────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Validate input (Zod schema)                          │
│ 2. Verify Turnstile token (production)                  │
│ 3. Check if email exists                                │
│ 4. Hash password (bcrypt)                               │
│ 5. Create user in database                              │
└─────────────────────────────────────────────────────────┘
      │
      ├── Production ──► Generate 2FA code ──► Send email
      │                       │
      │                       ▼
      │                ┌─────────────┐
      │                │   Verify    │
      │                │   Email     │
      │                └─────────────┘
      │                       │
      │                       ▼
      └── Development ──────────────────────► Success
```

### Login Flow

```
┌────────────┐
│   Login    │
└─────┬──────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Validate input (Zod schema)                          │
│ 2. Verify Turnstile token (production)                  │
│ 3. Find user by email                                   │
│ 4. Check if user is active                              │
│ 5. Verify password (bcrypt)                             │
│ 6. Create session JWT token                             │
│ 7. Set HTTP-only cookie                                 │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────┐
│   Redirect to   │
│   Dashboard     │
└─────────────────┘
```

### Token Types

1. **Session Token**
   - Created on successful login
   - Contains: userId, email, name, role
   - Expires: 7 days
   - Stored in HTTP-only cookie

2. **Verification Token**
   - Created for 2FA or password reset
   - Contains: userId, email, type
   - Expires: 15 minutes
   - Stored in HTTP-only cookie

### Middleware Protection

```typescript
// Protected routes require valid session token
// Public paths bypass authentication:
const publicPaths = [
  "/auth",          // All auth routes
  "/api/v1/auth",   // Auth API routes
  "/",              // Home page
  "/images",        // Static images
  "/public",        // Public folder
];
```

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Signing**: HS256 algorithm via jose library
- **HTTP-Only Cookies**: Prevents XSS token theft
- **Secure Cookies**: HTTPS-only in production
- **Cloudflare Turnstile**: Bot protection (production)
- **Input Validation**: Zod schemas for all inputs

---

## API Routes

### Authentication Routes

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/v1/auth/signup` | POST | Create new user | No |
| `/api/v1/auth/login` | POST | Authenticate user | No |
| `/api/v1/auth/logout` | POST | End session | Yes |
| `/api/v1/auth/verify` | POST | Verify email code | No (has token) |
| `/api/v1/auth/send-code` | POST | Resend verification | No (has token) |
| `/api/v1/auth/reset-password` | POST | Reset password | No (has token) |

### User Routes

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/v1/user` | GET | Get current user | Yes |

### Data Routes

| Route | Method | Description | Auth Required |
|-------|--------|-------------|---------------|
| `/api/v1/collaborators` | GET | Get collaborators list | No |

### Request/Response Format

All API responses follow this structure:

```typescript
// Success
{
  message: "Success message",
  data: { ... }  // or user: { ... }, etc.
}

// Error
{
  error: "Error message",
  details?: ValidationError[]  // For validation errors
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 409 | Conflict (e.g., email exists) |
| 500 | Internal Server Error |

---

## Frontend Components

### Component Hierarchy

```
App
├── Layout (Root)
│   ├── Providers
│   │   └── UserProvider (Context)
│   └── Pages
│       ├── (home)
│       │   └── Landing Page
│       │       ├── Header
│       │       ├── Hero
│       │       ├── Features
│       │       ├── Collaborators
│       │       └── Footer
│       ├── (inside)
│       │   └── Dashboard Layout
│       │       ├── Navbar
│       │       ├── [Content]
│       │       └── Footer
│       ├── auth
│       │   └── Auth Layout
│       │       ├── LoginForm
│       │       ├── SignupForm
│       │       ├── VerifyForm
│       │       └── ResetPasswordForm
│       └── problem/[id]
│           └── Problem Layout
│               ├── Header
│               ├── ProblemDescription
│               ├── EditorPanel
│               ├── InputPanel
│               ├── OutputPanel
│               └── ChatPanel
```

### UI Components (shadcn/ui style)

Located in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `button` | Button with variants |
| `input` | Text input field |
| `label` | Form label |
| `card` | Card container |
| `form` | Form with react-hook-form |
| `tabs` | Tab navigation |
| `select` | Dropdown select |
| `avatar` | User avatar |
| `badge` | Status badges |
| `alert` | Alert messages |
| `alert-dialog` | Confirmation dialogs |
| `carousel` | Carousel slider |
| `skeleton` | Loading skeleton |
| `table` | Data table |
| `textarea` | Multi-line input |
| `scroll-area` | Custom scrollbar |
| `resizable` | Resizable panels |

### Chat Components

Located in `src/components/ui/chat/`:

- `chat-bubble` - Individual message
- `chat-input` - Message input
- `chat-message-list` - Message container
- `expandable-chat` - Expandable chat panel
- `message-loading` - Loading indicator

---

## State Management

### Zustand Stores

#### useCodeEditorStore

Primary store for the code editor functionality.

```typescript
interface CodeEditorState {
  // State
  language: string;        // Current language
  output: string;          // Execution output
  input: string;           // stdin input
  isRunning: boolean;      // Execution in progress
  error: string | null;    // Error message
  theme: string;           // Editor theme
  fontSize: number;        // Font size
  editor: MonacoEditor | null;
  executionResult: ExecutionResult | null;

  // Actions
  setEditor(editor): void;
  getCode(): string;
  getInput(): string;
  setInput(input: string): void;
  setLanguage(language: string): void;
  setTheme(theme: string): void;
  setFontSize(fontSize: number): void;
  runCode(): Promise<void>;
}
```

**Persistence**: Uses localStorage for:
- `editor-language`
- `editor-theme`
- `editor-font-size`
- `editor-input`
- `editor-code-{language}` (code per language)

### React Context

#### UserContext

Manages authenticated user state.

```typescript
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser(): Promise<void>;
  clearUser(): void;
  getFirstName(): string;
  logout(): Promise<void>;
}
```

---

## Code Editor

### Monaco Editor Integration

The code editor is powered by Monaco Editor (VS Code's editor) with:

- Multiple language support
- Custom themes
- Syntax highlighting
- Code completion
- Error markers

### Supported Languages

| Language | Runtime Version | File Extension |
|----------|-----------------|----------------|
| JavaScript | 18.15.0 | .js |
| TypeScript | 5.0.3 | .ts |
| Python | 3.10.0 | .py |
| Java | 15.0.2 | .java |
| Go | 1.16.2 | .go |
| Rust | 1.68.2 | .rs |
| C++ | 10.2.0 | .cpp |
| C# | 6.12.0 | .cs |
| Ruby | 3.0.1 | .rb |
| Swift | 5.3.3 | .swift |

### Editor Themes

| Theme | Background |
|-------|------------|
| VS Dark | #1e1e1e |
| VS Light | #ffffff |
| GitHub Dark | #0d1117 |
| Monokai | #272822 |
| Solarized Dark | #002b36 |

### Code Execution

Currently uses **Piston API** (external service):

```typescript
// Execution flow
POST https://emkc.org/api/v2/piston/execute
{
  language: "python",
  version: "3.10.0",
  files: [{ content: code }],
  stdin: input
}
```

**Response handling:**
1. Check for API-level errors
2. Check for compilation errors
3. Check for runtime errors
4. Return successful output

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd portal-taco

# Install dependencies
npm install

# Start services (first time)
npm run services:up
npm run prisma:migrate:deploy:dev
npm run prisma:seed:dev

# Start development server
npm run dev:next
```

### Daily Development

```bash
# Start Docker services
npm run services:up

# Start Next.js dev server
npm run dev:next

# Open http://localhost:3000
```

### Database Changes

```bash
# 1. Modify schema
# Edit infra/prisma/schema.prisma

# 2. Create migration
npm run prisma:migrate:dev

# 3. Regenerate client (automatic)
npm run prisma:generate:dev

# 4. View data
npm run prisma:studio
```

### Stopping Development

```bash
# Stop Next.js (Ctrl+C)

# Stop Docker (preserves data)
npm run services:stop

# OR remove containers (deletes data)
npm run services:down
```

---

## Known Issues & TODOs

### Critical Issues

1. **External Code Execution Dependency**
   - Currently relies on external Piston API
   - No rate limiting or security controls
   - TODO: Implement own sandboxed execution API

2. **Problem Storage Not Implemented**
   - Using localStorage for code persistence
   - Problems are not stored in database
   - TODO: Create Problem model and API

### Technical Debt

1. **PrismaClient Instantiation**
   - Creating new instance per request
   - Should use singleton pattern
   - File: `src/app/api/v1/*/route.ts`

2. **Admin Middleware Incomplete**
   - Role-based middleware is commented out
   - File: `src/lib/auth/middleware.ts`

3. **Missing Tests**
   - No unit tests
   - No integration tests
   - No E2E tests

4. **Error Handling**
   - Generic error messages in some places
   - Need better error categorization
   - Missing error boundaries

### Feature TODOs

1. **Exercise Management**
   - [ ] Create Problem model
   - [ ] CRUD API for problems
   - [ ] Problem visibility (public/private)
   - [ ] Problem categories/tags

2. **Student Progress**
   - [ ] Submission tracking
   - [ ] Progress analytics
   - [ ] Leaderboards

3. **AI Integration**
   - [ ] Chat assistant implementation
   - [ ] Hint generation
   - [ ] Code review suggestions

4. **Teacher Features**
   - [ ] Class management
   - [ ] Assignment creation
   - [ ] Grade book

### UI/UX Improvements

1. **Accessibility**
   - [ ] Screen reader support
   - [ ] Keyboard navigation
   - [ ] Color contrast audit

2. **Responsive Design**
   - [ ] Mobile code editor
   - [ ] Touch-friendly controls

3. **Performance**
   - [ ] Code splitting
   - [ ] Image optimization
   - [ ] Bundle size reduction

---

## Security Considerations

### Current Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - HTTP-only cookies
   - Secure flag in production
   - Password hashing with bcrypt

2. **Input Validation**
   - Zod schemas for all inputs
   - SQL injection prevention (Prisma)
   - XSS prevention (React)

3. **Bot Protection**
   - Cloudflare Turnstile (production)

### Security Concerns

1. **Code Execution**
   - Using external API without sandboxing
   - Could be exploited for malicious code
   - Need own sandboxed execution environment

2. **Rate Limiting**
   - No rate limiting on API endpoints
   - Vulnerable to brute force attacks

3. **CORS**
   - Using default Next.js CORS
   - May need stricter configuration

4. **Environment Variables**
   - `.env.development` committed to repo
   - Contains sample values only
   - Production secrets must be in CI/CD

### Recommendations

1. Implement rate limiting (e.g., `express-rate-limit` equivalent)
2. Add CAPTCHA to sensitive endpoints
3. Implement account lockout after failed attempts
4. Add security headers (CSP, HSTS, etc.)
5. Set up security scanning in CI/CD

---

## Deployment

### Azure Deployment

The project is configured for Azure deployment via GitHub Actions.

#### Workflow File

Located at `.github/workflows/` (Azure Web App deployment)

#### Environment Variables Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `RESEND_API_KEY` | Email service API key |
| `EMAIL_FROM` | Sender email address |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Turnstile public key |
| `CLOUDFLARE_TURNSTILE_SECRET` | Turnstile secret key |
| `NEXT_PUBLIC_APP_ENV` | Set to "production" |

### Build Process

```bash
npm run build
# Runs:
# 1. prisma migrate deploy
# 2. prisma generate
# 3. prisma seed
# 4. next build
```

### Production Start

```bash
npm run start
# Runs: node node_modules/next/dist/bin/next start -p $PORT
```

---

## Appendix

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `MyComponent.tsx` |
| Utilities | camelCase | `myUtil.ts` |
| Hooks | camelCase with `use` prefix | `useMyHook.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MY_CONSTANT` |
| Types/Interfaces | PascalCase | `MyInterface` |
| CSS Modules | camelCase | `myStyles.module.css` |

### Import Order

1. React/Next.js imports
2. Third-party libraries
3. Internal absolute imports (`@/...`)
4. Relative imports
5. Type imports

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Common Commands Reference

```bash
# Development
npm run dev              # All-in-one start
npm run dev:next         # Just Next.js

# Database
npm run services:up      # Start PostgreSQL
npm run services:down    # Stop PostgreSQL
npm run prisma:studio    # Database GUI
npm run prisma:migrate:dev  # New migration

# Build
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
```
