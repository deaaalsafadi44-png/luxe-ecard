"use client";

import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RsvpForm } from "@/components/RsvpForm";
import { InvitationConfetti } from "@/components/invitation/InvitationConfetti";
import { InvitationGalleryLightbox } from "@/components/invitation/InvitationGalleryLightbox";
import type { InvitationViewPayload } from "@/lib/apiClient";
import type { InvitationExperience } from "@/lib/invitationExperience";
import {
  resolveBackgroundImageUrls,
  resolveGuestWelcomeMessage,
  shouldShowVideoBackground,
} from "@/lib/invitationExperience";
import {
  bodyFontClass,
  bodySizePx,
  headingFontClass,
  headingSizePx,
  mergeSlideLayout,
  storiesSlideOuterClass,
  storyBodyStyle,
  storyHeadingStyle,
} from "@/lib/storiesSlideLayout";
import { useI18n } from "@/lib/i18n";

import "swiper/css";
import "swiper/css/pagination";

import { CrossfadeBackground } from "./CrossfadeBackground";

function BackgroundVideo({ url }: { url: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** MP4 is often used for music-only exports; browsers need `<video>` for reliable playback. */
function isMp4MusicUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return /\.mp4$/i.test(path);
  } catch {
    return /\.mp4(\?|#|$)/i.test(url);
  }
}

function SwipeHint({ label }: { label: string }) {
  return (
    <div className="mt-auto flex flex-col items-center gap-1 pb-8 pt-6 text-white/90">
      <span className="text-xl tracking-[0.35em]" aria-hidden>
        ‹‹‹
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">
        {label}
      </span>
    </div>
  );
}

function ghostButton(
  children: React.ReactNode,
  onClick?: () => void,
  href?: string,
  className = "",
) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 px-6 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20";
  const classNameMerged = className ? `${base} ${className}` : base;
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classNameMerged}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classNameMerged}>
      {children}
    </button>
  );
}

export function StoriesInvitationView({
  payload,
  themeStyle,
  mapsExternalUrl,
  experience,
  onRsvpSuccess,
}: {
  payload: InvitationViewPayload;
  themeStyle: CSSProperties;
  mapsExternalUrl: string;
  experience: InvitationExperience;
  onRsvpSuccess: () => void;
}) {
  const { t, isArabic } = useI18n();
  const [entered, setEntered] = useState(false);
  const [introPressing, setIntroPressing] = useState(false);
  /** Mirrors media element `.muted` for button icon */
  const [musicMuted, setMusicMuted] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const musicMediaRef = useRef<HTMLMediaElement | null>(null);

  const inv = payload.invitation;
  const localizedInvitation = {
    ...inv,
    coupleNames: !isArabic && inv.coupleNamesEn?.trim() ? inv.coupleNamesEn : inv.coupleNames,
    venueName: !isArabic && inv.venueNameEn?.trim() ? inv.venueNameEn : inv.venueName,
    venueAddress: !isArabic && inv.venueAddressEn?.trim()
      ? inv.venueAddressEn
      : inv.venueAddress,
  };

  const localizedExperience: InvitationExperience = isArabic
    ? experience
    : {
        ...experience,
        openingVerse: experience.openingVerseEn ?? experience.openingVerse,
        openingVerseCitation:
          experience.openingVerseCitationEn ?? experience.openingVerseCitation,
        togetherLine: experience.togetherLineEn ?? experience.togetherLine,
        parentsLeft: experience.parentsLeftEn ?? experience.parentsLeft,
        parentsRight: experience.parentsRightEn ?? experience.parentsRight,
        invitationParagraph:
          experience.invitationParagraphEn ?? experience.invitationParagraph,
        hostFamilyLine: experience.hostFamilyLineEn ?? experience.hostFamilyLine,
        countdownTagline: experience.countdownTaglineEn ?? experience.countdownTagline,
        polaroidCaption: experience.polaroidCaptionEn ?? experience.polaroidCaption,
        galleryInviteMessage:
          experience.galleryInviteMessageEn ?? experience.galleryInviteMessage,
        ceremonySlideTitle:
          experience.ceremonySlideTitleEn ?? experience.ceremonySlideTitle,
        giftRegistryTitle:
          experience.giftRegistryTitleEn ?? experience.giftRegistryTitle,
        giftRegistryBody: experience.giftRegistryBodyEn ?? experience.giftRegistryBody,
        rsvpIntroHeading: experience.rsvpIntroHeadingEn ?? experience.rsvpIntroHeading,
        rsvpDeadlineText: experience.rsvpDeadlineTextEn ?? experience.rsvpDeadlineText,
        guestWelcomeMessageTemplate:
          experience.guestWelcomeMessageTemplateEn ??
          experience.guestWelcomeMessageTemplate,
      };

  const coverUrl = localizedInvitation.coverPhotoUrl?.trim();
  const galleryUrls = payload.invitation.galleryPhotoUrls ?? [];
  const guestName = payload.guest?.guestName?.trim();
  const guestGreeting = guestName
    ? resolveGuestWelcomeMessage(
        localizedExperience.guestWelcomeMessageTemplate,
        guestName,
        t("welcome"),
      )
    : "";
  const bgUrls = useMemo(
    () => resolveBackgroundImageUrls(localizedExperience, coverUrl),
    [localizedExperience, coverUrl],
  );
  const polaroidSrc = coverUrl || galleryUrls[0];
  const musicUrl = localizedExperience.backgroundMusicUrl?.trim();

  const handleEnter = () => {
    setEntered(true);
    const m = musicMediaRef.current;
    if (m && musicUrl) {
      m.muted = false;
      m.volume = 0.45;
      void m.play().catch(() => {
        setMusicMuted(true);
      });
      setMusicMuted(false);
    }
  };

  const handleIntroOverlayClick = () => {
    if (entered || introPressing) return;
    setIntroPressing(true);
    setConfettiBurst((c) => c + 1);
    window.setTimeout(() => {
      handleEnter();
    }, 420);
  };

  const toggleMusicMute = () => {
    const m = musicMediaRef.current;
    if (!m || !musicUrl || !entered) return;
    m.muted = !m.muted;
    setMusicMuted(m.muted);
  };

  const weddingWhen = useMemo(() => {
    const d = new Date(payload.invitation.weddingDate);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(isArabic ? "ar" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [payload.invitation.weddingDate, isArabic]);

  const ceremonyTitle =
    localizedExperience.ceremonySlideTitle?.trim() || t("storiesCeremonyDefaultTitle");

  const showGift =
    Boolean(localizedExperience.showGiftSlide) &&
    Boolean(localizedExperience.giftRegistryBody?.trim());

  const L = {
    opening: mergeSlideLayout("opening", localizedExperience.slideLayouts),
    countdown: mergeSlideLayout("countdown", localizedExperience.slideLayouts),
    ceremony: mergeSlideLayout("ceremony", localizedExperience.slideLayouts),
    polaroid: mergeSlideLayout("polaroid", localizedExperience.slideLayouts),
    rsvp: mergeSlideLayout("rsvp", localizedExperience.slideLayouts),
    gift: mergeSlideLayout("gift", localizedExperience.slideLayouts),
  };

  const headingStyleFor = (layout: typeof L.opening): CSSProperties => ({
    ...storyHeadingStyle(layout.headingColor),
    fontSize: `${headingSizePx(layout)}px`,
    lineHeight: 1.12,
  });

  const bodyStyleFor = (layout: typeof L.opening): CSSProperties => ({
    ...storyBodyStyle(layout.bodyColor),
    fontSize: `${bodySizePx(layout)}px`,
    lineHeight: 1.7,
  });

  return (
    <div className="min-h-dvh text-white" style={themeStyle}>
      <InvitationConfetti burst={confettiBurst} />
      {shouldShowVideoBackground(localizedExperience) ? (
        <BackgroundVideo url={localizedExperience.backgroundVideoUrl!} />
      ) : (
        <CrossfadeBackground urls={bgUrls} />
      )}

      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/35 to-black/55"
        aria-hidden
      />

      {musicUrl ? (
        isMp4MusicUrl(musicUrl) ? (
          <video
            ref={(el) => {
              musicMediaRef.current = el;
            }}
            src={musicUrl}
            loop
            playsInline
            preload="auto"
            className="pointer-events-none fixed h-px w-px opacity-0"
            aria-hidden
          />
        ) : (
          <audio
            ref={(el) => {
              musicMediaRef.current = el;
            }}
            src={musicUrl}
            loop
            preload="auto"
          />
        )
      ) : null}

      <button
        type="button"
        className="fixed start-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[40] flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/40 text-lg text-white shadow-lg backdrop-blur-md transition hover:bg-black/55 disabled:opacity-40"
        onClick={() => toggleMusicMute()}
        disabled={!musicUrl || !entered}
        aria-label={musicMuted ? t("storiesPlayMusic") : t("storiesMute")}
        title={musicMuted ? t("storiesPlayMusic") : t("storiesMute")}
      >
        {musicMuted ? "♪" : "♫"}
      </button>

      {!entered ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] flex flex-col items-center justify-center gap-4 bg-black/50 px-6 text-center text-white backdrop-blur-[2px]"
          onClick={() => handleIntroOverlayClick()}
          aria-label={t("storiesTapToEnter")}
        >
          <p className="max-w-sm text-balance text-lg font-semibold [font-family:var(--font-invitation-display),sans-serif]">
            {localizedInvitation.coupleNames}
          </p>
          <span className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center" aria-hidden>
            {introPressing ? (
              <>
                <span className="stories-invite-heart--ring pointer-events-none absolute h-[4.25rem] w-[4.25rem] rounded-full border-2 border-rose-200/75" />
                <span className="stories-invite-heart--ring stories-invite-heart--ring-delay pointer-events-none absolute h-[4.25rem] w-[4.25rem] rounded-full border-2 border-white/55" />
              </>
            ) : null}
            <span
              className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/90 bg-white/20 shadow-[0_0_22px_rgba(251,113,133,0.35)] backdrop-blur-sm transition hover:bg-white/25 ${introPressing ? "stories-invite-heart--pop" : ""}`}
            >
              <svg
                className="h-9 w-9 text-rose-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
          </span>
          {musicUrl ? (
            <p className="max-w-xs text-xs text-white/80">{t("storiesMusicAutoplayHint")}</p>
          ) : null}
        </button>
      ) : null}

      <div className="relative z-[10] min-h-dvh">
        <Swiper
          dir="ltr"
          modules={[Pagination]}
          pagination={{ clickable: true }}
          className="stories-swiper min-h-dvh w-full !pb-14"
          spaceBetween={0}
          slidesPerView={1}
        >
          <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3.5rem,env(safe-area-inset-top))]">
            <div className={storiesSlideOuterClass(L.opening)}>
              {localizedExperience.openingVerse?.trim() ? (
                <p
                  className={`max-w-md text-pretty ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/95" : ""}`}
                  style={bodyStyleFor(L.opening)}
                >
                  {localizedExperience.openingVerse}
                </p>
              ) : null}
              {localizedExperience.openingVerseCitation?.trim() ? (
                <p
                  className={`mt-2 ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/70" : ""}`}
                  style={{ ...bodyStyleFor(L.opening), opacity: L.opening.bodyColor ? 1 : 0.78 }}
                >
                  {localizedExperience.openingVerseCitation}
                </p>
              ) : null}
              {localizedExperience.togetherLine?.trim() ? (
                <p
                  className={`mt-6 font-medium ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/90" : ""}`}
                  style={bodyStyleFor(L.opening)}
                >
                  {localizedExperience.togetherLine}
                </p>
              ) : null}
              <h1
                className={`mt-4 max-w-[95vw] text-balance font-semibold ${headingFontClass(L.opening.headingFont)} ${!L.opening.headingColor ? "text-white" : ""}`}
                style={headingStyleFor(L.opening)}
              >
                {localizedInvitation.coupleNames}
              </h1>
              {guestGreeting ? (
                <p
                  className={`mt-4 max-w-lg text-pretty font-medium ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/95" : ""}`}
                  style={bodyStyleFor(L.opening)}
                >
                  {guestGreeting}
                </p>
              ) : null}
              {(localizedExperience.parentsLeft?.trim() ||
                localizedExperience.parentsRight?.trim()) && (
                <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                  {localizedExperience.parentsLeft?.trim() ? (
                    <p
                      className={`text-pretty ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/85" : ""}`}
                      style={bodyStyleFor(L.opening)}
                    >
                      {localizedExperience.parentsLeft}
                    </p>
                  ) : (
                    <span />
                  )}
                  {localizedExperience.parentsRight?.trim() ? (
                    <p
                      className={`text-pretty ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/85" : ""}`}
                      style={bodyStyleFor(L.opening)}
                    >
                      {localizedExperience.parentsRight}
                    </p>
                  ) : (
                    <span />
                  )}
                </div>
              )}
              {localizedExperience.invitationParagraph?.trim() ? (
                <p
                  className={`mt-6 max-w-lg text-pretty ${bodyFontClass(L.opening.bodyFont)} ${!L.opening.bodyColor ? "text-white/90" : ""}`}
                  style={bodyStyleFor(L.opening)}
                >
                  {localizedExperience.invitationParagraph}
                </p>
              ) : null}
              {localizedExperience.hostFamilyLine?.trim() ? (
                <p
                  className={`mt-4 font-semibold ${headingFontClass(L.opening.headingFont)} ${!L.opening.headingColor ? "text-white" : ""}`}
                  style={headingStyleFor(L.opening)}
                >
                  {localizedExperience.hostFamilyLine}
                </p>
              ) : null}
            </div>
            <SwipeHint label={t("storiesSwipeHint")} />
          </SwiperSlide>

          <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))]">
            <div className={storiesSlideOuterClass(L.countdown)}>
              <div className="flex w-full max-w-md flex-col">
                <p
                  className={`mb-4 uppercase tracking-[0.35em] ${bodyFontClass(L.countdown.bodyFont)} ${!L.countdown.bodyColor ? "text-white/80" : ""}`}
                  style={{ ...bodyStyleFor(L.countdown), fontSize: `${Math.max(11, Math.round(bodySizePx(L.countdown) * 0.82))}px`, letterSpacing: "0.28em" }}
                >
                  {localizedExperience.countdownTagline?.trim() ||
                    t("storiesWeddingDateDefault")}
                </p>
                <CountdownTimer weddingDate={payload.invitation.weddingDate} />
              </div>
            </div>
            <SwipeHint label={t("storiesSwipeHint")} />
          </SwiperSlide>

          <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))]">
            <div className={storiesSlideOuterClass(L.ceremony)}>
              <h2
                className={`${headingFontClass(L.ceremony.headingFont)} ${!L.ceremony.headingColor ? "text-white" : ""}`}
                style={headingStyleFor(L.ceremony)}
              >
                {ceremonyTitle}
              </h2>
              <p
                className={`mt-6 max-w-md text-pretty ${bodyFontClass(L.ceremony.bodyFont)} ${!L.ceremony.bodyColor ? "text-white/90" : ""}`}
                style={bodyStyleFor(L.ceremony)}
              >
                {weddingWhen}
              </p>
              {payload.invitation.venueName?.trim() ? (
                <p
                  className={`mt-6 max-w-md text-pretty font-semibold ${bodyFontClass(L.ceremony.bodyFont)} ${!L.ceremony.bodyColor ? "text-white" : ""}`}
                  style={bodyStyleFor(L.ceremony)}
                >
                  {payload.invitation.venueName}
                </p>
              ) : null}
              {payload.invitation.venueAddress?.trim() ? (
                <p
                  className={`mt-2 max-w-md text-pretty ${bodyFontClass(L.ceremony.bodyFont)} ${!L.ceremony.bodyColor ? "text-white/85" : ""}`}
                  style={bodyStyleFor(L.ceremony)}
                >
                  {payload.invitation.venueAddress}
                </p>
              ) : null}
              <div className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {ghostButton(
                  t("storiesOpenLocationOnMaps"),
                  undefined,
                  mapsExternalUrl,
                  "min-h-12 border-white/95 bg-white/20 px-8 text-base font-semibold",
                )}
              </div>
            </div>
            <SwipeHint label={t("storiesSwipeHint")} />
          </SwiperSlide>

          <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))]">
            <div className="flex flex-1 flex-col items-center">
              <div className="w-full max-w-sm rotate-[-1.5deg] rounded-sm bg-white p-3 pb-8 shadow-2xl ring-1 ring-black/10">
                {polaroidSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={polaroidSrc}
                    alt=""
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-200 text-neutral-500">
                    {t("storiesPolaroidPlaceholder")}
                  </div>
                )}
                <p className="mt-4 text-center text-lg font-medium text-neutral-800 [font-family:var(--font-invitation-display),cursive,serif]">
                  {localizedExperience.polaroidCaption?.trim() ||
                    t("storiesPolaroidDefaultCaption")}
                </p>
              </div>
              {localizedExperience.galleryInviteMessage?.trim() ? (
                <p className="mt-8 max-w-md text-center text-pretty text-white/90" style={bodyStyleFor(L.polaroid)}>
                  {localizedExperience.galleryInviteMessage}
                </p>
              ) : null}
              {galleryUrls.length > 0 ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {ghostButton(t("storiesViewGallery"), () =>
                    setGalleryIndex(0),
                  )}
                </div>
              ) : null}
            </div>
            <SwipeHint label={t("storiesSwipeHint")} />
          </SwiperSlide>

          <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))]">
            <div className={storiesSlideOuterClass(L.rsvp)}>
              <h2
                className={`${headingFontClass(L.rsvp.headingFont)} ${!L.rsvp.headingColor ? "text-white" : ""}`}
                style={headingStyleFor(L.rsvp)}
              >
                {localizedExperience.rsvpIntroHeading?.trim() || t("storiesBeOurGuest")}
              </h2>
              {localizedExperience.rsvpDeadlineText?.trim() ? (
                <p
                  className={`mt-4 max-w-md ${bodyFontClass(L.rsvp.bodyFont)} ${!L.rsvp.bodyColor ? "text-white/85" : ""}`}
                  style={bodyStyleFor(L.rsvp)}
                >
                  {localizedExperience.rsvpDeadlineText}
                </p>
              ) : null}
              {payload.guest ? (
                <div className="mt-8 w-full max-w-md rounded-2xl border border-white/25 bg-black/25 p-4 backdrop-blur-md">
                  <RsvpForm
                    invitationSlug={payload.invitation.slug}
                    guestSlug={payload.guest.guestSlug}
                    initialStatus={payload.guest.attendanceStatus}
                    onRsvpSuccess={() => {
                      setConfettiBurst((c) => c + 1);
                      onRsvpSuccess();
                    }}
                  />
                </div>
              ) : (
                <p
                  className={`mt-8 max-w-md text-pretty ${bodyFontClass(L.rsvp.bodyFont)} ${!L.rsvp.bodyColor ? "text-white/80" : ""}`}
                  style={bodyStyleFor(L.rsvp)}
                >
                  {t("storiesRsvpPublicHint")}
                </p>
              )}
            </div>
            <SwipeHint label={t("storiesSwipeHint")} />
          </SwiperSlide>

          {showGift ? (
            <SwiperSlide className="!flex min-h-dvh flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))]">
              <div className={storiesSlideOuterClass(L.gift)}>
                <h2
                  className={`${headingFontClass(L.gift.headingFont)} ${!L.gift.headingColor ? "text-white" : ""}`}
                  style={headingStyleFor(L.gift)}
                >
                  {localizedExperience.giftRegistryTitle?.trim() ||
                    t("storiesGiftRegistryDefault")}
                </h2>
                {localizedExperience.giftRegistryImageUrl?.trim() ? (
                  <div className="mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-lg backdrop-blur-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded asset URL */}
                    <img
                      src={localizedExperience.giftRegistryImageUrl}
                      alt=""
                      className="h-56 w-full object-cover sm:h-64"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div
                  className={`mt-8 max-w-lg whitespace-pre-wrap text-pretty ${bodyFontClass(L.gift.bodyFont)} ${!L.gift.bodyColor ? "text-white/90" : ""}`}
                  style={bodyStyleFor(L.gift)}
                >
                  {localizedExperience.giftRegistryBody}
                </div>
              </div>
              <SwipeHint label={t("storiesSwipeHint")} />
            </SwiperSlide>
          ) : null}
        </Swiper>
      </div>

      <p className="pointer-events-none fixed bottom-2 start-0 end-0 z-[15] text-center text-[10px] text-white/50">
        {t("storiesPoweredBy")}
      </p>

      {galleryIndex !== null && galleryUrls.length > 0 ? (
        <InvitationGalleryLightbox
          urls={galleryUrls.slice(0, 12)}
          index={galleryIndex}
          onClose={() => setGalleryIndex(null)}
          onNavigate={setGalleryIndex}
        />
      ) : null}
    </div>
  );
}
