const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  organizationName?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    platformRole: string;
    organizationId: string | null;
    modules?: string[];
  };
  accessToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  platformRole: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  modules: string[];
}

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  accessToken = data.accessToken;
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  accessToken = data.accessToken;
  return data;
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const data = await apiFetch("/api/auth/refresh", { method: "POST" });
    accessToken = data.accessToken;
    return data.accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    accessToken = null;
  }
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch("/api/auth/me");
}

export async function getMyPermissions(moduleId: string): Promise<{ module: string; permissions: string[] }> {
  return apiFetch(`/api/auth/me/permissions?module=${encodeURIComponent(moduleId)}`);
}
