// Admin API client for Xordium website
// Handles authentication, session management, and API calls to the backend

const API_BASE = "/api";

// Session storage keys
const TOKEN_KEY = "xordium_admin_token";
const USER_KEY = "xordium_admin_user";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "owner" | "admin" | "moderator";
  created_at?: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
}

// ==================== SESSION MANAGEMENT ====================

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminUser;
  } catch {
    return null;
  }
}

export function storeSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

export function getCurrentUser(): AdminUser | null {
  return getStoredUser();
}

// ==================== ROLE-BASED ACCESS CONTROL ====================

const ROLE_HIERARCHY = {
  moderator: 1,
  admin: 2,
  owner: 3,
} as const;

export function hasRole(requiredRole: "owner" | "admin" | "moderator"): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

// ==================== API REQUEST HELPER ====================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401/403 - clear session and redirect to login
  if (response.status === 401 || response.status === 403) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

// ==================== AUTH API ====================

export async function login(email: string, password: string): Promise<AdminSession> {
  const session = await apiRequest<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  storeSession(session);
  return session;
}

export async function logout(): Promise<void> {
  clearSession();
  // Note: Backend doesn't have a logout endpoint that invalidates tokens,
  // but we clear the client-side session
}

export async function getCurrentUserFromAPI(): Promise<{ user: AdminUser }> {
  return apiRequest<{ user: AdminUser }>("/user");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ==================== USERS API (Owner only) ====================

export async function fetchUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/users");
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: "admin" | "moderator";
}): Promise<{ message: string; user: AdminUser }> {
  return apiRequest<{ message: string; user: AdminUser }>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ==================== MODERATORS API (Admin+) ====================

export async function fetchModerators(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/moderators");
}

export async function promoteToModerator(
  targetUserId: number
): Promise<{ message: string; userId: number; newRole: string }> {
  return apiRequest("/admin/moderators/promote", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

// ==================== EVENTS API (Moderator+) ====================

export interface AdminEvent {
  id: number;
  slug: string;
  tag: string;
  title: string;
  category: string;
  description?: string;
  image?: string;
  prize_pool?: string;
  venue?: string;
  format?: string;
  schedule?: string;
  team_size?: string;
  cta?: string;
  featured?: number;
  poster_url?: string;
}

export async function fetchEvents(): Promise<AdminEvent[]> {
  return apiRequest<AdminEvent[]>("/moderator/events");
}

export async function fetchEventBySlug(slug: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>(`/events/${slug}`);
}

export async function updateEvent(
  slug: string,
  input: { description?: string; poster_url?: string }
): Promise<AdminEvent> {
  return apiRequest<AdminEvent>(`/moderator/events/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// ==================== REGISTRATIONS API ====================

export interface Registration {
  id: number;
  event_id: number;
  email: string;
  name?: string;
  created_at: string;
}

export async function fetchRegistrations(): Promise<Registration[]> {
  return apiRequest<Registration[]>("/support");
}
