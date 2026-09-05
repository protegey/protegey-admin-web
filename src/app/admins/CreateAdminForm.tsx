"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createAdminAction, type CreateAdminState } from "./actions";

const initialState: CreateAdminState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Sending invitation…" : "Invite administrator"}
    </button>
  );
}

export function CreateAdminForm() {
  const [state, formAction] = useActionState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Invite a new administrator</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          name="firstName"
          type="text"
          placeholder="First name"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last name"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          name="email"
          type="email"
          placeholder="Email address"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-primary">Invitation sent — they&apos;ll receive an email to set up their account.</p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
