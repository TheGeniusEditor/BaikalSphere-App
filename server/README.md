# Baikalsphere Auth Server

Centralized authentication & authorization service for the Baikalsphere platform.

## Architecture

- **Slim JWT** (~200 bytes): Contains `sub`, `email`, `orgId`, `platformRole`, `modules[]`
- **Two-layer RBAC**:
  - **Platform level**: Which modules a user can access (stored in JWT)
  - **Module level**: Granular permissions within each module (`module:resource:action`)
- **Refresh token rotation** with httpOnly cookies scoped to `.baikalsphere.com`
- **Namespaced permissions**: e.g. `ar:bookings:read`, `reconcile:transactions:create`

## Setup

```bash
# Install dependencies
npm install

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# Apply database schema
npm run db:apply

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user (optionally with organization) |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/refresh` | Refresh access token (uses httpOnly cookie) |
| POST | `/api/auth/logout` | Logout and revoke refresh token |
| GET | `/api/auth/me` | Get current user profile + modules |
| GET | `/api/auth/me/permissions?module=ar` | Get granular permissions for a module |

### Users (requires org_admin or superadmin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (scoped by org) |
| POST | `/api/users` | Create user with module access |
| PUT | `/api/users/:id/modules` | Update user's module access |
| PUT | `/api/users/:id/roles` | Update user's roles |
| PATCH | `/api/users/:id/deactivate` | Deactivate user |

### Modules
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/modules` | List all modules |
| GET | `/api/modules/:id/roles` | List roles for a module |
| GET | `/api/modules/:id/permissions` | List permissions for a module |
| POST | `/api/modules` | Create module (superadmin only) |

### Permissions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/permissions/resolve?module=ar` | Resolve user's permissions for a module |

## How Module Backends Integrate

Each module backend (e.g., AR) validates the Baikalsphere JWT and calls the permission resolution endpoint:

1. Verify JWT issued by `baikalsphere-auth` with the shared `JWT_ACCESS_SECRET`
2. Check `modules[]` in JWT contains the module ID (e.g., `"ar"`)
3. Call `GET /api/permissions/resolve?module=ar` (or cache the result) to get granular permissions
4. Authorize each request against the permission codes (e.g., `ar:bookings:create`)

## Database

Schema is in `sql/schema.sql`. Tables:
- `organizations` — Companies/tenants
- `users` — All platform users
- `modules` — Registered product modules (ar, reconcile, edsp)
- `user_modules` — Module access grants
- `roles` — Module-scoped roles
- `permissions` — Namespaced permission codes
- `role_permissions` — Role-to-permission mappings
- `user_roles` — User-to-role assignments
- `refresh_tokens` — Refresh token storage with rotation
