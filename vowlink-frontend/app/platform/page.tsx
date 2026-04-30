"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BrandInlineLogo } from "@/components/BrandLogo";
import {
  apiClient,
  type InvitationStatus,
  type PlatformInvitationRow,
} from "@/lib/apiClient";
import {
  clearPlatformAuth,
  readPlatformAuth,
  type StoredAuthPayload,
} from "@/lib/authStorage";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export default function PlatformDashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [auth, setAuth] = useState<StoredAuthPayload | null>(null);
  const [invitations, setInvitations] = useState<PlatformInvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [allowCreateInvitation, setAllowCreateInvitation] = useState(false);

  const load = useCallback(async () => {
    const session = readPlatformAuth();
    if (!session) {
      router.replace("/platform/login");
      return;
    }
    setAuth(session);
    setLoading(true);
    setFeedback(null);
    try {
      const rows = await apiClient.platformListInvitations(session.token);
      setInvitations(rows);
    } catch {
      setFeedback(t("genericError"));
      clearPlatformAuth();
      router.replace("/platform/login");
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const logout = () => {
    clearPlatformAuth();
    router.push("/platform/login");
  };

  const saveRow = async (row: PlatformInvitationRow, next: InvitationStatus) => {
    if (!auth) return;
    setFeedback(null);
    try {
      const updated = await apiClient.platformPatchInvitation(auth.token, row.slug, {
        status: next,
      });
      setInvitations((prev) =>
        prev.map((item) => (item.slug === updated.slug ? { ...item, ...updated } : item)),
      );
      setFeedback(t("invitationSaved"));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  const deleteRow = async (row: PlatformInvitationRow) => {
    if (!auth) return;
    setFeedback(null);
    try {
      await apiClient.platformDeleteInvitation(auth.token, row.slug);
      setInvitations((prev) => prev.filter((item) => item._id !== row._id));
      setFeedback(t("invitationDeleted"));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  const createCouple = async () => {
    if (!auth) return;
    if (!allowCreateInvitation && !createSlug.trim()) {
      setFeedback(t("genericError"));
      return;
    }
    setFeedback(null);
    try {
      await apiClient.platformCreateCoupleAccount(auth.token, {
        email: createEmail,
        password: createPassword,
        invitationSlug: allowCreateInvitation ? "" : createSlug.trim(),
        allowCreateInvitation,
      });
      setFeedback(t("accountCreatedSuccess"));
      setCreateEmail("");
      setCreatePassword("");
      setCreateSlug("");
      setAllowCreateInvitation(false);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t("genericError"));
    }
  };

  if (!auth && loading) {
    return (
      <main className="min-h-dvh bg-royal-cream px-4 py-10 text-royal-brown">
        <p className="text-center">{t("saving")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-royal-cream px-4 py-8 text-royal-brown sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <BrandInlineLogo className="mb-2" />
            <h1 className="text-balance text-xl font-semibold sm:text-2xl">{t("platformDashboardTitle")}</h1>
            <p className="mt-1 break-all text-sm text-royal-brown/80">{auth?.user.email}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              className="min-h-11 rounded-xl border border-royal-brown/30 px-4 py-2.5 text-sm sm:min-h-0"
              onClick={() => void load()}
            >
              {t("loadStats")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-royal-brown px-4 py-2.5 text-sm text-royal-cream sm:min-h-0"
              onClick={logout}
            >
              {t("signOut")}
            </button>
          </div>
        </header>

        {feedback ? (
          <p className="rounded-xl border border-royal-gold/40 bg-white px-4 py-2 text-sm">{feedback}</p>
        ) : null}

        <section className="rounded-2xl border border-royal-gold/30 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">{t("invitationsHeading")}</h2>
          {loading ? (
            <p className="mt-4 text-sm">{t("saving")}</p>
          ) : invitations.length === 0 ? (
            <p className="mt-4 text-sm">{t("noInvitationsYet")}</p>
          ) : (
            <>
              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-royal-gold/15 md:block">
                <table className="w-full min-w-[940px] border-collapse text-start text-sm">
                  <thead>
                    <tr className="border-b border-royal-gold/30">
                      <th className="py-2 pe-2">{t("slug")}</th>
                      <th className="py-2 pe-2">{t("coupleNames")}</th>
                      <th className="py-2 pe-2">{t("inviteSource")}</th>
                      <th className="py-2 pe-2">{t("invitationStatus")}</th>
                      <th className="py-2 pe-2">{t("saveChanges")}</th>
                      <th className="py-2 pe-2">{t("deleteInvitation")}</th>
                      <th className="py-2 pe-2">{t("invitationDashboardLink")}</th>
                      <th className="py-2">{t("publicPreviewLink")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((row) => (
                      <PlatformInvitationRowEditor
                        key={`${row._id}-${row.status}`}
                        row={row}
                        onSave={saveRow}
                        onDelete={deleteRow}
                        t={t}
                        variant="table"
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-4 space-y-4 md:hidden">
                {invitations.map((row) => (
                  <li key={row._id}>
                    <PlatformInvitationRowEditor
                      key={`${row._id}-${row.status}`}
                      row={row}
                      onSave={saveRow}
                      onDelete={deleteRow}
                      t={t}
                      variant="card"
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-royal-gold/30 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">{t("createCoupleAccountSection")}</h2>
          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowCreateInvitation}
              onChange={(e) => {
                setAllowCreateInvitation(e.target.checked);
                if (e.target.checked) setCreateSlug("");
              }}
            />
            <span>{t("allowCreateInvitationCheckbox")}</span>
          </label>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="min-h-11 rounded-xl border px-4 py-2.5 text-base"
              placeholder={t("emailLabel")}
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
            />
            <input
              className="min-h-11 rounded-xl border px-4 py-2.5 text-base"
              placeholder={t("passwordLabel")}
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
            />
            <input
              className="min-h-11 rounded-xl border px-4 py-2.5 text-base md:col-span-2 disabled:opacity-50"
              placeholder={t("coupleInviteSlug")}
              value={createSlug}
              disabled={allowCreateInvitation}
              onChange={(e) => setCreateSlug(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="mt-4 min-h-11 w-full rounded-xl bg-royal-gold px-4 py-2.5 font-medium text-royal-brown sm:w-auto"
            onClick={() => void createCouple()}
          >
            {t("createCoupleAccountBtn")}
          </button>
        </section>

        <Link href="/" className="text-sm text-royal-gold hover:underline">
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}

function PlatformInvitationRowEditor({
  row,
  onSave,
  onDelete,
  t,
  variant = "table",
}: {
  row: PlatformInvitationRow;
  onSave: (row: PlatformInvitationRow, status: InvitationStatus) => void;
  onDelete: (row: PlatformInvitationRow) => void | Promise<void>;
  t: (key: TranslationKey) => string;
  variant?: "table" | "card";
}) {
  const [status, setStatus] = useState<InvitationStatus>(row.status ?? "DRAFT");
  const [isDeleting, setIsDeleting] = useState(false);

  const sourceBadge = row.coupleOwnerUserId ? (
    <span className="inline-block rounded-full bg-royal-gold/25 px-2 py-0.5 text-xs font-medium">
      {t("coupleCreatedBadge")}
    </span>
  ) : (
    "—"
  );

  const statusSelect = (
    <select
      className="min-h-11 w-full max-w-full rounded-lg border px-3 py-2 text-sm md:max-w-[160px] md:min-h-0 md:py-1"
      value={status}
      disabled={isDeleting}
      onChange={(e) => setStatus(e.target.value as InvitationStatus)}
    >
      <option value="DRAFT">{t("statusDraft")}</option>
      <option value="PUBLISHED">{t("statusPublished")}</option>
      <option value="DISABLED">{t("statusDisabled")}</option>
    </select>
  );

  const saveButton = (
    <button
      type="button"
      className="min-h-11 w-full rounded-lg bg-royal-brown px-3 py-2 text-sm text-royal-cream md:min-h-0 md:w-auto md:py-1.5"
      onClick={() => onSave(row, status)}
      disabled={isDeleting}
    >
      {t("saveChanges")}
    </button>
  );

  const deleteButton = (
    <button
      type="button"
      className="min-h-11 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-800 hover:bg-red-50 md:min-h-0 md:w-auto md:py-1.5"
      disabled={isDeleting}
      onClick={() => {
        if (!window.confirm(t("deleteInvitationConfirm"))) return;
        setIsDeleting(true);
        void Promise.resolve(onDelete(row)).finally(() => setIsDeleting(false));
      }}
    >
      {isDeleting ? t("saving") : t("deleteInvitation")}
    </button>
  );

  const dashboardLink = (
    <Link
      className="inline-block min-h-11 break-all text-royal-gold underline md:min-h-0"
      href={`/dashboard/${encodeURIComponent(row.slug)}`}
    >
      /dashboard/{row.slug}
    </Link>
  );

  const previewLink = (
    <Link
      className="inline-block min-h-11 break-all text-royal-gold underline md:min-h-0"
      href={`/${encodeURIComponent(row.slug)}`}
    >
      /{row.slug}
    </Link>
  );

  if (variant === "card") {
    return (
      <article className="rounded-2xl border border-royal-gold/25 bg-royal-cream/50 p-4 shadow-sm">
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-royal-gold">{t("slug")}</p>
            <p className="break-all font-mono text-xs">{row.slug}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-royal-gold">{t("coupleNames")}</p>
            <p className="font-medium">{row.coupleNames}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-royal-gold">{t("inviteSource")}</p>
            <div className="mt-0.5">{sourceBadge}</div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-royal-gold">
              {t("invitationStatus")}
            </p>
            {statusSelect}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {saveButton}
            {deleteButton}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-royal-gold">
              {t("invitationDashboardLink")}
            </p>
            {dashboardLink}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-royal-gold">
              {t("publicPreviewLink")}
            </p>
            {previewLink}
          </div>
        </div>
      </article>
    );
  }

  return (
    <tr className="border-b border-royal-gold/10 align-top">
      <td className="py-3 pe-2 font-mono text-xs">{row.slug}</td>
      <td className="py-3 pe-2">{row.coupleNames}</td>
      <td className="py-3 pe-2">{sourceBadge}</td>
      <td className="py-3 pe-2">{statusSelect}</td>
      <td className="py-3 pe-2">{saveButton}</td>
      <td className="py-3 pe-2">{deleteButton}</td>
      <td className="py-3 pe-2">{dashboardLink}</td>
      <td className="py-3">{previewLink}</td>
    </tr>
  );
}
