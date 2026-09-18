"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { RoleMultiSelect } from "@/components/RoleMultiSelect";
import { useLang } from "@/lib/i18n/LangProvider";
import { createAdminAction, type CreateAdminState } from "./actions";
import type { AssignableRole } from "./page";

const initialState: CreateAdminState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? t("adminsSendingInvitationEllipsis") : t("adminsInviteButton")}
    </button>
  );
}

export function CreateAdminForm({ roles, onSuccess }: { roles: AssignableRole[]; onSuccess?: () => void }) {
  const { t } = useLang();
  const router = useRouter();
  const [state, formAction] = useActionState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
      const timeout = setTimeout(() => onSuccess?.(), 1000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="firstName"
          type="text"
          placeholder={t("firstNamePlaceholder")}
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="lastName"
          type="text"
          placeholder={t("lastNamePlaceholder")}
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          required
          className="sm:col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t("rolesLabel")}</p>
        <RoleMultiSelect roles={roles} defaultSelectedNames={["admin"]} />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-primary">{t("adminsInviteSuccessMessage")}</p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
