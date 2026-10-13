// Admin API client for Xordium website
// Uses httpOnly cookies for authentication (set by the backend)
// No token stored in localStorage - more secure against XSS

const API_BASE = "/api";

// User info stored for UI purposes only (role-based nav filtering)
// The actual auth token is in an httpOnly cookie the JS can't access
const USER_KEY = "xordium_admin_user";

export interface AdminUser {
  id: string;
  email: string;
  username?: string | null;
  rollNo?: string | null;
  name: string | null;
  role: "OWNER" | "ADMIN" | "MODERATOR";
  createdAt?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "MODERATOR";
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  invitedBy?: { email: string } | null;
}

export interface CreatedInvitation {
  success: boolean;
  invitation: { id: string; email: string; role: string; expiresAt: string };
  inviteUrl: string;
  emailSent: boolean;
  emailError?: string;
}

// ==================== SESSION MANAGEMENT ====================

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

export function storeUser(user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null;
}

export function getCurrentUser(): AdminUser | null {
  return getStoredUser();
}

// ==================== ROLE-BASED ACCESS CONTROL ====================

const ROLE_HIERARCHY = {
  MODERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
} as const;

export function hasRole(requiredRole: "OWNER" | "ADMIN" | "MODERATOR"): boolean {
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Cookies are sent automatically for same-origin requests
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  // Handle 401/403 - clear session and redirect to login
  if (response.status === 401 || response.status === 403) {
    clearUser();
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

export async function login(email: string, password: string): Promise<{ user: AdminUser }> {
  const result = await apiRequest<{ user: AdminUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Store user info for UI (role-based nav); auth is in httpOnly cookie
  storeUser(result.user);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Clear local state even if API call fails
  }
  clearUser();
}

export async function getCurrentUserFromAPI(): Promise<{ user: AdminUser }> {
  const result = await apiRequest<{ user: AdminUser }>("/user");
  // Keep stored user in sync
  storeUser(result.user);
  return result;
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

// ==================== INVITATIONS API (creates accounts via email) ====================

export async function fetchInvitations(): Promise<Invitation[]> {
  return apiRequest<Invitation[]>("/admin/invitations");
}

export async function sendInvitation(input: {
  email: string;
  role: "ADMIN" | "MODERATOR";
}): Promise<CreatedInvitation> {
  return apiRequest<CreatedInvitation>("/admin/invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---- Public invitation endpoints (no session required) ----

export async function getInvitation(
  token: string
): Promise<{ email: string; role: string; expiresAt: string }> {
  return apiRequest<{ email: string; role: string; expiresAt: string }>(
    `/invitations/${encodeURIComponent(token)}`
  );
}

export async function acceptInvitation(
  token: string,
  input: { name: string; rollNo: string; username: string; password: string }
): Promise<{ success: boolean; user: { email: string; username: string; role: string } }> {
  return apiRequest(`/invitations/${encodeURIComponent(token)}/accept`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ==================== MODERATORS API (Admin+) ====================

export async function fetchModerators(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/moderators");
}

export async function promoteToModerator(
  targetUserId: string
): Promise<{ message: string; user: AdminUser }> {
  return apiRequest("/admin/moderators/promote", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

// ==================== EVENTS API (Moderator+) ====================

export interface AdminEvent {
  id: string;
  slug: string;
  tag: string;
  title: string;
  category: string;
  description?: string;
  image?: string;
  prizePool?: string;
  venue?: string;
  format?: string;
  schedule?: string;
  teamSize?: string | null;
  cta?: string;
  featured?: boolean;
  posterUrl?: string | null;
}

export async function fetchEvents(): Promise<AdminEvent[]> {
  return apiRequest<AdminEvent[]>("/moderator/events");
}

export async function fetchEventBySlug(slug: string): Promise<AdminEvent> {
  return apiRequest<AdminEvent>(`/events/${slug}`);
}

export async function updateEvent(
  slug: string,
  input: { description?: string; posterUrl?: string }
): Promise<AdminEvent> {
  return apiRequest<AdminEvent>(`/moderator/events/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// ==================== REGISTRATIONS API ====================

export interface Registration {
  id: string;
  eventId: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export async function fetchRegistrations(): Promise<Registration[]> {
  return apiRequest<Registration[]>("/support");
}
