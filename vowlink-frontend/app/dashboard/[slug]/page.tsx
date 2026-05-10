"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  apiClient,
  type AdminInviteDashboardResponse,
  type RsvpDashboardPayload,
} from "@/lib/apiClient";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type TFn = (key: TranslationKey) => string;

export default function InvitationDashboardPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const decodedSlug = slug ? decodeURIComponent(slug) : "";
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupleNames, setCoupleNames] = useState("");
  const [stats, setStats] = useState<RsvpDashboardPayload["stats"] | null>(null);
  const [guests, setGuests] = useState<RsvpDashboardPayload["guests"]>([]);
  const [rsvpPanel, setRsvpPanel] = useState<null | "attendance">(null);

  useEffect(() => {
    if (!decodedSlug) {
      setLoading(false);
      setError(t("genericError"));
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data: AdminInviteDashboardResponse = await apiClient.getDashboardStats(decodedSlug);
        if (cancelled) return;
        setCoupleNames(String(data.invitation?.coupleNames ?? ""));
        setStats(data.stats);
        setGuests(
          data.guests.map((g) => ({
            ...g,
            _id: String((g as { _id?: unknown })._id ?? ""),
            attendanceStatus: g.attendanceStatus as RsvpDashboardPayload["guests"][0]["attendanceStatus"],
          })),
        );
      } catch {
        if (!cancelled) setError(t("failedLoadDashboard"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [decodedSlug, t]);

  const rsvpPayload: RsvpDashboardPayload | null =
    stats && guests
      ? {
          stats,
          guests,
        }
      : null;

  return (
    <main className="min-h-dvh bg-royal-cream px-4 py-10 text-royal-brown sm:px-6 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-balance text-xl font-semibold sm:text-2xl">{t("invitationDashboardPageTitle")}</h1>
          {coupleNames ? <p className="text-lg font-medium text-royal-brown">{coupleNames}</p> : null}
          <p className="break-all font-mono text-sm text-royal-brown/75">/{decodedSlug}</p>
        </header>

        {loading ? (
          <p className="text-sm">{t("saving")}</p>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">{error}</p>
        ) : rsvpPayload ? (
          <section className="space-y-4 rounded-2xl border border-royal-gold/30 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t("rsvpDashboard")}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatCard label={t("totalGuests")} value={rsvpPayload.stats.totalGuests} />
              <StatCard
                label={t("coming")}
                value={rsvpPayload.stats.comingGuests}
                interactive
                active={rsvpPanel === "attendance"}
                onClick={() => setRsvpPanel((p) => (p === "attendance" ? null : "attendance"))}
              />
              <StatCard label={t("notComing")} value={rsvpPayload.stats.notComingGuests} />
              <StatCard label={t("pending")} value={rsvpPayload.stats.pendingGuests} />
            </div>
            {rsvpPanel === "attendance" ? (
              <RsvpAttendanceDetail guests={rsvpPayload.guests} onClose={() => setRsvpPanel(null)} t={t} />
            ) : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                className="rounded-xl border border-royal-brown/30 px-4 py-2 text-sm"
                onClick={() =>
                  window.open(apiClient.buildExportDashboardUrl(decodedSlug), "_blank", "noopener,noreferrer")
                }
              >
                {t("exportExcel")}
              </button>
              <Link
                href={`/${encodeURIComponent(decodedSlug)}`}
                className="inline-flex min-h-11 items-center rounded-xl bg-royal-gold px-4 py-2 text-sm font-medium text-royal-brown"
              >
                {t("openPublicInvitation")}
              </Link>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-royal-gold hover:underline">
            {t("backToHome")}
          </Link>
          <Link href="/platform" className="text-royal-gold hover:underline">
            {t("openPlatformPortal")}
          </Link>
        </div>
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

