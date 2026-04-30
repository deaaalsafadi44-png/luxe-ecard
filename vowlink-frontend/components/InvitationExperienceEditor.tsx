"use client";

import type { CSSProperties } from "react";
import { UploadThingButton } from "@/components/UploadThingButton";
import { ExperienceBackgroundUploadField } from "@/components/ExperienceBackgroundUploadField";
import type { InvitationExperience, PresentationMode } from "@/lib/invitationExperience";
import type {
  StoriesFontPreset,
  StoriesSlideId,
  StoriesSlideLayoutSettings,
  StoriesTextAlign,
  StoriesVerticalAlign,
} from "@/lib/storiesSlideLayout";
import { bodyFontClass, headingFontClass } from "@/lib/storiesSlideLayout";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type ClientFile = { ufsUrl?: string; url?: string };

function fileUrl(file: ClientFile | undefined): string | undefined {
  if (!file) return undefined;
  if ("ufsUrl" in file && file.ufsUrl) return String(file.ufsUrl);
  if ("url" in file && file.url) return String(file.url);
  return undefined;
}

function SlideLayoutFields({
  layout,
  onPatch,
}: {
  layout: StoriesSlideLayoutSettings | undefined;
  onPatch: (p: Partial<StoriesSlideLayoutSettings>) => void;
}) {
  const { t } = useI18n();
  const v = layout ?? {};

  const alignVal = (x: StoriesTextAlign | undefined) => x ?? "";
  const vertVal = (x: StoriesVerticalAlign | undefined) => x ?? "";
  const fontVal = (x: StoriesFontPreset | undefined) => x ?? "";

  const parsePx = (raw: string): number | undefined => {
    const cleaned = raw.trim();
    if (!cleaned) return undefined;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return undefined;
    const rounded = Math.round(n);
    if (rounded <= 0) return undefined;
    return rounded;
  };

  const palette = [
    "#ffffff",
    "#f5f5f5",
    "#f5f5dc",
    "#d4af37",
    "#4b3621",
    "#0f172a",
    "#111827",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
  ];

  const ColorPalette = ({
    value,
    onChange,
    label,
  }: {
    value: string | undefined;
    onChange: (next: string | undefined) => void;
    label: string;
  }) => (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-royal-brown/90">{label}</span>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-[11px] text-royal-brown/80 hover:bg-royal-cream"
          onClick={() => onChange(undefined)}
        >
          {t("storiesLayoutUseDefault")}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={value?.trim() || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border bg-white p-1"
          aria-label={label}
        />
        <div className="flex flex-wrap gap-2">
          {palette.map((c) => {
            const active = (value ?? "").toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                className={`h-8 w-8 rounded-md border transition ${
                  active ? "ring-2 ring-royal-gold/70" : "hover:scale-[1.03]"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
                aria-label={c}
                title={c}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  const textAlign = (v.textAlign ?? "center") as CSSProperties["textAlign"];
  const headingPreviewStyle: CSSProperties = {
    color: v.headingColor ?? "#4b3621",
    fontSize: `${v.headingSizePx ?? 40}px`,
    lineHeight: 1.12,
  };
  const bodyPreviewStyle: CSSProperties = {
    color: v.bodyColor ?? "#4b3621",
    fontSize: `${v.bodySizePx ?? 16}px`,
    lineHeight: 1.6,
  };
  const previewJustify =
    v.verticalAlign === "start"
      ? "justify-start"
      : v.verticalAlign === "end"
        ? "justify-end"
        : "justify-center";

  function SlideFontPreview({
    dir,
    headingText,
    bodyText,
  }: {
    dir: "rtl" | "ltr";
    headingText: string;
    bodyText: string;
  }) {
    return (
      <div
        className={`flex min-h-[5.5rem] flex-col ${previewJustify} space-y-2`}
        style={{ textAlign, direction: dir }}
      >
        <p className={`font-semibold ${headingFontClass(v.headingFont)}`} style={headingPreviewStyle}>
          {headingText}
        </p>
        <p className={`text-pretty ${bodyFontClass(v.bodyFont)}`} style={bodyPreviewStyle}>
          {bodyText}
        </p>
      </div>
    );
  }

  return (
    <details className="mt-3 rounded-lg border border-royal-gold/20 bg-white/70 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-royal-brown">
        {t("storiesSlideLayoutTitle")}
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutHorizontal")}</span>
          <select
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            value={alignVal(v.textAlign)}
            onChange={(e) => {
              const val = e.target.value;
              onPatch({
                textAlign: val === "" ? undefined : (val as StoriesTextAlign),
              });
            }}
          >
            <option value="">{t("storiesLayoutUseDefault")}</option>
            <option value="center">{t("storiesOptCenter")}</option>
            <option value="start">{t("storiesOptStart")}</option>
            <option value="end">{t("storiesOptEnd")}</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutVertical")}</span>
          <select
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            value={vertVal(v.verticalAlign)}
            onChange={(e) => {
              const val = e.target.value;
              onPatch({
                verticalAlign: val === "" ? undefined : (val as StoriesVerticalAlign),
              });
            }}
          >
            <option value="">{t("storiesLayoutUseDefault")}</option>
            <option value="start">{t("storiesOptStart")}</option>
            <option value="center">{t("storiesOptCenter")}</option>
            <option value="end">{t("storiesOptEnd")}</option>
          </select>
        </label>
        <ColorPalette
          value={v.headingColor}
          onChange={(next) => onPatch({ headingColor: next })}
          label={t("storiesLayoutHeadingColor")}
        />
        <ColorPalette
          value={v.bodyColor}
          onChange={(next) => onPatch({ bodyColor: next })}
          label={t("storiesLayoutBodyColor")}
        />
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutHeadingFont")}</span>
          <select
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            value={fontVal(v.headingFont)}
            onChange={(e) => {
              const val = e.target.value;
              onPatch({
                headingFont: val === "" ? undefined : (val as StoriesFontPreset),
              });
            }}
          >
            <option value="">{t("storiesLayoutUseDefault")}</option>
            <option value="display">{t("storiesFontDisplay")}</option>
            <option value="cairo">{t("storiesFontCairo")}</option>
            <option value="amiri">{t("storiesFontAmiri")}</option>
            <option value="playfair">{t("storiesFontPlayfair")}</option>
            <option value="cinzel">{t("storiesFontCinzel")}</option>
            <option value="poppins">{t("storiesFontPoppins")}</option>
            <option value="serif">{t("storiesFontSerif")}</option>
            <option value="sans">{t("storiesFontSans")}</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutBodyFont")}</span>
          <select
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            value={fontVal(v.bodyFont)}
            onChange={(e) => {
              const val = e.target.value;
              onPatch({
                bodyFont: val === "" ? undefined : (val as StoriesFontPreset),
              });
            }}
          >
            <option value="">{t("storiesLayoutUseDefault")}</option>
            <option value="display">{t("storiesFontDisplay")}</option>
            <option value="cairo">{t("storiesFontCairo")}</option>
            <option value="amiri">{t("storiesFontAmiri")}</option>
            <option value="playfair">{t("storiesFontPlayfair")}</option>
            <option value="cinzel">{t("storiesFontCinzel")}</option>
            <option value="poppins">{t("storiesFontPoppins")}</option>
            <option value="serif">{t("storiesFontSerif")}</option>
            <option value="sans">{t("storiesFontSans")}</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutHeadingSize")}</span>
          <input
            inputMode="numeric"
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            placeholder="مثال: 42"
            value={v.headingSizePx ?? ""}
            onChange={(e) => onPatch({ headingSizePx: parsePx(e.target.value) })}
          />
          <p className="text-[11px] text-royal-brown/65">{t("storiesSizePxHint")}</p>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-royal-brown/90">{t("storiesLayoutBodySize")}</span>
          <input
            inputMode="numeric"
            className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs"
            placeholder="مثال: 16"
            value={v.bodySizePx ?? ""}
            onChange={(e) => onPatch({ bodySizePx: parsePx(e.target.value) })}
          />
          <p className="text-[11px] text-royal-brown/65">{t("storiesSizePxHint")}</p>
        </label>
        <div className="sm:col-span-2 rounded-lg border border-royal-gold/15 bg-white/80 p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-royal-brown/70">
            {t("storiesLayoutPreview")}
          </p>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-royal-brown/65" dir="rtl">
                {t("storiesLayoutPreviewArabic")}
              </p>
              <SlideFontPreview
                dir="rtl"
                headingText={t("storiesLayoutPreviewHeadingAr")}
                bodyText={t("storiesLayoutPreviewBodyAr")}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-royal-brown/65" dir="ltr">
                {t("storiesLayoutPreviewEnglish")}
              </p>
              <SlideFontPreview
                dir="ltr"
                headingText={t("storiesLayoutPreviewHeadingEn")}
                bodyText={t("storiesLayoutPreviewBodyEn")}
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function SlideSection({
  titleKey,
  children,
}: {
  titleKey: TranslationKey;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section className="space-y-3 rounded-xl border border-royal-gold/30 bg-white/40 p-4">
      <h3 className="text-sm font-bold text-royal-brown">{t(titleKey)}</h3>
      {children}
    </section>
  );
}

export function InvitationExperienceEditor({
  presentationMode,
  onPresentationModeChange,
  experience,
  onExperienceChange,
}: {
  presentationMode: PresentationMode;
  onPresentationModeChange: (m: PresentationMode) => void;
  experience: InvitationExperience;
  onExperienceChange: (next: InvitationExperience) => void;
}) {
  const { t } = useI18n();

  const patch = (partial: Partial<InvitationExperience>) => {
    onExperienceChange({ ...experience, ...partial });
  };

  const patchSlideLayout = (
    slideId: StoriesSlideId,
    partial: Partial<StoriesSlideLayoutSettings>,
  ) => {
    patch({
      slideLayouts: {
        ...experience.slideLayouts,
        [slideId]: {
          ...experience.slideLayouts?.[slideId],
          ...partial,
        },
      },
    });
  };

  const effectiveBgMode: "slideshow" | "video" =
    experience.backgroundMediaMode ??
    (experience.backgroundVideoUrl?.trim() ? "video" : "slideshow");

  const fieldBilingual = (
    labelKeyAr: TranslationKey,
    labelKeyEn: TranslationKey,
    valueAr: string | undefined,
    valueEn: string | undefined,
    onPatchAr: (v: string) => void,
    onPatchEn: (v: string) => void,
    rows = 3,
  ) => (
    <div className="space-y-2 rounded-xl border border-royal-gold/15 bg-white/50 p-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-royal-brown">{t(labelKeyAr)}</span>
        <textarea
          dir="rtl"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          rows={rows}
          value={valueAr ?? ""}
          onChange={(e) => onPatchAr(e.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-royal-brown/85">{t(labelKeyEn)}</span>
        <textarea
          dir="ltr"
          className="w-full rounded-xl border border-royal-gold/20 bg-white px-3 py-2 text-sm"
          rows={rows}
          value={valueEn ?? ""}
          onChange={(e) => onPatchEn(e.target.value)}
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-4 rounded-xl border border-royal-gold/25 bg-royal-cream/20 p-4">
      <p className="text-sm font-semibold text-royal-brown">{t("storiesExperienceSection")}</p>
      {fieldBilingual(
        "guestWelcomeTemplateLabel",
        "guestWelcomeTemplateLabelEn",
        experience.guestWelcomeMessageTemplate,
        experience.guestWelcomeMessageTemplateEn,
        (v) => patch({ guestWelcomeMessageTemplate: v }),
        (v) => patch({ guestWelcomeMessageTemplateEn: v }),
        2,
      )}
      <p className="text-xs text-royal-brown/70">{t("guestWelcomeTemplateHelp")}</p>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("storiesPresentationMode")}</label>
        <select
          className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
          value={presentationMode}
          onChange={(e) =>
            onPresentationModeChange(e.target.value as PresentationMode)
          }
        >
          <option value="classic">{t("storiesModeClassic")}</option>
          <option value="stories">{t("storiesModeStories")}</option>
        </select>
      </div>

      {presentationMode === "stories" ? (
        <div className="space-y-4">
          <SlideSection titleKey="storiesSlideGlobalSettings">
            <div className="space-y-3 rounded-xl border border-royal-gold/20 bg-white p-3 sm:p-4">
              <p className="text-sm font-medium">{t("storiesBgModeTitle")}</p>
              <label className="flex items-center gap-2 text-sm text-royal-brown">
                <input
                  type="radio"
                  name="bg-mode"
                  checked={effectiveBgMode === "slideshow"}
                  onChange={() =>
                    patch({ backgroundMediaMode: "slideshow", backgroundVideoUrl: undefined })
                  }
                />
                <span>{t("storiesBgModeImages")}</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-royal-brown">
                <input
                  type="radio"
                  name="bg-mode"
                  checked={effectiveBgMode === "video"}
                  onChange={() => patch({ backgroundMediaMode: "video" })}
                />
                <span>{t("storiesBgModeVideo")}</span>
              </label>
              <p className="text-xs text-royal-brown/70">{t("storiesBgModeHint")}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">{t("storiesBgPhotosLabel")}</p>
              {effectiveBgMode === "slideshow" ? (
                <ExperienceBackgroundUploadField
                  urls={experience.backgroundImageUrls}
                  onUrlsChange={(next) => patch({ backgroundImageUrls: next })}
                  onUploadError={() => {}}
                />
              ) : (
                <p className="text-xs text-royal-brown/70">{t("storiesBgImagesDisabledByVideo")}</p>
              )}
              <p className="mt-2 text-xs text-royal-brown/70">{t("storiesBgFallbackHint")}</p>
            </div>

            {effectiveBgMode === "video" ? (
              <div>
                <p className="mb-1 text-sm font-medium">{t("storiesBgVideoTitle")}</p>
                <p className="mb-2 text-xs text-royal-brown/70">{t("storiesBgVideoHelp")}</p>
                {experience.backgroundVideoUrl?.trim() ? (
                  <div className="space-y-2 rounded-xl border border-royal-gold/20 bg-white p-3">
                    <video
                      src={experience.backgroundVideoUrl}
                      className="h-40 w-full rounded-lg object-cover"
                      muted
                      playsInline
                      controls
                    />
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                      onClick={() =>
                        patch({ backgroundVideoUrl: "", backgroundMediaMode: "video" })
                      }
                    >
                      {t("remove")}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-royal-gold/20 bg-white p-3">
                    <UploadThingButton
                      endpoint="experienceBgVideo"
                      className="w-full max-w-full !flex-col !items-stretch [&_[data-ut-element=button]]:!w-full"
                      appearance={{
                        button:
                          "flex min-h-10 w-full cursor-pointer rounded-xl border border-royal-gold/50 bg-royal-cream px-3 py-2 text-xs font-semibold text-royal-brown",
                      }}
                      content={{
                        button: ({ isUploading }) =>
                          isUploading ? t("saving") : t("storiesUploadBgVideo"),
                      }}
                      onClientUploadComplete={(files) => {
                        const f = files?.[0] as ClientFile | undefined;
                        const url = fileUrl(f);
                        if (url) patch({ backgroundVideoUrl: url, backgroundMediaMode: "video" });
                      }}
                      onUploadError={() => {}}
                    />
                  </div>
                )}
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-sm font-medium">{t("storiesMusicFromDevice")}</p>
              <p className="mb-2 text-xs text-royal-brown/70">{t("storiesMusicUploadHelp")}</p>
              {experience.backgroundMusicUrl?.trim() ? (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-royal-brown/80">{t("storiesUploadMusic")}</span>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                    onClick={() => patch({ backgroundMusicUrl: "" })}
                  >
                    {t("storiesRemoveMusic")}
                  </button>
                </div>
              ) : null}
              <div className="rounded-xl border border-royal-gold/20 bg-white p-3">
                <UploadThingButton
                  endpoint="invitationAudio"
                  className="w-full max-w-full !flex-col !items-stretch [&_[data-ut-element=button]]:!w-full"
                  appearance={{
                    button:
                      "flex min-h-10 w-full cursor-pointer rounded-xl border border-royal-gold/50 bg-royal-cream px-3 py-2 text-xs font-semibold text-royal-brown",
                  }}
                  content={{
                    button: ({ isUploading }) =>
                      isUploading ? t("saving") : t("storiesUploadMusic"),
                  }}
                  onClientUploadComplete={(files) => {
                    const f = files?.[0] as ClientFile | undefined;
                    const url = fileUrl(f);
                    if (url) patch({ backgroundMusicUrl: url });
                  }}
                  onUploadError={() => {}}
                />
              </div>
            </div>
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionOpening">
            <SlideLayoutFields
              layout={experience.slideLayouts?.opening}
              onPatch={(p) => patchSlideLayout("opening", p)}
            />
            {fieldBilingual(
              "storiesFieldOpeningVerse",
              "storiesFieldOpeningVerseEn",
              experience.openingVerse,
              experience.openingVerseEn,
              (v) => patch({ openingVerse: v }),
              (v) => patch({ openingVerseEn: v }),
            )}
            {fieldBilingual(
              "storiesFieldVerseCitation",
              "storiesFieldVerseCitationEn",
              experience.openingVerseCitation,
              experience.openingVerseCitationEn,
              (v) => patch({ openingVerseCitation: v }),
              (v) => patch({ openingVerseCitationEn: v }),
              1,
            )}
            {fieldBilingual(
              "storiesFieldTogetherLine",
              "storiesFieldTogetherLineEn",
              experience.togetherLine,
              experience.togetherLineEn,
              (v) => patch({ togetherLine: v }),
              (v) => patch({ togetherLineEn: v }),
              2,
            )}
            {fieldBilingual(
              "storiesFieldParentsLeft",
              "storiesFieldParentsLeftEn",
              experience.parentsLeft,
              experience.parentsLeftEn,
              (v) => patch({ parentsLeft: v }),
              (v) => patch({ parentsLeftEn: v }),
              2,
            )}
            {fieldBilingual(
              "storiesFieldParentsRight",
              "storiesFieldParentsRightEn",
              experience.parentsRight,
              experience.parentsRightEn,
              (v) => patch({ parentsRight: v }),
              (v) => patch({ parentsRightEn: v }),
              2,
            )}
            {fieldBilingual(
              "storiesFieldInvitationParagraph",
              "storiesFieldInvitationParagraphEn",
              experience.invitationParagraph,
              experience.invitationParagraphEn,
              (v) => patch({ invitationParagraph: v }),
              (v) => patch({ invitationParagraphEn: v }),
            )}
            {fieldBilingual(
              "storiesFieldHostFamily",
              "storiesFieldHostFamilyEn",
              experience.hostFamilyLine,
              experience.hostFamilyLineEn,
              (v) => patch({ hostFamilyLine: v }),
              (v) => patch({ hostFamilyLineEn: v }),
              2,
            )}
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionCountdown">
            <SlideLayoutFields
              layout={experience.slideLayouts?.countdown}
              onPatch={(p) => patchSlideLayout("countdown", p)}
            />
            {fieldBilingual(
              "storiesFieldCountdownTagline",
              "storiesFieldCountdownTaglineEn",
              experience.countdownTagline,
              experience.countdownTaglineEn,
              (v) => patch({ countdownTagline: v }),
              (v) => patch({ countdownTaglineEn: v }),
              2,
            )}
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionCeremony">
            <SlideLayoutFields
              layout={experience.slideLayouts?.ceremony}
              onPatch={(p) => patchSlideLayout("ceremony", p)}
            />
            {fieldBilingual(
              "storiesFieldCeremonyTitle",
              "storiesFieldCeremonyTitleEn",
              experience.ceremonySlideTitle,
              experience.ceremonySlideTitleEn,
              (v) => patch({ ceremonySlideTitle: v }),
              (v) => patch({ ceremonySlideTitleEn: v }),
              1,
            )}
            <p className="text-xs text-royal-brown/75">{t("storiesCeremonyVenueNote")}</p>
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionPolaroid">
            <SlideLayoutFields
              layout={experience.slideLayouts?.polaroid}
              onPatch={(p) => patchSlideLayout("polaroid", p)}
            />
            {fieldBilingual(
              "storiesFieldPolaroidCaption",
              "storiesFieldPolaroidCaptionEn",
              experience.polaroidCaption,
              experience.polaroidCaptionEn,
              (v) => patch({ polaroidCaption: v }),
              (v) => patch({ polaroidCaptionEn: v }),
              2,
            )}
            {fieldBilingual(
              "storiesFieldGalleryMessage",
              "storiesFieldGalleryMessageEn",
              experience.galleryInviteMessage,
              experience.galleryInviteMessageEn,
              (v) => patch({ galleryInviteMessage: v }),
              (v) => patch({ galleryInviteMessageEn: v }),
            )}
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionRsvp">
            <SlideLayoutFields
              layout={experience.slideLayouts?.rsvp}
              onPatch={(p) => patchSlideLayout("rsvp", p)}
            />
            {fieldBilingual(
              "storiesFieldRsvpHeading",
              "storiesFieldRsvpHeadingEn",
              experience.rsvpIntroHeading,
              experience.rsvpIntroHeadingEn,
              (v) => patch({ rsvpIntroHeading: v }),
              (v) => patch({ rsvpIntroHeadingEn: v }),
              1,
            )}
            {fieldBilingual(
              "storiesFieldRsvpDeadline",
              "storiesFieldRsvpDeadlineEn",
              experience.rsvpDeadlineText,
              experience.rsvpDeadlineTextEn,
              (v) => patch({ rsvpDeadlineText: v }),
              (v) => patch({ rsvpDeadlineTextEn: v }),
              2,
            )}
          </SlideSection>

          <SlideSection titleKey="storiesSlideSectionGift">
            <label className="flex items-center gap-2 text-sm text-royal-brown">
              <input
                type="checkbox"
                checked={Boolean(experience.showGiftSlide)}
                onChange={(e) => patch({ showGiftSlide: e.target.checked })}
              />
              <span>{t("storiesShowGiftSlide")}</span>
            </label>
            {experience.showGiftSlide ? (
              <>
                <SlideLayoutFields
                  layout={experience.slideLayouts?.gift}
                  onPatch={(p) => patchSlideLayout("gift", p)}
                />
                <div className="space-y-2 rounded-xl border border-royal-gold/20 bg-white p-3">
                  <p className="text-sm font-medium text-royal-brown">{t("storiesGiftImage")}</p>
                  {experience.giftRegistryImageUrl?.trim() ? (
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded asset URL */}
                      <img
                        src={experience.giftRegistryImageUrl}
                        alt=""
                        className="h-40 w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                        onClick={() => patch({ giftRegistryImageUrl: "" })}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  ) : (
                    <UploadThingButton
                      endpoint="invitationPhotos"
                      className="w-full max-w-full !flex-col !items-stretch [&_[data-ut-element=button]]:!w-full"
                      appearance={{
                        button:
                          "flex min-h-10 w-full cursor-pointer rounded-xl border border-royal-gold/50 bg-royal-cream px-3 py-2 text-xs font-semibold text-royal-brown",
                      }}
                      content={{
                        button: ({ isUploading }) =>
                          isUploading ? t("saving") : t("storiesUploadGiftImage"),
                      }}
                      onClientUploadComplete={(files) => {
                        const f = files?.[0] as ClientFile | undefined;
                        const url = fileUrl(f);
                        if (url) patch({ giftRegistryImageUrl: url });
                      }}
                      onUploadError={() => {}}
                    />
                  )}
                </div>
                {fieldBilingual(
                  "storiesFieldGiftTitle",
                  "storiesFieldGiftTitleEn",
                  experience.giftRegistryTitle,
                  experience.giftRegistryTitleEn,
                  (v) => patch({ giftRegistryTitle: v }),
                  (v) => patch({ giftRegistryTitleEn: v }),
                  1,
                )}
                {fieldBilingual(
                  "storiesFieldGiftBody",
                  "storiesFieldGiftBodyEn",
                  experience.giftRegistryBody,
                  experience.giftRegistryBodyEn,
                  (v) => patch({ giftRegistryBody: v }),
                  (v) => patch({ giftRegistryBodyEn: v }),
                  6,
                )}
              </>
            ) : null}
          </SlideSection>
        </div>
      ) : null}
    </div>
  );
}
