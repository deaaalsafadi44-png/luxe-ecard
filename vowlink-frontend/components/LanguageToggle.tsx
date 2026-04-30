"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  const onToggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <button
      type="button"
      onClick={onToggleLanguage}
      className="fixed end-4 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-50 flex touch-target items-center gap-2 rounded-full border border-royal-gold/40 bg-white/95 px-4 py-2 text-sm font-medium text-royal-brown shadow-md backdrop-blur-sm"
      title={t("switchLanguage")}
      aria-label={t("switchLanguage")}
    >
      <span aria-hidden>🌐</span>
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
