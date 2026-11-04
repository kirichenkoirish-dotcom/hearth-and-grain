"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "@/app/account/actions";
import { FormField, inputClass } from "@/components/account/form-field";

// «My details»: имя и телефон. Потом они сами подставятся при оформлении заказа.
export function ProfileForm({
  email,
  fullName,
  phone,
}: {
  email: string;
  fullName: string | null;
  phone: string | null;
}) {
  const [state, action, isSaving] = useActionState<FormState, FormData>(updateProfile, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="profile-name" error={state.fieldErrors?.full_name}>
          <input
            id="profile-name"
            name="full_name"
            autoComplete="name"
            defaultValue={state.values?.full_name ?? fullName ?? ""}
            placeholder="Your name"
            aria-invalid={Boolean(state.fieldErrors?.full_name)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Phone" htmlFor="profile-phone" error={state.fieldErrors?.phone}>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={state.values?.phone ?? phone ?? ""}
            placeholder="+48 600 000 000"
            aria-invalid={Boolean(state.fieldErrors?.phone)}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="profile-email" hint="You sign in with this email.">
        <input id="profile-email" value={email} readOnly className={`${inputClass} text-black/50`} />
      </FormField>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-roast font-display rounded-full px-[30px] py-3 text-base leading-none font-medium tracking-[0.32px]"
        >
          {isSaving ? "Saving…" : "Save details"}
        </button>
        <p role="status" className="text-base font-medium">
          {state.ok && <span className="text-bark">Saved ✓</span>}
          {state.error && <span className="text-accent">{state.error}</span>}
        </p>
      </div>
    </form>
  );
}
