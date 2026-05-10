"use client";

import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";

type StatusType = "COMING" | "NOT_COMING" | "PENDING";

export function RsvpForm({
  invitationSlug,
  guestSlug,
  initialStatus,
  onRsvpSuccess,
}: {
  invitationSlug: string;
  guestSlug: string;
  initialStatus: StatusType;
  onRsvpSuccess?: () => void;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<StatusType>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const onSubmitRsvp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      await apiClient.updateRsvp(invitationSlug, guestSlug, status);
      setFeedbackMessage(t("rsvpUpdated"));
      onRsvpSuccess?.();
    } catch {
      setFeedbackMessage(t("rsvpFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitRsvp}
      className="mt-0 space-y-4 rounded-2xl border border-royal-gold/25 bg-white/90 p-5 shadow-inner shadow-royal-gold/5 backdrop-blur-sm transition-shadow focus-within:shadow-md sm:p-6"
    >
      <h3 className="text-lg font-semibold sm:text-xl">{t("rsvp")}</h3>
      <div>
        <label className="mb-2 block text-sm font-medium">{t("attendance")}</label>
        <select
          className="min-h-11 w-full rounded-xl border border-royal-brown/20 bg-royal-cream px-4 py-2.5 text-base"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusType)}
        >
          <option value="COMING">{t("coming")}</option>
          <option value="NOT_COMING">{t("notComing")}</option>
          <option value="PENDING">{t("pending")}</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 w-full rounded-xl bg-royal-gold px-5 py-2.5 text-base font-medium text-royal-brown shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? t("saving") : t("saveRsvp")}
      </button>

      {feedbackMessage ? <p className="text-sm">{feedbackMessage}</p> : null}
    </form>
  );
}
