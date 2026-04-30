"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { savePlatformAuth } from "@/lib/authStorage";
import { useI18n } from "@/lib/i18n";

export default function PlatformLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const result = await apiClient.login(email, password);
      if (result.user.role !== "PLATFORM_ADMIN") {
        setError(t("genericError"));
        return;
      }
      savePlatformAuth(result);
      router.push("/platform");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-royal-cream px-4 py-10 text-royal-brown sm:px-6 md:px-8">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-royal-gold/30 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-balance text-xl font-semibold sm:text-2xl">{t("platformLoginTitle")}</h1>
        <p className="mt-2 text-pretty text-sm text-royal-brown/80">{t("platformIntro")}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">{t("emailLabel")}</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 min-h-11 w-full rounded-xl border px-4 py-2.5 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t("passwordLabel")}</label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 min-h-11 w-full rounded-xl border px-4 py-2.5 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="min-h-11 w-full rounded-xl bg-royal-brown px-4 py-2.5 text-base font-medium text-royal-cream active:opacity-90"
          >
            {t("signIn")}
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-royal-gold hover:underline">
          {t("backToHome")}
        </Link>
      </section>
    </main>
  );
}
