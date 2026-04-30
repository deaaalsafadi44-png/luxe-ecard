"use client";

import { UploadThingButton } from "@/components/UploadThingButton";
import { useI18n } from "@/lib/i18n";

type ClientFile = { ufsUrl?: string; url?: string };

const MAX_BG = 12;

function fileUrl(file: ClientFile | undefined): string | undefined {
  if (!file) return undefined;
  if ("ufsUrl" in file && file.ufsUrl) return String(file.ufsUrl);
  if ("url" in file && file.url) return String(file.url);
  return undefined;
}

function urlsFromUploadFiles(files: ClientFile[] | undefined): string[] {
  if (!files?.length) return [];
  const out: string[] = [];
  for (const f of files) {
    const u = fileUrl(f);
    if (u) out.push(u);
  }
  return out;
}

export function ExperienceBackgroundUploadField({
  urls,
  onUrlsChange,
  onUploadError,
  onPersist,
}: {
  urls: string[];
  onUrlsChange: (next: string[]) => void;
  onUploadError: () => void;
  onPersist?: (next: string[]) => Promise<void>;
}) {
  const { t } = useI18n();
  const remaining = MAX_BG - urls.length;
  const canAddMore = remaining > 0;

  const removeAt = (index: number) => {
    const previous = urls;
    const next = urls.filter((_, i) => i !== index);
    onUrlsChange(next);
    if (onPersist) {
      void onPersist(next).catch(() => {
        onUrlsChange(previous);
        onUploadError();
      });
    }
  };

  return (
    <div className="space-y-3">
      {urls.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="overflow-hidden rounded-xl border border-royal-gold/25 bg-royal-cream/30 shadow-sm"
            >
              <div className="relative aspect-square w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="border-t border-royal-gold/15 bg-white/95 p-2">
                <button
                  type="button"
                  className="w-full rounded-lg border border-red-200/80 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
                  onClick={() => removeAt(index)}
                >
                  {t("remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {canAddMore ? (
        <div className="rounded-xl border border-royal-gold/25 bg-white p-3 sm:p-4">
          <UploadThingButton
            endpoint="experienceBgPhotos"
            className="w-full max-w-full !flex-col !items-stretch !gap-2 [&_[data-ut-element=button]]:!h-auto [&_[data-ut-element=button]]:!w-full [&_[data-ut-element=button]]:!max-w-none"
            appearance={{
              container:
                "w-full max-w-full flex-col gap-2 !items-stretch !justify-start",
              button:
                "flex min-h-11 w-full max-w-none cursor-pointer items-center justify-center rounded-xl border border-royal-gold/50 bg-royal-gold px-4 py-2.5 text-sm font-semibold text-royal-brown shadow-sm transition hover:brightness-95 data-[state=ready]:bg-royal-gold data-[state=uploading]:bg-royal-gold/85 data-[state=readying]:bg-royal-gold/70 data-[state=disabled]:opacity-60",
              allowedContent:
                "h-auto min-h-[1.5rem] w-full whitespace-normal px-1 py-1 text-center text-[11px] leading-snug text-royal-brown/70 sm:text-xs",
            }}
            content={{
              button: ({ isUploading }) => {
                if (isUploading) return t("saving");
                return t("uploadGalleryPhotos");
              },
              allowedContent: () => t("galleryUploadLimits"),
            }}
            onClientUploadComplete={(files) => {
              const added = urlsFromUploadFiles(files as ClientFile[]);
              if (!added.length) return;
              const previous = urls;
              const merged = [...urls, ...added].slice(0, MAX_BG);
              onUrlsChange(merged);
              if (onPersist) {
                void onPersist(merged).catch(() => {
                  onUrlsChange(previous);
                  onUploadError();
                });
              }
            }}
            onUploadError={onUploadError}
          />
        </div>
      ) : (
        <p className="text-xs text-royal-brown/70">{t("galleryMaxReached")}</p>
      )}
    </div>
  );
}
