-- Baikalsphere Centralized Auth Schema
-- Supports multi-module SSO with two-layer RBAC:
--   Platform level: which modules a user can access
--   Module level: granular permissions within each module (namespaced as module:resource:action)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ===== ORGANIZATIONS =====
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,               -- e.g. "taj-hotels", used in URLs
  industry text,                            -- hospitality, finance, etc.
  logo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug);

-- ===== USERS =====
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  platform_role text NOT NULL DEFAULT 'member',   -- 'superadmin' | 'org_admin' | 'member'
  is_active boolean NOT NULL DEFAULT true,
  email_verified boolean NOT NULL DEFAULT false,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_organization_id_idx ON users(organization_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- ===== MODULES =====
-- Each Baikalsphere product/module (AR, Reconcile, EDSP, etc.)
CREATE TABLE IF NOT EXISTS modules (
  id text PRIMARY KEY,                        -- e.g. 'ar', 'reconcile', 'edsp'
  name text NOT NULL,                         -- display name: "Accounts Receivable"
  description text,
  base_url text,                              -- e.g. "https://ar.baikalsphere.com"
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== USER MODULE ACCESS =====
-- Which modules each user can access (platform-level RBAC)
CREATE TABLE IF NOT EXISTS user_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id text NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS user_modules_user_id_idx ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS user_modules_module_id_idx ON user_modules(module_id);

-- ===== ROLES =====
-- Module-scoped roles (e.g. "ar:hotel_admin", "ar:finance_user", "reconcile:manager")
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name text NOT NULL,                         -- e.g. 'hotel_admin'
  display_name text NOT NULL,                 -- e.g. 'Hotel Administrator'
  description text,
  is_system boolean NOT NULL DEFAULT false,   -- system roles can't be deleted
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, name)
);

CREATE INDEX IF NOT EXISTS roles_module_id_idx ON roles(module_id);

-- ===== PERMISSIONS =====
-- Namespaced: module:resource:action (e.g. "ar:bookings:read", "ar:invoices:create")
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id text NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,                  -- e.g. "ar:bookings:read"
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS permissions_module_id_idx ON permissions(module_id);

-- ===== ROLE PERMISSIONS =====
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ===== USER ROLES =====
-- Assign roles to users (module-level RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);

-- ===== REFRESH TOKENS =====
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES refresh_tokens(id),
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_expires_at_idx ON refresh_tokens(expires_at);

-- ===== SEED: MODULES =====
INSERT INTO modules (id, name, description) VALUES
  ('ar', 'Accounts Receivable', 'Hotel finance and accounts receivable management'),
  ('reconcile', 'Reconciliation', 'Payment reconciliation and matching'),
  ('edsp', 'EDSP', 'Enterprise data services platform')
ON CONFLICT (id) DO NOTHING;

-- ===== SEED: AR MODULE ROLES =====
INSERT INTO roles (module_id, name, display_name, description, is_system) VALUES
  ('ar', 'hotel_admin', 'Hotel Administrator', 'Full access to hotel finance module', true),
  ('ar', 'finance_user', 'Finance User', 'Can manage bookings and invoices', true),
  ('ar', 'viewer', 'Viewer', 'Read-only access to hotel finance data', true)
ON CONFLICT (module_id, name) DO NOTHING;

-- ===== SEED: AR MODULE PERMISSIONS =====
INSERT INTO permissions (module_id, code, description) VALUES
  ('ar', 'ar:bookings:read', 'View bookings'),
  ('ar', 'ar:bookings:create', 'Create bookings'),
  ('ar', 'ar:bookings:update', 'Update bookings'),
  ('ar', 'ar:bookings:delete', 'Delete bookings'),
  ('ar', 'ar:invoices:read', 'View invoices'),
  ('ar', 'ar:invoices:create', 'Create invoices'),
  ('ar', 'ar:invoices:update', 'Update invoices'),
  ('ar', 'ar:organizations:read', 'View organizations'),
  ('ar', 'ar:organizations:create', 'Create organizations'),
  ('ar', 'ar:organizations:update', 'Update organizations'),
  ('ar', 'ar:reports:read', 'View reports'),
  ('ar', 'ar:users:read', 'View users'),
  ('ar', 'ar:users:manage', 'Manage users'),
  ('ar', 'ar:settings:manage', 'Manage hotel settings')
ON CONFLICT (code) DO NOTHING;

-- ===== SEED: ROLE-PERMISSION MAPPINGS FOR AR =====
-- hotel_admin gets all AR permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.module_id = 'ar' AND r.name = 'hotel_admin'
  AND p.module_id = 'ar'
ON CONFLICT DO NOTHING;

-- finance_user gets bookings + invoices + org read + reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.module_id = 'ar' AND r.name = 'finance_user'
  AND p.code IN (
    'ar:bookings:read', 'ar:bookings:create', 'ar:bookings:update',
    'ar:invoices:read', 'ar:invoices:create', 'ar:invoices:update',
    'ar:organizations:read', 'ar:reports:read'
  )
ON CONFLICT DO NOTHING;

-- viewer gets read-only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.module_id = 'ar' AND r.name = 'viewer'
  AND p.code IN (
    'ar:bookings:read', 'ar:invoices:read',
    'ar:organizations:read', 'ar:reports:read'
  )
ON CONFLICT DO NOTHING;
