"use client";

// Подписка на рассылку в подвале. Почту сохраняет сервер (subscribeToNewsletter), письма пока не отправляем.

import Image from "next/image";
import { useActionState } from "react";
import { subscribeToNewsletter, type PublicFormState } from "@/app/actions/forms";

export function NewsletterForm() {
  const [state, action, isSending] = useActionState<PublicFormState, FormData>(subscribeToNewsletter, {});

  if (state.ok) {
    return (
      <p role="status" className="text-base font-medium text-cream">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-5">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          defaultValue={state.values?.email}
          placeholder="your@email.com"
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "newsletter-error" : undefined}
          className="h-[47px] min-w-0 flex-1 rounded-[7px] border border-cream/30 bg-transparent px-[25px] text-base font-medium text-cream placeholder:text-cream/30 focus:border-cream/60 focus:outline-none aria-invalid:border-accent-light"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={isSending}
          className="flex h-[47px] w-[82px] shrink-0 items-center justify-center rounded-[7px] border border-cream/15 transition-colors hover:border-cream/40 disabled:opacity-50"
        >
          {/* Стрелка вниз, повёрнутая на 270°, — смотрит вправо */}
          <Image
            src="/images/icon-arrow-light.svg"
            alt=""
            width={25}
            height={25}
            className="rotate-270"
          />
        </button>
      </div>
      {state.error && (
        <p id="newsletter-error" role="alert" className="text-sm font-medium text-accent-light">
          {state.error}
        </p>
      )}
    </form>
  );
}
