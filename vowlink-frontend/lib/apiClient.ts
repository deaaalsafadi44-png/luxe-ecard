const normalizeApiBase = (raw: string | undefined) => {
  if (!raw?.trim()) {
    return "/api";
  }
  return raw.replace(/\/$/, "");
};

const getApiBaseUrl = () => normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL);

const joinApiPath = (path: string) => {
  const base = getApiBaseUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (base.startsWith("http")) {
    return `${base}${suffix}`;
  }
  return `${base}${suffix}`;
};

const readErrorPayload = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

import type { InvitationThemeId } from "./invitationThemes";
import type {
  InvitationExperience,
  PresentationMode,
} from "./invitationExperience";

export type { InvitationThemeId };

export type { InvitationExperience, PresentationMode };

export interface InvitationViewPayload {
  invitation: {
    _id: string;
    coupleNames: string;
    coupleNamesEn?: string;
    slug: string;
    weddingDate: string;
    venueName: string;
    venueNameEn?: string;
    venueAddress: string;
    venueAddressEn?: string;
    mapEmbedUrl: string;
    coverPhotoUrl?: string;
    galleryPhotoUrls: string[];
    invitationTheme?: InvitationThemeId;
    presentationMode?: PresentationMode;
    invitationExperience?: InvitationExperience;
  };
  guest: {
    _id: string;
    guestName: string;
    guestSlug: string;
    attendanceStatus: "COMING" | "NOT_COMING" | "PENDING";
  } | null;
}

export type InvitationStatus = "DRAFT" | "PUBLISHED" | "DISABLED";

export interface AuthLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    invitationId?: string;
  };
}

export interface PlatformInvitationRow {
  _id: string;
  coupleNames: string;
  coupleNamesEn?: string;
  slug: string;
  weddingDate: string;
  venueName: string;
  venueNameEn?: string;
  venueAddress: string;
  venueAddressEn?: string;
  mapEmbedUrl: string;
  coverPhotoUrl?: string;
  galleryPhotoUrls: string[];
  invitationTheme?: InvitationThemeId;
  presentationMode?: PresentationMode;
  invitationExperience?: InvitationExperience;
  status: InvitationStatus;
  /** Present when the invitation was created from the couple dashboard. */
  coupleOwnerUserId?: string;
}

export interface CoupleInvitationSession {
  invitation: PlatformInvitationRow | null;
  canCreateInvitation: boolean;
}

export interface CoupleGuestRow {
  _id: string;
  guestName: string;
  guestSlug: string;
  attendanceStatus: string;
}

export interface RsvpDashboardPayload {
  stats: {
    totalGuests: number;
    comingGuests: number;
    notComingGuests: number;
    pendingGuests: number;
  };
  guests: Array<{
    _id: string;
    guestName: string;
    guestSlug: string;
    attendanceStatus: "COMING" | "NOT_COMING" | "PENDING";
  }>;
}

/** Response from `GET /admin/dashboard/:slug` (public stats for an invitation). */
export interface AdminInviteDashboardResponse {
  invitation: { coupleNames?: string; slug?: string };
  stats: RsvpDashboardPayload["stats"];
  guests: RsvpDashboardPayload["guests"];
}

const authHeaders = (token: string, extra?: HeadersInit): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  ...extra,
});

export const apiClient = {
  getApiBaseUrl,

  buildExportDashboardUrl(slug: string) {
    const path = `/admin/dashboard/${encodeURIComponent(slug)}/export`;
    const base = getApiBaseUrl();
    if (base.startsWith("http")) {
      return joinApiPath(path);
    }
    if (typeof window !== "undefined") {
      return `${window.location.origin}${joinApiPath(path)}`;
    }
    return joinApiPath(path);
  },

  async getInvitationBySlug(slug: string, guestSlug?: string) {
    const query = guestSlug
      ? `?guest=${encodeURIComponent(guestSlug)}`
      : "";
    const response = await fetch(
      `${joinApiPath(`/invitations/${slug}`)}${query}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch invitation.");
    }

    return (await response.json()) as InvitationViewPayload;
  },

  async updateRsvp(slug: string, guestSlug: string, status: string) {
    const response = await fetch(joinApiPath(`/rsvp/${slug}/${guestSlug}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit RSVP.");
    }

    return response.json();
  },

  async createInvitation(
    payload: Record<string, unknown>,
    options?: { adminInviteKey?: string },
  ) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const key = options?.adminInviteKey?.trim();
    if (key) {
      (headers as Record<string, string>)["X-Admin-Invite-Key"] = key;
    }
    const response = await fetch(joinApiPath("/admin/invitations"), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await readErrorPayload(response);
      const message =
        typeof errorPayload?.message === "string"
          ? errorPayload.message
          : "Failed to create invitation.";
      const error = new Error(message) as Error & { issues?: unknown };
      error.issues = errorPayload?.issues;
      throw error;
    }

    return response.json();
  },

  /** Unlock the /admin gate; 204 when key is valid (or server has no secret). */
  async verifyAdminInviteKey(key: string) {
    const response = await fetch(joinApiPath("/admin/verify-invite-key"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Verification failed.",
      );
    }
  },

  async getDashboardStats(slug: string) {
    const response = await fetch(
      joinApiPath(`/admin/dashboard/${encodeURIComponent(slug)}`),
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats.");
    }
    return (await response.json()) as AdminInviteDashboardResponse;
  },

  async login(email: string, password: string) {
    const response = await fetch(joinApiPath("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Login failed.",
      );
    }
    return (await response.json()) as AuthLoginResponse;
  },

  async platformListInvitations(token: string) {
    const response = await fetch(joinApiPath("/platform/invitations"), {
      cache: "no-store",
      headers: authHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Failed to list invitations.");
    }
    const data = (await response.json()) as { invitations: PlatformInvitationRow[] };
    return data.invitations;
  },

  async platformPatchInvitation(
    token: string,
    slug: string,
    body: { status?: InvitationStatus },
  ) {
    const response = await fetch(
      joinApiPath(`/platform/invitations/${encodeURIComponent(slug)}`),
      {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Update failed.",
      );
    }
    return response.json() as Promise<PlatformInvitationRow>;
  },

  async platformDeleteInvitation(token: string, slug: string) {
    const response = await fetch(
      joinApiPath(`/platform/invitations/${encodeURIComponent(slug)}`),
      {
        method: "DELETE",
        headers: authHeaders(token),
      },
    );
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Delete failed.",
      );
    }
  },

  async platformCreateCoupleAccount(
    token: string,
    body: {
      email: string;
      password: string;
      invitationSlug?: string;
      allowCreateInvitation?: boolean;
    },
  ) {
    const response = await fetch(joinApiPath("/platform/couples"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string"
          ? err.message
          : "Could not create couple account.",
      );
    }
    return response.json() as Promise<{
      id: string;
      email: string;
      invitationSlug: string | null;
      allowCreateInvitation: boolean;
    }>;
  },

  async coupleGetInvitation(token: string) {
    const response = await fetch(joinApiPath("/couple/invitation"), {
      cache: "no-store",
      headers: authHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Failed to load invitation.");
    }
    return (await response.json()) as CoupleInvitationSession;
  },

  async coupleCreateInvitation(
    token: string,
    body: Record<string, unknown>,
  ) {
    const response = await fetch(joinApiPath("/couple/invitation"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string"
          ? err.message
          : "Could not create invitation.",
      );
    }
    return (await response.json()) as {
      token: string;
      invitation: PlatformInvitationRow;
      user: { id: string; email: string };
    };
  },

  async coupleListGuests(token: string) {
    const response = await fetch(joinApiPath("/couple/guests"), {
      cache: "no-store",
      headers: authHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Failed to load guests.");
    }
    const data = (await response.json()) as { guests: CoupleGuestRow[] };
    return data.guests;
  },

  async coupleAddGuest(
    token: string,
    body: { guestName: string; guestSlug?: string },
  ) {
    const response = await fetch(joinApiPath("/couple/guests"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Could not add guest.",
      );
    }
    const data = (await response.json()) as { guest: CoupleGuestRow };
    return data.guest;
  },

  async couplePatchInvitation(
    token: string,
    body: Record<string, unknown>,
  ) {
    const response = await fetch(joinApiPath("/couple/invitation"), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) {
      const err = await readErrorPayload(response);
      throw new Error(
        typeof err?.message === "string" ? err.message : "Update failed.",
      );
    }
    const data = (await response.json()) as {
      invitation: PlatformInvitationRow;
    };
    return data.invitation;
  },

  async coupleGetRsvpDashboard(token: string) {
    const response = await fetch(joinApiPath("/couple/rsvp"), {
      cache: "no-store",
      headers: authHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Failed to load RSVP dashboard.");
    }
    return (await response.json()) as RsvpDashboardPayload;
  },
};
