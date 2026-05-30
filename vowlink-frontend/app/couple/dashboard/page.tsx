"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandInlineLogo } from "@/components/BrandLogo";
import { CoverPhotoUploadField } from "@/components/CoverPhotoUploadField";
import { GalleryPhotoUploadField } from "@/components/GalleryPhotoUploadField";
import { InvitationExperienceEditor } from "@/components/InvitationExperienceEditor";
import { InvitationThemePicker } from "@/components/InvitationThemePicker";
import {
  apiClient,
  type CoupleGuestRow,
  type PlatformInvitationRow,
  type RsvpDashboardPayload,
} from "@/lib/apiClient";
import {
  clearCoupleAuth,
  readCoupleAuth,
  saveCoupleAuth,
  type StoredAuthPayload,
} from "@/lib/authStorage";
import {
  emptyInvitationExperience,
  mergeInvitationExperience,
  type InvitationExperience,
  type PresentationMode,
} from "@/lib/invitationExperience";
import { normalizeMapEmbedUrlForSave } from "@/lib/googleMapsEmbed";
import {
  DEFAULT_INVITATION_THEME,
  normalizeInvitationThemeId,
  type InvitationThemeId,
} from "@/lib/invitationThemes";
import { useI18n, type TranslationKey } from "@/lib/i18n";

function weddingDateToInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultWeddingInput(): string {
  const d = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface CreateGuestLine {
  guestName: string;
}

export default function CoupleDashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [auth, setAuth] = useState<StoredAuthPayload | null>(null);
  const [invitation, setInvitation] = useState<PlatformInvitationRow | null>(null);
  const [canCreateInvitation, setCanCreateInvitation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guests, setGuests] = useState<CoupleGuestRow[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [rsvp, setRsvp] = useState<RsvpDashboardPayload | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  /** Expanded RSVP detail: attendance lists */
  const [rsvpPanel, setRsvpPanel] = useState<null | "attendance">(null);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestAllowedCompanions, setNewGuestAllowedCompanions] = useState("0");
  const [newGuestTableNumber, setNewGuestTableNumber] = useState("");
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const [coupleNames, setCoupleNames] = useState("");
  const [coupleNamesEn, setCoupleNamesEn] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueNameEn, setVenueNameEn] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueAddressEn, setVenueAddressEn] = useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [galleryPhotoUrls, setGalleryPhotoUrls] = useState<string[]>([]);
  const [invitationTheme, setInvitationTheme] = useState<InvitationThemeId>(
    DEFAULT_INVITATION_THEME,
  );
  const [presentationMode, setPresentationMode] = useState<PresentationMode>("stories");
  const [experience, setExperience] = useState<InvitationExperience>(() =>
    emptyInvitationExperience(),
  );

  const [createSlug, setCreateSlug] = useState("");
  const [createGuests, setCreateGuests] = useState<CreateGuestLine[]>([]);
  const [createGuestInput, setCreateGuestInput] = useState("");

  const loadGuests = useCallback(
    async (token: string) => {
      setGuestsLoading(true);
      try {
        const rows = await apiClient.coupleListGuests(token);
        setGuests(rows);
      } catch {
        setGuests([]);
      } finally {
        setGuestsLoading(false);
      }
    },
    [],
  );

  const loadRsvp = useCallback(async (token: string) => {
    setRsvpLoading(true);
    try {
      const payload = await apiClient.coupleGetRsvpDashboard(token);
      setRsvp(payload);
    } catch {
      setRsvp(null);
    } finally {
      setRsvpLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    const session = readCoupleAuth();
    if (!session) {
      router.replace("/couple/login");
      return;
    }
    setAuth(session);
    setLoading(true);
    setFeedback(null);
    try {
      const data = await apiClient.coupleGetInvitation(session.token);
      setInvitation(data.invitation);
      setCanCreateInvitation(data.canCreateInvitation);

      if (data.invitation) {
        const inv = data.invitation;
        setCoupleNames(inv.coupleNames);
        setCoupleNamesEn(inv.coupleNamesEn ?? "");
        setWeddingDate(weddingDateToInput(inv.weddingDate));
        setVenueName(inv.venueName);
        setVenueNameEn(inv.venueNameEn ?? "");
        setVenueAddress(inv.venueAddress);
        setVenueAddressEn(inv.venueAddressEn ?? "");
        setMapEmbedUrl(inv.mapEmbedUrl);
        setCoverPhotoUrl(inv.coverPhotoUrl ?? "");
        setGalleryPhotoUrls(inv.galleryPhotoUrls ?? []);
        setInvitationTheme(normalizeInvitationThemeId(inv.invitationTheme));
        setPresentationMode((inv.presentationMode ?? "classic") as PresentationMode);
        setExperience(mergeInvitationExperience(inv.invitationExperience));
        await loadGuests(session.token);
        await loadRsvp(session.token);
      } else if (data.canCreateInvitation) {
        setWeddingDate(defaultWeddingInput());
        setPresentationMode("stories");
        setExperience(emptyInvitationExperience());
      }
    } catch {
      setFeedback(t("genericError"));
      clearCoupleAuth();
      router.replace("/couple/login");
    } finally {
      setLoading(false);
    }
  }, [loadGuests, loadRsvp, router, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const logout = () => {
    clearCoupleAuth();
    router.push("/couple/login");
  };

  /** Persist cover image immediately so refresh and the public invitation page stay in sync. */
  const persistCoverPhoto = useCallback(
    async (next: string) => {
      if (!auth?.token || !invitation) return;
      setFeedback(null);
      try {
        const updated = await apiClient.couplePatchInvitation(auth.token, {
          coverPhotoUrl: next.trim() === "" ? "" : next,
        });
        setInvitation(updated);
        setCoverPhotoUrl(updated.coverPhotoUrl ?? "");
        setFeedback(t("invitationSaved"));
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : t("genericError"));
        throw err;
      }
    },
    [auth, invitation, t],
  );

  const persistGalleryPhotos = useCallback(
    async (next: string[]) => {
      if (!auth?.token || !invitation) return;
      setFeedback(null);
      try {
        const updated = await apiClient.couplePatchInvitation(auth.token, {
          galleryPhotoUrls: next,
        });
        setInvitation(updated);
        setGalleryPhotoUrls(updated.galleryPhotoUrls ?? []);
        setFeedback(t("invitationSaved"));
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : t("genericError"));
        throw err;
      }
    },
    [auth, invitation, t],
  );

  const persistInvitationTheme = useCallback(
    async (next: InvitationThemeId) => {
      if (!auth?.token || !invitation) return;
      setFeedback(null);
      try {
        const updated = await apiClient.couplePatchInvitation(auth.token, {
          invitationTheme: next,
        });
        setInvitation(updated);
        setInvitationTheme(normalizeInvitationThemeId(updated.invitationTheme));
        setFeedback(t("invitationSaved"));
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : t("genericError"));
        throw err;
      }
    },
    [auth, invitation, t],
  );

  const save = async () => {
    if (!auth || !invitation) return;
    setFeedback(null);
    try {
      const iso =
        weddingDate && !Number.isNaN(new Date(weddingDate).getTime())
          ? new Date(weddingDate).toISOString()
          : invitation.weddingDate;
      const resolvedMap = normalizeMapEmbedUrlForSave(
        mapEmbedUrl,
        venueName,
        venueAddress,
      );
      const updated = await apiClient.couplePatchInvitation(auth.token, {
        coupleNames,
        coupleNamesEn: coupleNamesEn.trim() || undefined,
        weddingDate: iso,
        venueName,
        venueNameEn: venueNameEn.trim() || undefined,
        venueAddress,
        venueAddressEn: venueAddressEn.trim() || undefined,
        mapEmbedUrl: resolvedMap,
        coverPhotoUrl: coverPhotoUrl.trim() === "" ? "" : coverPhotoUrl,
        galleryPhotoUrls,
        invitationTheme,
        presentationMode,
        invitationExperience: experience,
      });
      setInvitation(updated);
      setMapEmbedUrl(updated.mapEmbedUrl ?? "");
      setPresentationMode((updated.presentationMode ?? "classic") as PresentationMode);
      setExperience(mergeInvitationExperience(updated.invitationExperience));
      setFeedback(t("invitationSaved"));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  const addCreateGuest = () => {
    if (!createGuestInput.trim()) return;
    setCreateGuests((prev) => [...prev, { guestName: createGuestInput.trim() }]);
    setCreateGuestInput("");
  };

  const createInvitation = async () => {
    if (!auth) return;
    setFeedback(null);
    if (createSlug.trim().length < 2) {
      setFeedback(t("errSlugMin"));
      return;
    }
    if (coupleNames.trim().length < 2) {
      setFeedback(t("errCoupleNamesMin"));
      return;
    }
    if (venueName.trim().length < 2) {
      setFeedback(t("errVenueNameMin"));
      return;
    }
    if (venueAddress.trim().length < 3) {
      setFeedback(t("venueAddressHelp"));
      return;
    }
    try {
      const iso =
        weddingDate && !Number.isNaN(new Date(weddingDate).getTime())
          ? new Date(weddingDate).toISOString()
          : new Date().toISOString();
      const resolvedMap = normalizeMapEmbedUrlForSave(
        mapEmbedUrl,
        venueName,
        venueAddress,
      );
      const result = await apiClient.coupleCreateInvitation(auth.token, {
        coupleNames,
        coupleNamesEn: coupleNamesEn.trim() || undefined,
        slug: createSlug,
        weddingDate: iso,
        venueName,
        venueNameEn: venueNameEn.trim() || undefined,
        venueAddress,
        venueAddressEn: venueAddressEn.trim() || undefined,
        mapEmbedUrl: resolvedMap,
        coverPhotoUrl: coverPhotoUrl.trim() || undefined,
        galleryPhotoUrls: galleryPhotoUrls.length ? galleryPhotoUrls : undefined,
        invitationTheme,
        presentationMode,
        invitationExperience: experience,
        guests: createGuests.map((g) => ({ guestName: g.guestName })),
      });
      saveCoupleAuth({
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: "COUPLE",
          invitationId:
            typeof result.invitation._id === "string"
              ? result.invitation._id
              : String(result.invitation._id),
        },
      });
      setAuth(readCoupleAuth());
      setInvitation(result.invitation);
      setPresentationMode((result.invitation.presentationMode ?? "stories") as PresentationMode);
      setExperience(mergeInvitationExperience(result.invitation.invitationExperience));
      setCanCreateInvitation(false);
      setFeedback(t("invitationCreated"));
      await loadGuests(result.token);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  const addGuest = async () => {
    if (!auth || !invitation) return;
    setFeedback(null);
    try {
      const companions = Math.min(
        20,
        Math.max(0, Math.round(Number(newGuestAllowedCompanions) || 0)),
      );
      const guest = await apiClient.coupleAddGuest(auth.token, {
        guestName: newGuestName,
        allowedCompanions: companions,
        tableNumber: newGuestTableNumber.trim(),
      });
      setGuests((prev) => [...prev, guest]);
      setNewGuestName("");
      setNewGuestAllowedCompanions("0");
      setNewGuestTableNumber("");
      await loadRsvp(auth.token);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  const guestPublicUrl = (slug: string, guestSlug: string) => {
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    return `${base}/${encodeURIComponent(slug)}?guest=${encodeURIComponent(guestSlug)}`;
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint(t("guestLinkCopied"));
      setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setFeedback(t("genericError"));
    }
  };

  if (!auth && loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-royal-cream px-4 text-royal-brown">
        <p className="text-center text-sm">{t("saving")}</p>
      </main>
    );
  }

  const showCreate = canCreateInvitation && !invitation;
  const showEdit = Boolean(invitation);

  return (
    <main className="min-h-dvh bg-royal-cream px-4 pb-12 pt-16 text-royal-brown sm:px-6 md:px-8 md:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <BrandInlineLogo className="mb-2" />
            <h1 className="text-balance text-xl font-semibold sm:text-2xl">{t("coupleDashboardTitle")}</h1>
            <p className="mt-1 text-sm text-royal-brown/80">{auth?.user.email}</p>
            {invitation ? (
              <Link
                href={`/${invitation.slug}`}
                className="mt-2 inline-block text-sm text-royal-gold underline"
              >
                {t("publicPreviewLink")}: /{invitation.slug}
              </Link>
            ) : null}
          </div>
          <button
            type="button"
            className="min-h-11 w-full rounded-xl bg-royal-brown px-4 py-2.5 text-sm text-royal-cream sm:w-auto sm:min-h-0"
            onClick={logout}
          >
            {t("signOut")}
          </button>
        </header>

        {feedback ? (
          <p className="rounded-xl border border-royal-gold/40 bg-white px-4 py-2 text-sm">{feedback}</p>
        ) : null}
        {copyHint ? (
          <p className="text-sm text-royal-gold">{copyHint}</p>
        ) : null}

        <p className="text-sm text-royal-brown/80">{t("coupleEditIntro")}</p>
        {invitation ? (
          <p className="text-sm text-amber-900/90">{t("draftStateHint")}</p>
        ) : null}
        <p className="text-sm text-royal-brown/70">{t("disableFromPlatformHint")}</p>

        {loading ? (
          <p>{t("saving")}</p>
        ) : showCreate ? (
          <section className="space-y-4 rounded-2xl border border-royal-gold/30 bg-white p-6">
            <h2 className="text-lg font-semibold">{t("createYourInvitationTitle")}</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("slug")}</label>
              <input
                className="w-full rounded-xl border px-4 py-2 font-mono text-sm"
                placeholder="ahmad-sara-wedding"
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("coupleNames")}</label>
              <input
                className="w-full rounded-xl border px-4 py-2"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("weddingDate")}</label>
              <input
                className="w-full rounded-xl border px-4 py-2"
                type="datetime-local"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("venueName")}</label>
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder={t("venueName")}
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("venueAddress")}</label>
              <p className="mb-1 text-xs text-royal-brown/75">{t("venueAddressHelp")}</p>
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder="بيروت، حيّ …، اسم القاعة"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>

            <details className="rounded-xl border border-royal-gold/20 bg-royal-cream/20 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-royal-brown">
                {t("englishContentOptional")}
              </summary>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-royal-brown/90">
                    {t("coupleNamesEn")}
                  </label>
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder="Ahmed & Sara"
                    value={coupleNamesEn}
                    onChange={(e) => setCoupleNamesEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-royal-brown/90">
                    {t("venueNameEn")}
                  </label>
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder="Royal Garden Hall"
                    value={venueNameEn}
                    onChange={(e) => setVenueNameEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-royal-brown/90">
                    {t("venueAddressEn")}
                  </label>
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder="Beirut, Lebanon"
                    value={venueAddressEn}
                    onChange={(e) => setVenueAddressEn(e.target.value)}
                  />
                </div>
                <p className="text-xs text-royal-brown/70">{t("englishContentHelp")}</p>
              </div>
            </details>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("mapsEmbedUrl")}</label>
              <p className="mb-1 text-xs text-royal-brown/75">{t("mapEmbedHelpCouple")}</p>
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder="https://maps.google.com/..."
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2 rounded-xl border p-3 sm:p-4">
              <p className="text-sm font-medium">{t("coverPhotoUpload")}</p>
              <CoverPhotoUploadField
                url={coverPhotoUrl}
                onUrlChange={setCoverPhotoUrl}
                onUploadError={() => setFeedback(t("uploadFailed"))}
              />
            </div>

            <div className="space-y-2 rounded-xl border border-royal-gold/20 p-3 sm:p-4">
              <p className="text-sm font-medium">{t("galleryPhotos")}</p>
              <GalleryPhotoUploadField
                urls={galleryPhotoUrls}
                onUrlsChange={setGalleryPhotoUrls}
                onUploadError={() => setFeedback(t("uploadFailed"))}
              />
            </div>

            <div className="rounded-xl border border-royal-gold/20 bg-royal-cream/30 p-3 sm:p-4">
              <InvitationThemePicker
                value={invitationTheme}
                onChange={(id) => {
                  setInvitationTheme(id);
                  if (invitation) void persistInvitationTheme(id);
                }}
              />
            </div>

            <InvitationExperienceEditor
              presentationMode={presentationMode}
              onPresentationModeChange={setPresentationMode}
              experience={experience}
              onExperienceChange={setExperience}
            />

            <div className="space-y-2 border-t border-royal-gold/20 pt-4">
              <p className="text-sm font-medium">{t("guestName")}</p>
              <div className="flex flex-wrap gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border px-4 py-2"
                  placeholder={t("guestName")}
                  value={createGuestInput}
                  onChange={(e) => setCreateGuestInput(e.target.value)}
                />
                <button
                  type="button"
                  className="rounded-xl border border-royal-brown/30 px-4 py-2 text-sm"
                  onClick={addCreateGuest}
                >
                  {t("addGuest")}
                </button>
              </div>
              <ul className="list-disc pl-5 text-sm">
                {createGuests.map((g, i) => (
                  <li key={`${g.guestName}-${i}`}>{g.guestName}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-royal-brown px-4 py-2 font-medium text-royal-cream"
              onClick={() => void createInvitation()}
            >
              {t("createInvitation")}
            </button>
          </section>
        ) : showEdit ? (
          <>
            <section className="space-y-4 rounded-2xl border border-royal-gold/30 bg-white p-6">
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder={t("coupleNames")}
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-4 py-2"
                type="datetime-local"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder={t("venueName")}
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-4 py-2"
                placeholder={t("venueAddress")}
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
              <details className="rounded-xl border border-royal-gold/20 bg-royal-cream/20 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-royal-brown">
                  {t("englishContentOptional")}
                </summary>
                <div className="mt-3 grid gap-3">
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder={t("coupleNamesEn")}
                    value={coupleNamesEn}
                    onChange={(e) => setCoupleNamesEn(e.target.value)}
                  />
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder={t("venueNameEn")}
                    value={venueNameEn}
                    onChange={(e) => setVenueNameEn(e.target.value)}
                  />
                  <input
                    className="w-full rounded-xl border bg-white px-4 py-2"
                    placeholder={t("venueAddressEn")}
                    value={venueAddressEn}
                    onChange={(e) => setVenueAddressEn(e.target.value)}
                  />
                  <p className="text-xs text-royal-brown/70">{t("englishContentHelp")}</p>
                </div>
              </details>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("mapsEmbedUrl")}</label>
                <p className="mb-1 text-xs text-royal-brown/75">{t("mapEmbedHelpCouple")}</p>
                <input
                  className="w-full rounded-xl border px-4 py-2"
                  placeholder="https://maps.google.com/..."
                  value={mapEmbedUrl}
                  onChange={(e) => setMapEmbedUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2 rounded-xl border p-3 sm:p-4">
                <p className="text-sm font-medium">{t("coverPhotoUpload")}</p>
                <CoverPhotoUploadField
                  url={coverPhotoUrl}
                  onUrlChange={setCoverPhotoUrl}
                  onUploadError={() => setFeedback(t("uploadFailed"))}
                  onPersist={persistCoverPhoto}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-royal-gold/20 p-3 sm:p-4">
                <p className="text-sm font-medium">{t("galleryPhotos")}</p>
                <GalleryPhotoUploadField
                  urls={galleryPhotoUrls}
                  onUrlsChange={setGalleryPhotoUrls}
                  onUploadError={() => setFeedback(t("uploadFailed"))}
                  onPersist={persistGalleryPhotos}
                />
              </div>

              <div className="rounded-xl border border-royal-gold/20 bg-royal-cream/30 p-3 sm:p-4">
                <InvitationThemePicker
                  value={invitationTheme}
                  onChange={(id) => {
                    setInvitationTheme(id);
                    void persistInvitationTheme(id);
                  }}
                />
              </div>

              <InvitationExperienceEditor
                presentationMode={presentationMode}
                onPresentationModeChange={setPresentationMode}
                experience={experience}
                onExperienceChange={setExperience}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  className="min-h-12 flex-1 rounded-xl bg-royal-brown px-4 py-2.5 font-medium text-royal-cream"
                  onClick={() => void save()}
                >
                  {t("saveChanges")}
                </button>
                <button
                  type="button"
                  className="min-h-12 rounded-xl border-2 border-royal-gold bg-royal-cream/50 px-5 text-sm font-semibold text-royal-brown shadow-sm transition hover:bg-royal-cream sm:min-w-[11rem]"
                  onClick={() =>
                    invitation
                      ? window.open(
                          `/${encodeURIComponent(invitation.slug)}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      : undefined
                  }
                >
                  {t("previewInvitationCta")}
                </button>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-royal-gold/30 bg-white p-6">
              <h2 className="text-lg font-semibold">{t("rsvpDashboard")}</h2>
              {rsvpLoading ? (
                <p className="text-sm">{t("saving")}</p>
              ) : rsvp ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <StatCard label={t("totalGuests")} value={rsvp.stats.totalGuests} />
                    <StatCard
                      label={t("coming")}
                      value={rsvp.stats.comingGuests}
                      interactive
                      active={rsvpPanel === "attendance"}
                      onClick={() =>
                        setRsvpPanel((p) => (p === "attendance" ? null : "attendance"))
                      }
                    />
                    <StatCard label={t("notComing")} value={rsvp.stats.notComingGuests} />
                    <StatCard label={t("pending")} value={rsvp.stats.pendingGuests} />
                  </div>
                  {rsvpPanel === "attendance" ? (
                    <RsvpAttendanceDetail
                      guests={rsvp.guests ?? []}
                      onClose={() => setRsvpPanel(null)}
                      t={t}
                    />
                  ) : null}
                </>
              ) : (
                <p className="text-sm">{t("failedLoadDashboard")}</p>
              )}
              {invitation ? (
                <button
                  type="button"
                  className="rounded-xl border border-royal-brown/30 px-4 py-2 text-sm"
                  onClick={() => window.open(apiClient.buildExportDashboardUrl(invitation.slug), "_blank", "noopener,noreferrer")}
                >
                  {t("exportExcel")}
                </button>
              ) : null}
            </section>

            <section className="space-y-4 rounded-2xl border border-royal-gold/30 bg-white p-6">
              <h2 className="text-lg font-semibold">{t("guestLinksTitle")}</h2>
              <p className="text-sm leading-relaxed text-royal-brown/85">{t("guestLinksExplain")}</p>

              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border px-4 py-2"
                  placeholder={t("guestNameForLink")}
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-royal-brown/90">
                      {t("guestAllowedCompanions")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      inputMode="numeric"
                      className="w-full rounded-xl border px-4 py-2"
                      value={newGuestAllowedCompanions}
                      onChange={(e) => setNewGuestAllowedCompanions(e.target.value)}
                    />
                    <span className="text-[11px] text-royal-brown/65">
                      {t("guestAllowedCompanionsHelp")}
                    </span>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-royal-brown/90">
                      {t("guestTableNumber")}
                    </span>
                    <input
                      className="w-full rounded-xl border px-4 py-2"
                      placeholder="20"
                      value={newGuestTableNumber}
                      onChange={(e) => setNewGuestTableNumber(e.target.value)}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl bg-royal-gold px-4 py-2 text-sm font-medium text-royal-brown sm:w-auto"
                  onClick={() => void addGuest()}
                >
                  {t("addGuest")}
                </button>
              </div>

              {guestsLoading ? (
                <p className="text-sm">{t("saving")}</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {guests.map((g) => {
                    const url = invitation ? guestPublicUrl(invitation.slug, g.guestSlug) : "";
                    const attendanceLabel =
                      g.attendanceStatus === "COMING"
                        ? t("coming")
                        : g.attendanceStatus === "NOT_COMING"
                          ? t("notComing")
                          : t("pending");
                    return (
                      <li
                        key={g._id}
                        className="rounded-xl border border-royal-gold/20 bg-royal-cream/50 p-3"
                      >
                        <p className="font-medium">
                          {g.guestName}
                          <span className="ms-2 text-sm font-normal text-royal-brown/80">
                            — {t("attendance")}: {attendanceLabel}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-royal-brown/75">
                          {t("guestListPartyTable")
                            .replace("{count}", String(1 + (g.allowedCompanions ?? 0)))
                            .replace("{table}", g.tableNumber?.trim() || "—")}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-royal-brown/80">{url}</p>
                        <button
                          type="button"
                          className="mt-2 text-xs text-royal-gold underline"
                          onClick={() => void copyUrl(url)}
                        >
                          {t("copyGuestLink")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
            {t("accountNeedsPermission")}
          </p>
        )}

        <Link href="/" className="text-sm text-royal-gold hover:underline">
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  interactive: isInteractive,
  active,
  onClick,
}: {
  label: string;
  value: number;
  interactive?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-xl border border-royal-gold/30 bg-royal-cream p-3 ${
        isInteractive
          ? "cursor-pointer select-none transition hover:border-royal-gold/60 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-gold"
          : ""
      } ${active ? "ring-2 ring-royal-gold/50" : ""}`}
    >
      <p className="text-xs uppercase tracking-[0.15em] text-royal-gold">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

type TFn = (key: TranslationKey) => string;

function RsvpAttendanceDetail({
  guests,
  onClose,
  t,
}: {
  guests: RsvpDashboardPayload["guests"];
  onClose: () => void;
  t: TFn;
}) {
  const coming = guests.filter((g) => g.attendanceStatus === "COMING");
  const pending = guests.filter((g) => g.attendanceStatus === "PENDING");
  const notComing = guests.filter((g) => g.attendanceStatus === "NOT_COMING");

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-royal-gold/35 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-royal-brown">{t("rsvpDetailAttendance")}</h3>
        <button
          type="button"
          className="rounded-lg px-3 py-1 text-sm text-royal-gold underline hover:bg-royal-cream"
          onClick={onClose}
        >
          {t("rsvpClosePanel")}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RsvpGuestColumn
          title={t("coming")}
          guests={coming.map((g) => g.guestName)}
          emptyLabel={t("rsvpNoGuestsInCategory")}
        />
        <RsvpGuestColumn
          title={t("pending")}
          guests={pending.map((g) => g.guestName)}
          emptyLabel={t("rsvpNoGuestsInCategory")}
        />
        <RsvpGuestColumn
          title={t("notComing")}
          guests={notComing.map((g) => g.guestName)}
          emptyLabel={t("rsvpNoGuestsInCategory")}
        />
      </div>
    </div>
  );
}

function RsvpGuestColumn({
  title,
  guests: names,
  emptyLabel,
}: {
  title: string;
  guests: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-royal-gold/25 bg-royal-cream/60 p-3">
      <p className="mb-2 border-b border-royal-gold/20 pb-1 text-xs font-semibold uppercase tracking-wide text-royal-gold">
        {title}
      </p>
      <ul className="max-h-56 space-y-1.5 overflow-y-auto text-sm">
        {names.length === 0 ? (
          <li className="text-royal-brown/55">{emptyLabel}</li>
        ) : (
          names.map((name, i) => (
            <li key={`${name}-${i}`} className="leading-snug">
              {name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
