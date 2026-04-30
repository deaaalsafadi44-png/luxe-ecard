"use client";

import {
  INVITATION_THEME_IDS,
  INVITATION_THEME_PALETTES,
  type InvitationThemeId,
} from "@/lib/invitationThemes";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const THEME_LABEL_KEYS: Record<InvitationThemeId, TranslationKey> = {
  royal: "themeRoyal",
  sage: "themeSage",
  midnight: "themeMidnight",
  blush: "themeBlush",
  ivory: "themeIvory",
};

export function InvitationThemePicker({
  value,
  onChange,
  disabled,
}: {
  value: InvitationThemeId;
  onChange: (next: InvitationThemeId) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-royal-brown">{t("invitationThemeLabel")}</p>
      <p className="text-xs text-royal-brown/70">{t("invitationThemeHint")}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INVITATION_THEME_IDS.map((id) => {
          const p = INVITATION_THEME_PALETTES[id];
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(id)}
              className={`flex flex-col gap-2 rounded-2xl border p-2.5 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold focus-visible:ring-offset-2 disabled:opacity-50 ${
                selected
                  ? "border-royal-gold bg-royal-cream/40 ring-2 ring-royal-gold/50"
                  : "border-royal-gold/25 bg-white/80 hover:border-royal-gold/45"
              }`}
            >
              <div
                className="h-14 w-full rounded-xl shadow-inner ring-1 ring-black/5"
                style={{
                  background: `linear-gradient(135deg, ${p.cream} 0%, ${p.gold} 45%, ${p.brown} 100%)`,
                }}
                aria-hidden
              />
              <span className="text-xs font-medium text-royal-brown">
                {t(THEME_LABEL_KEYS[id])}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
