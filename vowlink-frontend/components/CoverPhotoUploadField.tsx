"use client";

import { UploadThingButton } from "@/components/UploadThingButton";
import { useI18n } from "@/lib/i18n";

type ClientFile = { ufsUrl?: string; url?: string };

function pickUrl(files: ClientFile[] | undefined): string | undefined {
  const firstFile = files?.[0];
  if (!firstFile) return undefined;
  if ("ufsUrl" in firstFile && firstFile.ufsUrl) return String(firstFile.ufsUrl);
  if ("url" in firstFile && firstFile.url) return String(firstFile.url);
  return undefined;
}

/**
 * Cover photo: mobile-friendly upload control, live preview, remove / replace.
 */
export function CoverPhotoUploadField({
  url,
  onUrlChange,
  onUploadError,
  /** When set (e.g. invitation already saved), persist cover URL to the server after upload/remove. */
  onPersist,
}: {
  url: string;
  onUrlChange: (next: string) => void;
  onUploadError: () => void;
  onPersist?: (next: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const hasImage = Boolean(url?.trim());

  return (
    <div className="space-y-3">
      {hasImage ? (
        <div className="overflow-hidden rounded-2xl border border-royal-gold/30 bg-royal-cream/40 shadow-sm">
          <div className="relative max-h-52 w-full sm:max-h-60">
            <img
              src={url}
              alt=""
              className="max-h-52 w-full object-cover object-center sm:max-h-60"
            />
          </div>
          <div className="flex flex-col gap-2 border-t border-royal-gold/20 bg-white/95 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-pretty text-xs text-royal-brown/75">{t("coverPhotoPreviewHint")}</p>
            <button
              type="button"
              className="min-h-11 w-full shrink-0 rounded-xl border border-red-200/80 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 active:bg-red-100 sm:min-h-0 sm:w-auto"
              onClick={() => {
                const previous = url;
                onUrlChange("");
                if (onPersist) {
                  void onPersist("").catch(() => {
                    onUrlChange(previous);
                  });
                }
              }}
            >
              {t("removeCoverPhoto")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-royal-gold/25 bg-white p-3 sm:p-4">
        <UploadThingButton
          endpoint="invitationPhotos"
          className="w-full max-w-full !flex-col !items-stretch !gap-2 [&_[data-ut-element=button]]:!h-auto [&_[data-ut-element=button]]:!w-full [&_[data-ut-element=button]]:!max-w-none"
          appearance={{
            container:
              "w-full max-w-full flex-col gap-2 !items-stretch !justify-start",
            button:
              "flex min-h-11 w-full max-w-none cursor-pointer items-center justify-center rounded-xl border border-royal-gold/50 bg-royal-gold px-4 py-2.5 text-sm font-semibold text-royal-brown shadow-sm transition hover:brightness-95 data-[state=ready]:bg-royal-gold data-[state=uploading]:bg-royal-gold/85 data-[state=readying]:bg-royal-gold/70 data-[state=disabled]:opacity-60",
            allowedContent: "h-auto min-h-[1.5rem] w-full whitespace-normal px-1 py-1 text-center text-[11px] leading-snug text-royal-brown/70 sm:text-xs",
          }}
          content={{
            button: ({ isUploading }) => {
              if (isUploading) return t("saving");
              return hasImage ? t("replaceCoverPhoto") : t("coverPhotoUpload");
            },
            allowedContent: () => t("coverPhotoUploadLimits"),
          }}
          onClientUploadComplete={(files) => {
            const next = pickUrl(files as ClientFile[]);
            if (!next) return;
            const previous = url;
            onUrlChange(next);
            if (onPersist) {
              void onPersist(next).catch(() => {
                onUrlChange(previous);
                onUploadError();
              });
            }
          }}
          onUploadError={onUploadError}
        />
      </div>
    </div>
  );
}
