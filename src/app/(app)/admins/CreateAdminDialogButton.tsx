"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { CreateAdminForm } from "./CreateAdminForm";
import type { AssignableRole } from "./page";

export function CreateAdminDialogButton({ roles }: { roles: AssignableRole[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" />
        Invite administrator
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a new administrator"
        description="They'll receive an email to set their password and sign in to the admin panel."
      >
        <CreateAdminForm roles={roles} onSuccess={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
