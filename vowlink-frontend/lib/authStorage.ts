export const PLATFORM_AUTH_KEY = "vowlink_platform_auth";
export const COUPLE_AUTH_KEY = "vowlink_couple_auth";

export interface StoredAuthUser {
  id: string;
  email: string;
  role: string;
  invitationId?: string;
}

export interface StoredAuthPayload {
  token: string;
  user: StoredAuthUser;
}

export function readPlatformAuth(): StoredAuthPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLATFORM_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthPayload;
    if (!parsed?.token || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePlatformAuth(payload: StoredAuthPayload) {
  window.localStorage.setItem(PLATFORM_AUTH_KEY, JSON.stringify(payload));
}

export function clearPlatformAuth() {
  window.localStorage.removeItem(PLATFORM_AUTH_KEY);
}

export function readCoupleAuth(): StoredAuthPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COUPLE_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthPayload;
    if (!parsed?.token || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCoupleAuth(payload: StoredAuthPayload) {
  window.localStorage.setItem(COUPLE_AUTH_KEY, JSON.stringify(payload));
}

export function clearCoupleAuth() {
  window.localStorage.removeItem(COUPLE_AUTH_KEY);
}
