"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RsvpForm } from "@/components/RsvpForm";
import { CoupleMonogram } from "@/components/invitation/CoupleMonogram";
import { InvitationConfetti } from "@/components/invitation/InvitationConfetti";
import { InvitationCornerFrame } from "@/components/invitation/InvitationCornerFrame";
import { InvitationNoise } from "@/components/invitation/InvitationNoise";
import { InvitationPageSkeleton } from "@/components/invitation/InvitationPageSkeleton";
import { InvitationParticles } from "@/components/invitation/InvitationParticles";
import { InvitationGalleryLightbox } from "@/components/invitation/InvitationGalleryLightbox";
import { InvitationShareButton } from "@/components/invitation/InvitationShareButton";
import { apiClient, type InvitationViewPayload } from "@/lib/apiClient";
import {
  DEFAULT_INVITATION_THEME,
  invitationThemeStyle,
  normalizeInvitationThemeId,
} from "@/lib/invitationThemes";
import { StoriesInvitationView } from "@/components/invitation/stories/StoriesInvitationView";
import {
  mergeInvitationExperience,
  resolveGuestWelcomeMessage,
} from "@/lib/invitationExperience";
import {
  resolveGoogleMapsEmbedSrc,
  resolveGoogleMapsOpenUrl,
} from "@/lib/googleMapsEmbed";
import { useI18n } from "@/lib/i18n";

const normalizeSlugParam = (
  value: string | string[] | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed || undefined;
};

export default function InvitationPage() {
  const params = useParams<{ slug: string | string[] }>();
  const searchParams = useSearchParams();
  const { t, isArabic } = useI18n();
  const [payload, setPayload] = useState<InvitationViewPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(
    null,
  );

  const guestQueryKey = searchParams.toString();

  useEffect(() => {
    const slug = normalizeSlugParam(params.slug);
    const guest =
      new URLSearchParams(guestQueryKey || "").get("guest") ?? undefined;

    setShowWelcome(true);
    if (!slug) {
      setPayload(null);
      setHasLoadError(true);
      setIsLoading(false);
      return;
    }

    const loadInvitation = async () => {
      try {
        const invitationPayload = await apiClient.getInvitationBySlug(slug, guest);
        setPayload(invitationPayload);
        setHasLoadError(false);
      } catch {
        setPayload(null);
        setHasLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadInvitation();
  }, [params.slug, guestQueryKey]);

  useEffect(() => {
    if (!payload?.invitation?.slug) return;
    if (payload.invitation.presentationMode === "stories") return;
    const id = window.setTimeout(() => setShowWelcome(false), 3000);
    return () => window.clearTimeout(id);
  }, [payload?.invitation?.slug, payload?.invitation?.presentationMode]);

  const mapsExternalUrl = useMemo(() => {
    if (!payload) return "";
    return resolveGoogleMapsOpenUrl(
      payload.invitation.mapEmbedUrl,
      payload.invitation.venueName,
      payload.invitation.venueAddress,
    );
  }, [payload]);

  const resolvedMapEmbedSrc = useMemo(() => {
    if (!payload) return "";
    return resolveGoogleMapsEmbedSrc(
      payload.invitation.mapEmbedUrl,
      payload.invitation.venueName,
      payload.invitation.venueAddress,
    );
  }, [payload]);

  if (isLoading) {
    return (
      <div
        className="min-h-dvh"
        style={invitationThemeStyle(DEFAULT_INVITATION_THEME)}
      >
        <InvitationPageSkeleton />
      </div>
    );
  }

  if (!payload) {
    return (
      <div
        className="min-h-dvh"
        style={invitationThemeStyle(DEFAULT_INVITATION_THEME)}
      >
      <main className="min-h-dvh bg-royal-cream px-4 pb-12 pt-16 text-royal-brown sm:px-6 md:px-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-royal-gold/30 bg-white/80 p-6 text-center sm:rounded-3xl md:p-10">
          <h2 className="text-balance text-xl font-semibold sm:text-2xl">
            {hasLoadError ? "تعذر تحميل الدعوة" : "الدعوة غير متوفرة"}
          </h2>
          <p className="mt-3 text-pretty text-sm text-royal-brown/80">
            {hasLoadError
              ? "تحقق من تشغيل الخادم الخلفي واتصال قاعدة البيانات، ثم أعد المحاولة."
              : "لا توجد بيانات لهذه الدعوة حاليًا."}
          </p>
        </section>
      </main>
      </div>
    );
  }

  const guestName = payload.guest?.guestName ?? t("dearGuest");
  const invitation = payload.invitation;
  const localizedInvitation = {
    ...invitation,
    coupleNames:
      !isArabic && invitation.coupleNamesEn?.trim()
        ? invitation.coupleNamesEn
        : invitation.coupleNames,
    venueName:
      !isArabic && invitation.venueNameEn?.trim()
        ? invitation.venueNameEn
        : invitation.venueName,
    venueAddress:
      !isArabic && invitation.venueAddressEn?.trim()
        ? invitation.venueAddressEn
        : invitation.venueAddress,
  };
  const coverUrl = payload.invitation.coverPhotoUrl?.trim();
  const galleryUrls = payload.invitation.galleryPhotoUrls ?? [];
  const mapEmbedUrl = payload.invitation.mapEmbedUrl?.trim();
  const themeStyle = invitationThemeStyle(
    normalizeInvitationThemeId(payload.invitation.invitationTheme),
  );
  const presentationMode = payload.invitation.presentationMode ?? "classic";
  const experience = mergeInvitationExperience(
    payload.invitation.invitationExperience,
  );
  const localizedTemplate =
    !isArabic && experience.guestWelcomeMessageTemplateEn?.trim()
      ? experience.guestWelcomeMessageTemplateEn
      : experience.guestWelcomeMessageTemplate;
  const guestGreeting = resolveGuestWelcomeMessage(
    localizedTemplate?.trim() || undefined,
    guestName,
    t("welcome"),
  );

  if (presentationMode === "stories") {
    return (
      <StoriesInvitationView
        payload={payload}
        themeStyle={themeStyle}
        mapsExternalUrl={mapsExternalUrl}
        experience={experience}
        onRsvpSuccess={() => {}}
      />
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-dvh" style={themeStyle}>
        <InvitationBackdrop />
        <main className="relative z-10 min-h-dvh px-5 pb-12 pt-14 text-royal-brown sm:px-6 md:px-10 md:pt-20">
          <section className="mx-auto max-w-3xl">
            <InvitationDetailCard coverUrl={coverUrl}>
              <InvitationNoise className="opacity-[0.06]" />
              <InvitationCornerFrame />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(212,175,55,0.14),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(75,54,33,0.08),transparent_60%)]" />
              <div className="relative z-[3] p-6 sm:p-10">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                  <CoupleMonogram coupleNames={localizedInvitation.coupleNames} />
                  <div className="text-center sm:text-start">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-royal-gold/90">
                      {t("welcome")}
                    </p>
                    <h1 className="mt-2 text-balance text-2xl font-semibold [text-shadow:0_2px_20px_rgba(255,255,255,0.95)] sm:text-3xl md:text-5xl">
                      {guestName}
                    </h1>
                    <p className="mt-2 text-sm text-royal-brown/75 sm:text-base">
                      {guestGreeting}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-center">
                  <EnvelopeReveal name={guestName} />
                </div>
                <p className="mt-8 text-center text-xs text-royal-brown/60">
                  {localizedInvitation.coupleNames}
                </p>
                <div className="mt-6 flex justify-center">
                  <InvitationShareButton />
                </div>
              </div>
            </InvitationDetailCard>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh" style={themeStyle}>
      <InvitationBackdrop />
      <InvitationConfetti burst={confettiBurst} />
      <main className="relative z-10 min-h-dvh px-5 pb-16 pt-12 text-royal-brown sm:px-6 md:px-10 md:pb-20 md:pt-16">
        <section className="mx-auto max-w-5xl">
          <InvitationDetailCard coverUrl={coverUrl}>
            <InvitationNoise className="opacity-[0.05]" />
            <InvitationCornerFrame />
            <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_18%_12%,rgba(212,175,55,0.12),transparent_50%),radial-gradient(circle_at_80%_88%,rgba(75,54,33,0.08),transparent_55%)]" />

            <div className="relative z-[3] space-y-8 px-5 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-stretch md:justify-between md:gap-10">
                <div className="flex min-w-0 flex-col items-center gap-6 text-center md:max-w-prose md:items-start md:gap-5 md:text-start lg:flex-row lg:items-start lg:gap-8">
                  <CoupleMonogram
                    className="shadow-md ring-2 ring-white/50"
                    coupleNames={localizedInvitation.coupleNames}
                  />
                  <div className="min-w-0 w-full max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-royal-gold sm:text-sm">
                      {t("welcome")}
                    </p>
                    <h1
                      className="mt-3 text-balance font-semibold leading-[1.15] text-3xl tracking-tight text-royal-brown [font-family:var(--font-invitation-display),var(--font-geist-sans),sans-serif] [text-shadow:0_1px_0_rgba(255,255,255,0.85)] sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                      {localizedInvitation.coupleNames}
                    </h1>
                    <p className="mt-4 text-pretty text-sm text-royal-brown/90 sm:text-base">
                      {guestGreeting}
                    </p>
                    <p className="mt-2 text-pretty text-sm text-royal-brown/90 sm:text-base">
                      {t("honoredGuest")}:{" "}
                      <span className="font-semibold text-royal-brown">{guestName}</span>
                    </p>
                    <div className="mt-6 w-full rounded-2xl border border-royal-gold/30 bg-white/90 px-4 py-3.5 text-start text-sm shadow-md ring-1 ring-royal-gold/10 backdrop-blur-md sm:px-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
                        <span className="shrink-0 font-semibold text-royal-gold">
                          {t("venue")}
                        </span>
                        <span className="hidden text-royal-brown/40 sm:inline">·</span>
                        <span className="min-w-0 text-royal-brown [overflow-wrap:anywhere]">
                          {localizedInvitation.venueName} — {localizedInvitation.venueAddress}
                        </span>
                      </div>
                      <a
                        href={mapsExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-royal-brown/90 underline decoration-royal-gold/50 underline-offset-2 transition hover:text-royal-gold"
                      >
                        {t("openInGoogleMaps")}
                        <span aria-hidden>↗</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="w-full shrink-0 rounded-2xl border border-royal-gold/30 bg-white/90 p-4 shadow-md ring-1 ring-white/40 backdrop-blur-md md:w-[min(100%,340px)] md:self-start">
                  <CountdownTimer weddingDate={payload.invitation.weddingDate} />
                </div>
              </div>

              <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
                <div className="overflow-hidden rounded-2xl border border-royal-gold/30 bg-white/90 shadow-md ring-1 ring-royal-gold/10 backdrop-blur-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-royal-gold/15 px-4 py-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-royal-gold">
                      {t("sectionMapTitle")}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-royal-brown/60">{t("venue")}</p>
                      <a
                        href={mapsExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-royal-gold underline decoration-royal-gold/35 underline-offset-2"
                      >
                        {t("openInGoogleMaps")}
                      </a>
                    </div>
                  </div>
                  {!mapEmbedUrl ? (
                    <p className="border-b border-royal-gold/10 bg-royal-cream/25 px-4 py-2 text-xs text-royal-brown/70">
                      {t("mapVenueSearchEmbedHint")}
                    </p>
                  ) : null}
                  <iframe
                    key={resolvedMapEmbedSrc}
                    src={resolvedMapEmbedSrc}
                    title={t("sectionMapTitle")}
                    className="aspect-[4/3] min-h-[220px] w-full border-0 sm:min-h-[300px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-royal-gold/30 bg-white/90 p-4 shadow-md ring-1 ring-royal-gold/10 backdrop-blur-md">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-royal-gold">
                      {t("sectionGalleryTitle")}
                    </p>
                    {galleryUrls.length > 0 ? (
                      <div className="columns-2 gap-2 sm:columns-3">
                        {galleryUrls.slice(0, 12).map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            onClick={() => setGalleryLightboxIndex(index)}
                            className="group mb-2 block w-full break-inside-avoid cursor-zoom-in rounded-xl border border-royal-gold/15 bg-royal-cream/20 text-start shadow-sm transition hover:border-royal-gold/35 hover:brightness-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold focus-visible:ring-offset-2"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- invitation gallery URLs */}
                            <img
                              src={url}
                              alt=""
                              className="max-h-80 w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-royal-gold/25 bg-royal-cream/35 px-4 py-10 text-center text-sm text-royal-brown/65">
                        {t("galleryEmptyHint")}
                      </div>
                    )}
                  </div>

                  {payload.guest ? (
                    <div className="rounded-2xl border border-royal-gold/25 bg-white/90 p-4 shadow-sm ring-1 ring-white/25 backdrop-blur-sm">
                      <RsvpForm
                        invitationSlug={payload.invitation.slug}
                        guestSlug={payload.guest.guestSlug}
                        initialStatus={payload.guest.attendanceStatus}
                        initialCompanionsCount={payload.guest.companionsCount}
                        onRsvpSuccess={() =>
                          setConfettiBurst((previous) => previous + 1)
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <footer
                className={`flex flex-col items-center justify-between gap-4 border-t border-royal-gold/15 pt-8 sm:flex-row ${
                  payload.guest ? "mt-10" : "mt-14 sm:mt-16"
                }`}
              >
                <p className="text-center text-xs text-royal-brown/55 sm:text-start">
                  {t("madeWithVowlink")}
                </p>
                <InvitationShareButton />
              </footer>
            </div>
          </InvitationDetailCard>
        </section>
      </main>
      {galleryLightboxIndex !== null && galleryUrls.length > 0 ? (
        <InvitationGalleryLightbox
          urls={galleryUrls.slice(0, 12)}
          index={galleryLightboxIndex}
          onClose={() => setGalleryLightboxIndex(null)}
          onNavigate={setGalleryLightboxIndex}
        />
      ) : null}
    </div>
  );
}

/** Full-page cream layer; cover photo is shown in {@link InvitationDetailCard}'s hero strip. */
function InvitationBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-royal-cream" />
      <InvitationNoise className="opacity-[0.08]" />
      <InvitationParticles />
    </div>
  );
}

function InvitationDetailCard({
  coverUrl,
  className = "",
  children,
}: {
  coverUrl?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hasCover = Boolean(coverUrl?.trim());

  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-royal-gold/40 shadow-[0_20px_50px_-12px_rgba(75,54,33,0.18)] ${
        hasCover ? "bg-royal-cream/40" : "bg-white/75 backdrop-blur-md"
      } ${className}`}
    >
      {hasCover ? (
        <div className="relative w-full min-h-[200px] h-[min(38vh,320px)] max-h-[400px] sm:min-h-[240px] sm:h-[min(32vh,360px)]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverUrl})` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-royal-cream"
            aria-hidden
          />
        </div>
      ) : null}

      <div
        className={`relative ${
          hasCover
            ? "border-t border-royal-gold/20 bg-gradient-to-b from-royal-cream/98 via-royal-cream/96 to-royal-cream"
            : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function EnvelopeReveal({ name }: { name: string }) {
  return (
    <div className="relative h-[220px] w-[320px] max-w-full">
      {/* Shadow */}
      <div className="absolute left-1/2 top-[168px] h-6 w-[260px] -translate-x-1/2 rounded-full bg-royal-brown/10 blur-[1px]" />

      {/* Envelope body */}
      <div className="absolute left-1/2 top-[70px] h-[130px] w-[300px] -translate-x-1/2 rounded-3xl border border-royal-gold/35 bg-white shadow-md">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(255,255,255,0.75),rgba(75,54,33,0.06))]" />
          {/* Diagonal folds */}
          <div className="absolute left-0 top-0 h-full w-full">
            <div className="absolute left-0 top-0 h-full w-1/2 origin-left rotate-[10deg] bg-royal-gold/10" />
            <div className="absolute right-0 top-0 h-full w-1/2 origin-right -rotate-[10deg] bg-royal-gold/10" />
          </div>
        </div>

        {/* Bottom flap */}
        <div className="absolute bottom-0 left-0 h-0 w-0 border-l-[150px] border-r-[150px] border-t-[78px] border-l-transparent border-r-transparent border-t-royal-gold/15" />
      </div>

      {/* Top flap */}
      <div className="absolute left-1/2 top-[58px] h-0 w-0 -translate-x-1/2 border-l-[150px] border-r-[150px] border-b-[86px] border-l-transparent border-r-transparent border-b-royal-gold/25" />

      {/* Card (paper) */}
      <div className="absolute left-1/2 top-[18px] w-[270px] -translate-x-1/2 animate-[vow_cardRise_3s_ease-in-out_1] rounded-2xl border border-royal-gold/25 bg-white px-5 py-4 shadow-lg">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-royal-gold/90">
          LUXECARD
        </p>
        <p className="mt-2 text-center text-lg font-semibold text-royal-brown">
          {name}
        </p>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-full rounded-full bg-royal-brown/10" />
          <div className="h-2 w-5/6 rounded-full bg-royal-brown/10" />
          <div className="h-2 w-2/3 rounded-full bg-royal-brown/10" />
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="h-9 w-9 rounded-full bg-royal-gold/25 ring-2 ring-royal-gold/25" />
        </div>
      </div>

      <style jsx>{`
        @keyframes vow_cardRise {
          0% {
            transform: translate(-50%, 58px);
            opacity: 0.0;
          }
          20% {
            opacity: 1;
          }
          55% {
            transform: translate(-50%, 0px);
          }
          100% {
            transform: translate(-50%, 0px);
          }
        }
      `}</style>
    </div>
  );
}
