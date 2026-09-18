"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { useLang } from "@/lib/i18n/LangProvider";
import { CreateAdminForm } from "./CreateAdminForm";
import type { AssignableRole } from "./page";

export function CreateAdminDialogButton({ roles }: { roles: AssignableRole[] }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        {t("adminsInviteButton")}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("adminsInviteDialogTitle")}
        description={t("adminsInviteDialogDescription")}
      >
        <CreateAdminForm roles={roles} onSuccess={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
