"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/Dialog";
import { CountrySelect } from "@/components/CountrySelect";
import { createPartnerAction, updatePartnerAction, type PartnerFormState } from "./actions";

const PARTNER_TYPES = [
  { value: "fintech", label: "Fintech" },
  { value: "bank", label: "Bank" },
  { value: "telco", label: "Telco" },
  { value: "regulator", label: "Regulator" },
  { value: "other", label: "Other" },
];

const PARTNER_PLANS = [
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const CONTACT_ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "coo", label: "COO" },
  { value: "head_of_risk_and_compliance", label: "Head of Risk and Compliance" },
  { value: "other", label: "Other (specify)" },
];

export interface EditablePartner {
  id: string;
  name: string;
  type: string;
  plan: string;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  description: string | null;
}

const initialState: PartnerFormState = {};
const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function PartnerFormDialog({
  open,
  onClose,
  partner,
}: {
  open: boolean;
  onClose: () => void;
  /** null = create mode, otherwise editing this partner. */
  partner: EditablePartner | null;
}) {
  const router = useRouter();
  const isEditMode = partner !== null;
  const action = isEditMode ? updatePartnerAction.bind(null, partner.id) : createPartnerAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [adminRole, setAdminRole] = useState("");

  useEffect(() => {
    if (state.success) {
      toast.success(isEditMode ? "Partner updated." : "Partner created — the administrator will receive an email to set up their account.");
      formRef.current?.reset();
      router.refresh();
      onClose();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit partner" : "Create a new partner"}
      description={
        isEditMode
          ? undefined
          : "The admin you name below will receive an email to set their password and sign in to the partner portal."
      }
    >
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        {isEditMode ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="name"
              type="text"
              placeholder="Partner name"
              defaultValue={partner.name}
              required
              className={inputClass}
            />
            <select name="type" required defaultValue={partner.type} className={inputClass}>
              <option value="" disabled>
                Partner type
              </option>
              {PARTNER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select name="plan" defaultValue={partner.plan ?? "starter"} className={inputClass}>
              {PARTNER_PLANS.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label}
                </option>
              ))}
            </select>
            <CountrySelect name="country" defaultValue={partner.country} />
            <input
              name="contactEmail"
              type="email"
              placeholder="Contact email (optional)"
              defaultValue={partner.contactEmail ?? undefined}
              className={inputClass}
            />
            <input
              name="contactPhone"
              type="text"
              placeholder="Contact phone (optional)"
              defaultValue={partner.contactPhone ?? undefined}
              className={inputClass}
            />
            <input
              name="description"
              type="text"
              placeholder="Description (optional)"
              defaultValue={partner.description ?? undefined}
              className={`sm:col-span-2 ${inputClass}`}
            />
          </div>
        ) : (
          <>
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">Institutional information</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input name="name" type="text" placeholder="Name" required className={inputClass} />
                <select name="type" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    Sector
                  </option>
                  {PARTNER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <CountrySelect name="country" />
                <input
                  name="description"
                  type="text"
                  placeholder="Description"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Primary contact person</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input name="adminFirstName" type="text" placeholder="First name" required className={inputClass} />
                <input name="adminLastName" type="text" placeholder="Last name" required className={inputClass} />
                <input name="adminEmail" type="email" placeholder="Email" required className={inputClass} />
                <input name="adminPhone" type="text" placeholder="Phone" required className={inputClass} />
                <select
                  name="adminRole"
                  required
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Role
                  </option>
                  {CONTACT_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {adminRole === "other" ? (
                  <input
                    name="adminRoleOther"
                    type="text"
                    placeholder="Specify role"
                    required
                    className={inputClass}
                  />
                ) : null}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <SubmitButton
            label={isEditMode ? "Save changes" : "Create partner & send invitation"}
            pendingLabel={isEditMode ? "Saving…" : "Creating partner…"}
          />
        </div>
      </form>
    </Dialog>
  );
}
