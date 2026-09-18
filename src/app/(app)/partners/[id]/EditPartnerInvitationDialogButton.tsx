"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { RoleMultiSelect } from "@/components/RoleMultiSelect";
import { useLang } from "@/lib/i18n/LangProvider";
import {
  updatePartnerInvitationAction,
  type AssignableRole,
  type PendingInvitation,
  type UpdateInvitationState,
} from "../team-actions";

const initialState: UpdateInvitationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? t("savingEllipsis") : t("saveChangesButton")}
    </button>
  );
}

export function EditPartnerInvitationDialogButton({
  partnerId,
  invitation,
  roles,
}: {
  partnerId: string;
  invitation: PendingInvitation;
  roles: AssignableRole[];
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const action = updatePartnerInvitationAction.bind(null, partnerId, invitation.id);
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      const timeout = setTimeout(() => setOpen(false), 800);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Pencil className="size-3" />
        {t("editButton")}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("editInvitationDialogTitle")}
        description={t("editInvitationDialogDescription")}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="firstName"
              type="text"
              placeholder={t("firstNamePlaceholder")}
              defaultValue={invitation.firstName}
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              name="lastName"
              type="text"
              placeholder={t("lastNamePlaceholder")}
              defaultValue={invitation.lastName}
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              defaultValue={invitation.email}
              required
              className="sm:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("rolesLabel")}</p>
            <RoleMultiSelect roles={roles} defaultSelectedNames={invitation.roles.map((role) => role.name)} />
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-primary">{t("savedMessage")}</p> : null}

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </Dialog>
    </>
  );
}
