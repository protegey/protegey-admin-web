"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createPartnerAction, type CreatePartnerState } from "./actions";

const initialState: CreatePartnerState = {};

const PARTNER_TYPES = [
  { value: "fintech", label: "Fintech" },
  { value: "bank", label: "Bank" },
  { value: "telco", label: "Telco" },
  { value: "regulator", label: "Regulator" },
  { value: "other", label: "Other" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Creating partner…" : "Create partner & send invitation"}
    </button>
  );
}

const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

export function CreatePartnerForm() {
  const [state, formAction] = useActionState(createPartnerAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Create a new partner</h2>
        <p className="text-xs text-muted-foreground">
          The admin you name below will receive an email to set their password and sign in to the partner portal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" type="text" placeholder="Partner name" required className={inputClass} />
        <select name="type" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Partner type
          </option>
          {PARTNER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input name="contactEmail" type="email" placeholder="Contact email (optional)" className={inputClass} />
        <input name="contactPhone" type="text" placeholder="Contact phone (optional)" className={inputClass} />
        <input name="country" type="text" placeholder="Country code, e.g. GN (optional)" className={inputClass} />
        <input name="description" type="text" placeholder="Description (optional)" className={inputClass} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Partner administrator</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input name="adminFirstName" type="text" placeholder="First name" required className={inputClass} />
          <input name="adminLastName" type="text" placeholder="Last name" required className={inputClass} />
          <input name="adminEmail" type="email" placeholder="Email address" required className={inputClass} />
        </div>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-primary">
          Partner created — the administrator will receive an email to set up their account.
        </p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
