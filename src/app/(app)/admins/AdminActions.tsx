"use client";

import { useState } from "react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { useLang } from "@/lib/i18n/LangProvider";
import { sendAdminPasswordResetAction } from "./actions";

export function AdminActions({ userId }: { userId: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    const result = await sendAdminPasswordResetAction(userId);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSent(false);
          setError(null);
          setOpen(true);
        }}
        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        {t("adminsResetPasswordButton")}
      </button>

      <ConfirmActionDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={t("adminsResetPasswordConfirmTitle")}
        description={t("adminsResetPasswordConfirmDescription")}
        confirmLabel={t("adminsResetPasswordConfirmLabel")}
        pendingLabel={t("sendingEllipsis")}
        pending={pending}
        confirmDisabled={sent}
      >
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {sent ? <p className="text-sm text-primary">{t("adminsResetPasswordSentMessage")}</p> : null}
      </ConfirmActionDialog>
    </>
  );
}
